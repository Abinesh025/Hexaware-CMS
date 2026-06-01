import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentService } from '../../services/api'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentMarks() {
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentService.getMarks()
      .then(res => setMarks(res.data?.data || res.data || []))
      .catch(() => toast.error('Failed to load marks'))
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
        <h1 className="page-title mb-1">My Grades</h1>
        <p className="text-ink-500 text-sm">Approved marks only — read-only view.</p>
      </div>

      {loading ? (
        <div className="card p-12 animate-pulse h-48" />
      ) : marks.length === 0 ? (
        <div className="card p-12 text-center">
          <BarChart3 size={32} className="text-ink-700 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">No published grades yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-ink-500 text-xs uppercase">
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-left px-4 py-3">Internal</th>
                  <th className="text-left px-4 py-3">End Sem</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((m) => (
                  <tr key={m._id} className="table-row">
                    <td className="px-4 py-3 text-ink-200">
                      {m.course ? `${m.course.courseCode} — ${m.course.courseName}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-300">{m.internalMarks}</td>
                    <td className="px-4 py-3 text-ink-300">
                      {m.endSemesterMarks !== null && m.endSemesterMarks !== undefined ? m.endSemesterMarks : '—'}
                    </td>
                    <td className="px-4 py-3 font-500 text-ink-100">{m.totalMarks}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${m.grade !== 'RA' ? 'tag-lime' : 'tag-red'}`}>{m.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
