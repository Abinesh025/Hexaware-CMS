import { useEffect, useState } from 'react'
import { hodService } from '../../services/api'
import {
  Users, CalendarCheck, Dumbbell, ShieldAlert,
  ChevronDown, RefreshCw, CheckCircle, Trash2, Search
} from 'lucide-react'
import toast from 'react-hot-toast'

const COORDINATOR_TYPES = [
  { key: 'attendance', label: 'Attendance Coordinator', icon: CalendarCheck, color: 'lime', iconColor: 'text-lime-300', bg: 'bg-lime-400/10', border: 'border-lime-400/20' },
  { key: 'sports', label: 'Sports Coordinator', icon: Dumbbell, color: 'sky', iconColor: 'text-sky-300', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
  { key: 'discipline', label: 'Discipline Coordinator', icon: ShieldAlert, color: 'purple', iconColor: 'text-purple-300', bg: 'bg-purple-400/10', border: 'border-purple-400/20' }
]

export default function HodCoordinators() {
  const [coordinators, setCoordinators] = useState(null)
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({ attendance: '', sports: '', discipline: '' })
  const [assigning, setAssigning] = useState({ attendance: false, sports: false, discipline: false })
  const [removing, setRemoving] = useState({ attendance: false, sports: false, discipline: false })

  const loadData = () => {
    setLoading(true)
    Promise.all([hodService.getCoordinators(), hodService.getDeptStaff()])
      .then(([coordRes, staffRes]) => {
        setCoordinators(coordRes.data.data)
        setStaff(staffRes.data.data)
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load coordinator data')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleAssign = async (type) => {
    if (!selected[type]) { toast.error(`Please select a staff member for ${type} coordinator`); return }
    setAssigning(prev => ({ ...prev, [type]: true }))
    try {
      const res = await hodService.assignCoordinator(type, selected[type])
      toast.success(res.data.message)
      loadData()
      setSelected(prev => ({ ...prev, [type]: '' }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign coordinator')
    } finally {
      setAssigning(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleRemove = async (type) => {
    if (!window.confirm(`Remove the ${type} coordinator from your department?`)) return
    setRemoving(prev => ({ ...prev, [type]: true }))
    try {
      const res = await hodService.removeCoordinator(type)
      toast.success(res.data.message)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove coordinator')
    } finally {
      setRemoving(prev => ({ ...prev, [type]: false }))
    }
  }

  const currentCoordinatorId = (type) => {
    const map = { attendance: 'attendanceCoordinator', sports: 'sportsCoordinator', discipline: 'disciplineCoordinator' }
    return coordinators?.[map[type]]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-400 text-sm">Loading coordinator data…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-300 text-xs font-mono mb-3">
            ◆ HOD Panel
          </div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Coordinator Management</h1>
          <p className="text-sm text-ink-400 mt-1">
            {coordinators?.department
              ? `Managing coordinators for ${coordinators.department}`
              : 'Manage department coordinators'}
          </p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 border border-ink-800 hover:border-ink-700 text-sm text-ink-300 rounded-xl transition-all">
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Info card */}
      <div className="bg-ink-900/60 border border-ink-800 rounded-xl p-4 text-xs text-ink-400 space-y-1">
        <p className="font-semibold text-ink-300 font-mono uppercase tracking-wider mb-2">Rules</p>
        <p>• Only staff belonging to your department can be assigned as coordinators.</p>
        <p>• Each coordinator type (Attendance, Sports, Discipline) has one active assignment.</p>
        <p>• Coordinator assignments are reported to the Principal automatically.</p>
      </div>

      {/* Coordinator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-5">
        {COORDINATOR_TYPES.map(({ key, label, icon: Icon, iconColor, bg, border }) => {
          const current = currentCoordinatorId(key)
          const isAssigning = assigning[key]
          const isRemoving = removing[key]

          // Exclude current coordinator from dropdown
          const eligibleStaff = staff.filter(s => !current || String(s._id) !== String(current._id))

          return (
            <div key={key} className={`bg-ink-900 border ${current ? border : 'border-ink-800'} rounded-2xl overflow-hidden transition-all`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${iconColor}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-100 text-sm">{label}</h3>
                      {current ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <CheckCircle size={12} className="text-lime-400" />
                          <span className="text-xs text-lime-300">{current.name}</span>
                          <span className="text-xs text-ink-500 font-mono">· {current.email}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-ink-500 mt-1">Not assigned</p>
                      )}
                    </div>
                  </div>

                  {current && (
                    <button
                      onClick={() => handleRemove(key)}
                      disabled={isRemoving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 hover:border-red-400/40 text-red-400 text-xs rounded-lg transition-all disabled:opacity-50 shrink-0"
                    >
                      {isRemoving
                        ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={11} />}
                      Remove
                    </button>
                  )}
                </div>

                {/* Assign area */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {staff.length === 0 ? (
                    <p className="text-xs text-ink-500">No active staff in your department to assign.</p>
                  ) : (
                    <>
                      <div className="relative flex-1 min-w-44">
                        <select
                          id={`coord-select-${key}`}
                          value={selected[key]}
                          onChange={e => setSelected(prev => ({ ...prev, [key]: e.target.value }))}
                          className="input text-xs appearance-none pr-8"
                        >
                          <option value="">— Select staff member —</option>
                          {staff.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.name}{current && String(s._id) === String(current._id) ? ' (current)' : ''} · {s.email}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
                      </div>
                      <button
                        onClick={() => handleAssign(key)}
                        disabled={!selected[key] || isAssigning}
                        className="flex items-center gap-2 px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:bg-ink-700 disabled:text-ink-500 text-ink-950 text-xs font-bold rounded-xl transition-all"
                      >
                        {isAssigning
                          ? <span className="w-3 h-3 border-2 border-ink-950 border-t-transparent rounded-full animate-spin" />
                          : <Users size={12} />}
                        {isAssigning ? 'Assigning…' : current ? 'Reassign' : 'Assign'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
