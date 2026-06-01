import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { getSocket } from '../../services/socket'
import MetaData from  "../../components/layout/MetaData"
import { Users, BookOpen, FileText, BarChart3, ArrowRight, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffDashboard() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ students: 0, materials: 0, tests: 0, results: 0 })
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)


  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/api/staff/stats').catch(() => ({ data: { stats: {} } })),
      api.get('/api/staff/materials').catch(() => ({ data: { data: [] } }))
    ]).then(([st, m]) => {
      setStats(st.data?.stats || { students: 0, materials: 0, tests: 0, results: 0 })
      setMaterials((m.data?.data || []).slice(0, 5))
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const socket = getSocket(token)
    const handleDataChanged = (type) => {
      if (['student', 'material', 'test', 'result'].includes(type)) {
        load()
      }
    }
    socket.on('data_changed', handleDataChanged)
    return () => socket.off('data_changed', handleDataChanged)
  }, [token])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const statCards = [
    { icon: Users,      color: 'sky',    label: 'Students',  value: stats.students  },
    { icon: BookOpen,   color: 'lime',   label: 'Materials', value: stats.materials },
    { icon: FileText,   color: 'amber',  label: 'Tests',     value: stats.tests     },
    { icon: TrendingUp, color: 'purple', label: 'Results',   value: stats.results   },
  ]

  const colorMap = {
    sky:    'bg-sky-400/10 text-sky-400',
    lime:   'bg-lime-300/10 text-lime-300',
    amber:  'bg-sky-300/10 text-sky-300',
    purple: 'bg-sky-400/10 text-sky-400',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-ink-500 text-sm mb-1">{greeting} 👋</p>
        <h1 className="page-title">{user?.name ?? 'Staff'}</h1>
      </div>
        <MetaData title="Staff" />
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up animate-delay-200">
        {[
          { to: '/staff/materials', label: 'Upload Material',  desc: 'Add notes, videos, files', icon: BookOpen },
          { to: '/staff/tests',     label: 'Create Test',      desc: 'Build assessments',        icon: FileText }
        ].map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to}
            className="card p-5 hover:border-lime-300/30 transition-all group flex items-center gap-4">
            <div className="w-10 h-10 bg-ink-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-ink-400 group-hover:text-lime-300 transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-ink-100 text-sm font-500">{label}</p>
              <p className="text-ink-500 text-xs">{desc}</p>
            </div>
            <ArrowRight size={15} className="text-ink-700 group-hover:text-lime-300 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent materials */}
      <div className="animate-fade-up animate-delay-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Materials</h2>
          <Link to="/staff/materials"
            className="text-lime-300 text-sm hover:text-lime-400 flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-ink-800 rounded animate-pulse" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="p-8 text-center text-ink-500 text-sm">No materials yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-ink-800">
                    {['Title', 'Department', 'Uploaded'].map(h => (
                      <th key={h}
                        className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materials?.map((m, i) => {
                    const initials = m.type?.slice(0, 2).toUpperCase() || '?'
                    return (
                      <tr key={m._id || i} className="table-row">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-ink-800 flex items-center justify-center">
                              <span className="text-ink-400 font-display font-600 text-xs">{initials}</span>
                            </div>
                            <span className="text-ink-200 truncate max-w-[140px]">{m.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-ink-500">{m.department || m.subject}</td>
                        <td className="px-5 py-3 text-ink-500 text-xs">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>



    </div>
  )
}