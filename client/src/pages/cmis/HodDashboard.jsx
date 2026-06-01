import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { reportsService } from '../../services/api'
import { BookOpen, CheckCircle, BarChart2, ShieldAlert, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function HodDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportsService.getSummary()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load HOD metrics'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-ink-50">HOD Administrative Center</h1>
        <p className="text-sm text-ink-400">Welcome back, Head of {user?.department || 'Department'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 border-ink-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-300">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Department Students</p>
            <p className="text-2xl font-bold text-ink-50">{stats?.counts?.students || 0}</p>
          </div>
        </div>

        <div className="card p-6 border-ink-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-400/10 flex items-center justify-center text-sky-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Attendance Index</p>
            <p className="text-2xl font-bold text-ink-50">{stats?.attendance?.overallPercentage || 0}%</p>
          </div>
        </div>

        <div className="card p-6 border-ink-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-350">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Fees Collected</p>
            <p className="text-2xl font-bold text-ink-50">₹{stats?.fees?.collected?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-ink-800">
          <h3 className="font-display font-bold text-lg text-ink-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/courses" className="p-4 rounded-xl border border-ink-800 hover:border-lime-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all text-center">
              <span className="block font-semibold text-ink-200">Course Management</span>
              <span className="text-xs text-ink-500">Add & assign courses</span>
            </Link>
            <Link to="/marks" className="p-4 rounded-xl border border-ink-800 hover:border-lime-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all text-center">
              <span className="block font-semibold text-ink-200">Approve Grades</span>
              <span className="text-xs text-ink-500">HOD sessional signoff</span>
            </Link>
            <Link to="/attendance" className="p-4 rounded-xl border border-ink-800 hover:border-lime-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all text-center">
              <span className="block font-semibold text-ink-200">Attendance Approval</span>
              <span className="text-xs text-ink-500">Track logs & stats</span>
            </Link>
            <Link to="/analytics" className="p-4 rounded-xl border border-ink-800 hover:border-lime-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all text-center">
              <span className="block font-semibold text-ink-200">Department Analytics</span>
              <span className="text-xs text-ink-500">Inspect performance charts</span>
            </Link>
            <Link to="/hod/coordinators" className="p-4 rounded-xl border border-ink-800 hover:border-purple-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all text-center sm:col-span-2">
              <span className="flex items-center justify-center gap-2 font-semibold text-ink-200">
                <Users size={15} className="text-purple-400" />
                Coordinator Management
              </span>
              <span className="text-xs text-ink-500">Assign attendance, sports & discipline coordinators</span>
            </Link>
          </div>
        </div>

        <div className="card p-6 border-ink-800 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-ink-100 mb-3">Staff & Activities</h3>
            <p className="text-sm text-ink-400 mb-4 leading-relaxed">
              As Head of Department, you can review faculty assignments, courses, and approve grade books submitted by instructors. Please ensure all internal tests are approved before publishing progress reports.
            </p>
          </div>
          <div className="bg-ink-950/50 p-4 border border-ink-800 rounded-xl flex items-center gap-3 text-xs text-ink-400">
            <ShieldAlert size={16} className="text-lime-300 shrink-0" />
            <span>All operations are logged for safety audit compliance.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
