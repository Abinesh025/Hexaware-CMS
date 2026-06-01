import { useEffect, useState } from 'react'
import { reportsService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Users, GraduationCap, DollarSign, Activity, FileText, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReportsDashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [performance, setPerformance] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const [sumRes, perfRes] = await Promise.all([
        reportsService.getSummary(),
        reportsService.getPerformance()
      ])
      setSummary(sumRes.data.data)
      setPerformance(perfRes.data.data)
    } catch (err) {
      toast.error('Failed to load analytical reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in print:p-0">
      <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Reports & Analytics</h1>
          <p className="text-sm text-ink-400">College performance, finances, and attendance summary</p>
        </div>
        <button onClick={() => window.print()} className="btn-outline flex items-center gap-2">
          <Printer size={16} /> Print Reports
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-ink-500 print:hidden">
          <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Compiling analytical insights...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header for print only */}
          <div className="hidden print:block border-b border-gray-300 pb-4 mb-6">
            <h1 className="text-xl font-bold text-gray-900">E.G.S. College MIS Report</h1>
            <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()} by {user?.name}</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 flex items-center gap-4 border-ink-800">
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-300">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Total Enrolled Students</p>
                <p className="text-2xl font-bold text-ink-50">{summary?.counts?.students || 0}</p>
              </div>
            </div>

            <div className="card p-6 flex items-center gap-4 border-ink-800">
              <div className="w-12 h-12 rounded-xl bg-sky-400/10 flex items-center justify-center text-sky-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Faculty & HODs</p>
                <p className="text-2xl font-bold text-ink-50">
                  {(summary?.counts?.faculty || 0) + (summary?.counts?.hods || 0)}
                </p>
              </div>
            </div>

            <div className="card p-6 flex items-center gap-4 border-ink-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Tuition Fees Collected</p>
                <p className="text-2xl font-bold text-ink-50">₹{summary?.fees?.collected?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="card p-6 flex items-center gap-4 border-ink-800">
              <div className="w-12 h-12 rounded-xl bg-red-400/10 flex items-center justify-center text-red-400">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Average Attendance</p>
                <p className="text-2xl font-bold text-ink-50">{summary?.attendance?.overallPercentage || 0}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Breakdown */}
            <div className="card p-6 border-ink-800 lg:col-span-2">
              <h3 className="font-display font-bold text-lg text-ink-100 mb-4 pb-2 border-b border-ink-800">
                Department Student Enrollments
              </h3>
              <div className="space-y-4">
                {performance.map((dept) => (
                  <div key={dept._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-ink-300 font-semibold">{dept._id || 'General'}</span>
                      <span className="text-ink-400 font-mono">{dept.studentCount} students</span>
                    </div>
                    <div className="w-full bg-ink-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-lime-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((dept.studentCount / Math.max(...performance.map(p => p.studentCount), 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {performance.length === 0 && (
                  <p className="text-center text-ink-500 text-sm py-8">No department records available.</p>
                )}
              </div>
            </div>

            {/* Financial Ledger card */}
            <div className="card p-6 border-ink-800 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-ink-100 mb-4 pb-2 border-b border-ink-800">
                  Financial Ledger Status
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-400">Paid Fees:</span>
                    <span className="font-bold text-green-300">₹{summary?.fees?.collected?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-400">Outstanding Dues:</span>
                    <span className="font-bold text-red-400">₹{summary?.fees?.pending?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between border-t border-ink-800/60 pt-2">
                    <span className="text-ink-400">Estimated Total Invoice:</span>
                    <span className="font-bold text-ink-150">
                      ₹{((summary?.fees?.collected || 0) + (summary?.fees?.pending || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-ink-950/40 p-4 border border-ink-800 rounded-xl mt-6">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-500">Collection Recovery Ratio:</span>
                  <span className="text-ink-300 font-mono">
                    {summary?.fees?.collected > 0
                      ? Math.round((summary.fees.collected / ((summary.fees.collected || 0) + (summary.fees.pending || 0))) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-ink-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{
                      width: `${summary?.fees?.collected > 0
                        ? Math.round((summary.fees.collected / ((summary.fees.collected || 0) + (summary.fees.pending || 0))) * 100)
                        : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
