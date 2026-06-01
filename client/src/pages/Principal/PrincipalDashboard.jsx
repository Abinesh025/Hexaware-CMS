import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { principalService } from '../../services/api'
import { Link } from 'react-router-dom'
import {
  Building2, Users, UserCheck, UserX, GraduationCap,
  BarChart3, CheckCircle, AlertTriangle, ArrowRight,
  ClipboardList, TrendingUp, CalendarCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function PrincipalDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    principalService.getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard statistics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-400 text-sm">Loading principal statistics…</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Departments',
      value: data?.totalDepts ?? 0,
      icon: Building2,
      color: 'text-amber-300',
      bg: 'bg-amber-400/10',
      border: 'hover:border-amber-400/20'
    },
    {
      label: 'Active HODs',
      value: data?.totalHods ?? 0,
      icon: UserCheck,
      color: 'text-lime-300',
      bg: 'bg-lime-400/10',
      border: 'hover:border-lime-400/20'
    },
    {
      label: 'Depts Without HOD',
      value: data?.deptsWithoutHod ?? 0,
      icon: UserX,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'hover:border-red-400/20',
      alert: (data?.deptsWithoutHod ?? 0) > 0
    },
    {
      label: 'Total Faculty',
      value: data?.totalFaculty ?? 0,
      icon: Users,
      color: 'text-sky-300',
      bg: 'bg-sky-400/10',
      border: 'hover:border-sky-400/20'
    },
    {
      label: "Today's Attendance",
      value: data?.attendanceSummary?.totalMarked ?? 0,
      sub: `${data?.attendanceSummary?.present ?? 0} Present`,
      icon: CalendarCheck,
      color: 'text-purple-300',
      bg: 'bg-purple-400/10',
      border: 'hover:border-purple-400/20'
    },
    {
      label: 'Dept Performance',
      value: `${data?.departmentOverview?.filter(d => d.hod).length ?? 0}/${data?.totalDepts ?? 0}`,
      sub: 'HODs Assigned',
      icon: TrendingUp,
      color: 'text-emerald-300',
      bg: 'bg-emerald-400/10',
      border: 'hover:border-emerald-400/20'
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono mb-3">
            👑 Principal Portal
          </div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Administrative Overview</h1>
          <p className="text-sm text-ink-400">Welcome back, {user?.name || 'Principal'} — College Administrative Authority</p>
        </div>
        <Link
          to="/principal/hod-management"
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-ink-950 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-400/20"
        >
          <Users size={16} />
          Manage HODs
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`card p-6 border-ink-800 bg-ink-900/50 relative overflow-hidden group transition-all duration-300 ${s.border}`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-all`} />
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <span className="text-xs text-ink-500 uppercase font-mono tracking-wider">{s.label}</span>
                <div>
                  <p className="text-3xl font-bold text-ink-50">{s.value}</p>
                  {s.sub && <p className="text-xs text-ink-400 mt-1">{s.sub}</p>}
                  {s.alert && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                      <AlertTriangle size={11} />
                      Requires attention
                    </div>
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                <s.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Department Overview Table */}
      <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-ink-800 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-ink-100">Department Performance Overview</h2>
            <p className="text-xs text-ink-500 mt-0.5">HOD assignments, coordinators, and department statuses</p>
          </div>
          <Link
            to="/principal/hod-management"
            className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
          >
            Manage HODs <ArrowRight size={12} />
          </Link>
        </div>

        {!data?.departmentOverview?.length ? (
          <div className="p-12 text-center text-ink-500 text-sm">
            No departments found. Create departments in the admin panel first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink-800 text-xs text-ink-400 font-mono">
                  <th className="p-4">Department</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">HOD</th>
                  <th className="p-4">Assignment Date</th>
                  <th className="p-4">Coordinators</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/40 text-ink-200">
                {data.departmentOverview.map(dept => (
                  <tr key={dept._id} className="hover:bg-ink-800/10 transition-colors">
                    <td className="p-4 font-medium text-ink-100">{dept.name}</td>
                    <td className="p-4 font-mono text-xs text-ink-400">{dept.code}</td>
                    <td className="p-4">
                      {dept.hod ? (
                        <div>
                          <p className="text-ink-100 text-sm">{dept.hod.name}</p>
                          <p className="text-xs text-ink-500 font-mono">{dept.hod.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-red-400 font-medium">Not Assigned</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-mono text-ink-400">
                      {dept.assignedDate
                        ? new Date(dept.assignedDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className={dept.coordinators.attendance ? 'text-lime-400' : 'text-ink-600'}>
                          {dept.coordinators.attendance ? `✓ Attendance: ${dept.coordinators.attendance}` : '✗ No Attendance Coord'}
                        </span>
                        <span className={dept.coordinators.sports ? 'text-sky-400' : 'text-ink-600'}>
                          {dept.coordinators.sports ? `✓ Sports: ${dept.coordinators.sports}` : '✗ No Sports Coord'}
                        </span>
                        <span className={dept.coordinators.discipline ? 'text-purple-400' : 'text-ink-600'}>
                          {dept.coordinators.discipline ? `✓ Discipline: ${dept.coordinators.discipline}` : '✗ No Discipline Coord'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {dept.hod ? (
                        <span className="badge tag-lime text-xs">Active HOD</span>
                      ) : (
                        <span className="badge tag-red text-xs">No HOD</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick action shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/principal/hod-management', label: 'HOD Management', sub: 'Assign & change HODs', color: 'hover:border-amber-400/30', icon: Users },
          { to: '/departments', label: 'Department Registry', sub: 'View all departments', color: 'hover:border-sky-400/30', icon: Building2 },
          { to: '/analytics', label: 'Reports & Analytics', sub: 'Institutional performance', color: 'hover:border-lime-400/30', icon: BarChart3 }
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`p-5 rounded-xl border border-ink-800 ${item.color} bg-ink-950/40 hover:bg-ink-800/20 transition-all group flex items-center justify-between`}
          >
            <div>
              <span className="block font-semibold text-ink-200 text-sm">{item.label}</span>
              <span className="text-xs text-ink-500">{item.sub}</span>
            </div>
            <ArrowRight size={16} className="text-ink-500 group-hover:text-ink-300 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
