import { useEffect, useState } from 'react'
import { salaryService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Search, DollarSign, Edit3, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SalaryManagement() {
  const { user } = useAuth()
  const [salaries, setSalaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [newSalary, setNewSalary] = useState('')
  const [search, setSearch] = useState('')

  const isOffice = user?.role === 'admin' || user?.role === 'office_staff' || !!sessionStorage.getItem('adminToken')

  const fetchSalaries = async () => {
    setLoading(true)
    try {
      const res = await salaryService.getAll()
      setSalaries(res.data.data)
    } catch (err) {
      toast.error('Failed to load salary logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOffice) {
      fetchSalaries()
    } else {
      // If student/faculty, fetch my own
      salaryService.getMySalary()
        .then((res) => setSalaries([res.data.data]))
        .catch(() => toast.error('Failed to load salary info'))
        .finally(() => setLoading(false))
    }
  }, [])

  const handleUpdateSalary = async (e) => {
    e.preventDefault()
    if (!newSalary || newSalary < 0) {
      toast.error('Please enter a valid salary amount')
      return
    }

    try {
      await salaryService.update(editing._id, newSalary)
      toast.success('Salary updated successfully')
      setEditing(null)
      fetchSalaries()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update salary')
    }
  }

  const filtered = salaries.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.designation.toLowerCase().includes(search.toLowerCase()) ||
    s.facultyId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Salary Management</h1>
          <p className="text-sm text-ink-400">Track and adjust monthly faculty and staff base salary payrolls</p>
        </div>
      </div>

      {isOffice ? (
        <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-ink-800">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
              <input
                className="input pl-10 text-sm"
                placeholder="Search by name, ID, designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-500">
              <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Loading payroll records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-ink-400 text-xs uppercase bg-ink-950/40 border-b border-ink-800">
                  <tr>
                    <th className="px-6 py-4">Faculty ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Department & Designation</th>
                    <th className="px-6 py-4">Monthly Salary</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800/60">
                  {filtered.map((s) => (
                    <tr key={s._id} className="hover:bg-ink-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-ink-300">{s.facultyId}</td>
                      <td className="px-6 py-4 font-semibold text-ink-100">{s.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-ink-200">{s.department}</div>
                        <div className="text-xs text-ink-500">{s.designation}</div>
                      </td>
                      <td className="px-6 py-4 text-lime-300 font-bold">₹{s.salary.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setEditing(s); setNewSalary(s.salary); }}
                          className="btn-ghost p-2"
                          title="Adjust payroll"
                        >
                          <Edit3 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-ink-500">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Faculty View
        <div className="max-w-md mx-auto card p-6 border-ink-800 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-lime-400/10 flex items-center justify-center text-lime-300 mb-4 animate-bounce">
            <Award size={32} />
          </div>
          <h2 className="text-xl font-bold font-display text-ink-100">{salaries[0]?.name}</h2>
          <p className="text-xs font-mono text-ink-500 mb-2">{salaries[0]?.facultyId}</p>
          <span className="badge tag-lime mb-6">{salaries[0]?.designation} — {salaries[0]?.department}</span>

          <div className="w-full bg-ink-950/40 p-4 border border-ink-800 rounded-xl mb-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Monthly Base Pay:</span>
              <span className="font-bold text-lime-300 text-lg">₹{salaries[0]?.salary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Salary Status:</span>
              <span className="text-ink-200">Processed</span>
            </div>
            <div className="flex justify-between border-t border-ink-800/40 pt-2">
              <span className="text-ink-500">Joining Date:</span>
              <span className="text-ink-300 font-mono text-xs">
                {salaries[0]?.joiningDate ? new Date(salaries[0].joiningDate).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Adjust payroll Modal */}
      {editing && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 w-full max-w-sm mx-auto">
            <h2 className="text-xl font-bold font-display text-ink-150 mb-2">Adjust payroll</h2>
            <p className="text-xs text-ink-400 mb-4">Set monthly base pay for <span className="font-semibold text-ink-100">{editing.name}</span></p>
            <form onSubmit={handleUpdateSalary} className="space-y-4">
              <div>
                <label className="label">Monthly Base Salary (₹)</label>
                <input
                  type="number"
                  min={0}
                  className="input font-semibold text-lg"
                  value={newSalary}
                  onChange={(e) => setNewSalary(Number(e.target.value))}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Update Pay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
