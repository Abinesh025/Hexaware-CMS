import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentService } from '../../services/api'
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentAttendance() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentService.getAttendance()
      .then(res => setStats(res.data?.data || res.data))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors text-sm font-500"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div>
        <h1 className="page-title mb-1">My Attendance</h1>
        <p className="text-ink-500 text-sm">View-only — attendance records cannot be modified here.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="card p-6 animate-pulse h-24" />)}
        </div>
      ) : !stats ? (
        <div className="card p-12 text-center text-ink-500 text-sm">No attendance data available yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <Calendar size={18} className="text-sky-400 mb-2" />
              <p className="text-ink-500 text-xs">Total Classes</p>
              <p className="font-display font-700 text-2xl text-ink-50">{stats.totalClasses ?? 0}</p>
            </div>
            <div className="stat-card">
              <TrendingUp size={18} className="text-lime-300 mb-2" />
              <p className="text-ink-500 text-xs">Present</p>
              <p className="font-display font-700 text-2xl text-ink-50">{stats.totalPresent ?? 0}</p>
            </div>
            <div className="stat-card">
              <p className="text-ink-500 text-xs mb-2">Overall %</p>
              <p className={`font-display font-700 text-2xl ${
                (stats.percentage ?? 0) >= 75 ? 'text-lime-300' : 'text-amber-400'
              }`}>
                {stats.percentage ?? 0}%
              </p>
            </div>
          </div>

          {(stats.courses?.length > 0) && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-ink-800">
                <h2 className="section-title mb-0">Course-wise Attendance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-800 text-ink-500 text-xs uppercase">
                      <th className="text-left px-4 py-3">Course</th>
                      <th className="text-left px-4 py-3">Present</th>
                      <th className="text-left px-4 py-3">Total</th>
                      <th className="text-left px-4 py-3">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.courses.map((c, i) => (
                      <tr key={i} className="table-row">
                        <td className="px-4 py-3 text-ink-200">
                          {c.course ? `${c.course.courseCode} — ${c.course.courseName}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-ink-300">{c.present}</td>
                        <td className="px-4 py-3 text-ink-300">{c.total}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${c.percentage >= 75 ? 'tag-lime' : 'tag-amber'}`}>
                            {c.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
