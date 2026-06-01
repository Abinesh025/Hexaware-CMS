import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { Users, GraduationCap, BookOpen, FileText, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import MetaData from '../../components/layout/MetaData'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalStudents: 0,
    totalMaterials: 0,
    totalTests: 0,
    totalResults: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/admin/dashboard')
      .then(r => setStats(r.data.data))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to fetch dashboard stats'))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Staff',    value: stats.totalStaff,     icon: Users,        color: 'text-lime-400',   link: '/admin/staff' },
    { label: 'Total Students', value: stats.totalStudents,  icon: GraduationCap,color: 'text-sky-400',    link: '/admin/students' },
    { label: 'Materials',      value: stats.totalMaterials, icon: BookOpen,     color: 'text-violet-400', link: '/admin/materials' },
    { label: 'Tests',          value: stats.totalTests,     icon: FileText,     color: 'text-sky-300',  link: '/admin/tests' },
    { label: 'Results',        value: stats.totalResults,   icon: BarChart3,    color: 'text-sky-400',   link: '/admin/results' },
  ]

  return (
    <div className="p-6">
      <MetaData title={"Admin"} />
      <h1 className="text-xl font-semibold text-ink-100 mb-6">Dashboard</h1>

      {loading ? (
        <p className="text-ink-500 text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {cards.map(({ label, value, icon: Icon, color, link }) => (
            <Link key={label} to={link} className="bg-ink-900 border border-ink-800 rounded-xl p-4 hover:border-ink-700 hover:shadow-lg hover:shadow-ink-900/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group block">
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className={`${color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
              <p className="text-ink-500 text-xs mb-1">{label}</p>
              <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}