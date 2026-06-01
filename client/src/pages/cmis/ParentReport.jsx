import { useEffect, useState } from 'react'
import { reportsService, studentAdmissionService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { FileText, RefreshCw, Printer, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ParentReport() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const isStaff = user?.role === 'staff' || user?.role === 'hod' || user?.role === 'admin'

  const fetchStudentReports = async (studentId) => {
    setLoading(true)
    try {
      const res = await reportsService.getStudentReports(studentId)
      setReports(res.data.data)
    } catch (err) {
      toast.error('Failed to load student reports')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await studentAdmissionService.getAll()
      setStudentsList(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (isStaff) {
      fetchStudents()
      setLoading(false)
    } else {
      fetchStudentReports()
    }
  }, [])

  const handleGenerate = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student')
      return
    }

    setGenerating(true)
    try {
      await reportsService.generateReport(selectedStudent)
      toast.success('Progress report generated successfully')
      fetchStudentReports(selectedStudent)
    } catch (err) {
      toast.error('Failed to compile progress report. Check if approved marks exist.')
    } finally {
      setGenerating(false)
    }
  }

  const handleStudentChange = (e) => {
    const val = e.target.value
    setSelectedStudent(val)
    if (val) {
      fetchStudentReports(val)
    } else {
      setReports([])
    }
  }

  const latestReport = reports[0]

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in print:p-0">
      <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Parent Progress Reports</h1>
          <p className="text-sm text-ink-400">Generate and print unified student performance report cards</p>
        </div>
        {latestReport && (
          <button onClick={() => window.print()} className="btn-outline flex items-center gap-2 text-sm">
            <Printer size={16} /> Print Report Card
          </button>
        )}
      </div>

      {isStaff && (
        <div className="card p-6 border-ink-800 flex flex-col sm:flex-row gap-4 items-end mb-6 print:hidden">
          <div className="flex-1 w-full">
            <label className="label">Select Student</label>
            <select className="input" value={selectedStudent} onChange={handleStudentChange}>
              <option value="">Select student roll...</option>
              {studentsList.map((s) => (
                <option key={s._id} value={s.user?._id || s.user}>{s.name} ({s.studentId})</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!selectedStudent || generating}
            className="btn-primary w-full sm:w-auto shrink-0 justify-center"
          >
            {generating ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              'Compile & Generate Report Card'
            )}
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-ink-500 print:hidden">
          <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading report history...
        </div>
      ) : !latestReport ? (
        <div className="card p-12 text-center text-ink-500 border-ink-800">
          No progress reports compiled yet.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Printable Report Card Frame */}
          <div className="bg-white text-ink-950 rounded-2xl p-8 border border-gray-200 shadow-xl max-w-3xl mx-auto">
            {/* School Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4 mb-6">
              <div>
                <h2 className="font-bold text-2xl tracking-tight text-gray-900">HIt ENGINEERING COLLEGE</h2>
                <p className="text-xs text-gray-500">Nagapattinam, Tamil Nadu — Autonomous Institution</p>
                <p className="text-sm font-semibold text-gray-700 mt-2 uppercase tracking-wide">Parent Progress Report Card</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  Report #{latestReport._id.slice(-6).toUpperCase()}
                </span>
                <p className="text-[10px] text-gray-400 mt-1">Generated: {new Date(latestReport.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Profile Section */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-500 block text-xs">Student Name</span>
                <span className="font-bold text-gray-900">{latestReport.student?.name || 'Academic Student'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Registration Number</span>
                <span className="font-mono font-bold text-gray-900">{latestReport.student?.regnum || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Department</span>
                <span className="font-semibold text-gray-800">{latestReport.student?.department || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Academic Status</span>
                <span className="font-semibold text-gray-800">Semester {latestReport.student?.semester || 1}</span>
              </div>
            </div>

            {/* Summaries Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Attendance Stats */}
              <div className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Class Attendance Index</h4>
                  <p className="text-3xl font-extrabold text-lime-600">{latestReport.attendanceSummary}%</p>
                  <p className="text-xs text-gray-500 mt-1">Minimum target required: 75%</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  {latestReport.attendanceSummary >= 75 ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Attendance Satisfactory</span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> Attendance Critical / Lack of attendance</span>
                  )}
                </div>
              </div>

              {/* Fee stats */}
              <div className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Tuition Balance Dues</h4>
                  <p className="text-3xl font-extrabold text-red-600">₹{latestReport.feeSummary?.balanceDue?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Paid Amount: ₹{latestReport.feeSummary?.paidAmount?.toLocaleString() || 0}</p>
                </div>
                <div className="mt-4 text-xs font-semibold text-gray-700">
                  Status: <span className={latestReport.feeSummary?.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-500'}>
                    {latestReport.feeSummary?.paymentStatus || 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Grades Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-gray-900">
                Sessional Academic Performance
              </div>
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-xs uppercase">
                    <th className="px-4 py-2">Code</th>
                    <th className="px-4 py-2">Subject Name</th>
                    <th className="px-4 py-2 text-center">Internal (25)</th>
                    <th className="px-4 py-2 text-center">End Sem (75)</th>
                    <th className="px-4 py-2 text-center">Total (100)</th>
                    <th className="px-4 py-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800">
                  {latestReport.marksSummary?.map((m, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-mono text-xs">{m.courseCode}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{m.courseName}</td>
                      <td className="px-4 py-3 text-center">{m.internalMarks}</td>
                      <td className="px-4 py-3 text-center">{m.endSemesterMarks !== null ? m.endSemesterMarks : '—'}</td>
                      <td className="px-4 py-3 text-center font-bold">{m.totalMarks}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.grade !== 'RA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {m.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!latestReport.marksSummary || latestReport.marksSummary.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                        No approved marks recorded for this report card.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom summary note */}
            <div className="flex justify-between items-end border-t border-gray-200 pt-6">
              <div>
                <p className="text-xs text-gray-500 font-bold">Progress status summary:</p>
                <p className="text-sm font-semibold text-gray-800">{latestReport.progressStatus || 'Satisfactory'}</p>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <p>HIT College Registrar Authority</p>
                <p> nagapattinam@hit.org </p>
              </div>
            </div>
          </div>

          {/* Historical Log list */}
          <div className="card p-6 border-ink-800 print:hidden max-w-3xl mx-auto">
            <h3 className="font-display font-bold text-ink-100 mb-4 pb-2 border-b border-ink-800">Report card generation history</h3>
            <div className="space-y-3">
              {reports.map((r, idx) => (
                <div
                  key={r._id}
                  onClick={() => fetchStudentReports(r.student._id || r.student)}
                  className={`p-3 rounded-xl border border-ink-800 flex items-center justify-between cursor-pointer hover:bg-ink-800/40 transition-colors ${idx === 0 ? 'bg-ink-800/20' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-ink-400" />
                    <div>
                      <p className="text-sm text-ink-200 font-semibold">Report Card #{r._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-ink-500">Date: {new Date(r.generatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="badge tag-lime">{r.progressStatus}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
