import { useEffect, useState } from 'react'
import { attendanceService, courseService, departmentService, studentAdmissionService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Check, X, Calendar, Save, ShieldOff, ClipboardList, PenLine } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AttendanceManagement() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState([])

  // Selection/filter state
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedSem, setSelectedSem] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const [loading, setLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  // Active tab: 'view' | 'mark'
  const [activeTab, setActiveTab] = useState('view')
  const [attendanceSheet, setAttendanceSheet] = useState({}) // { studentUserId: 'Present' | 'Absent' }

  // Authorization helpers
  const canMarkAttendance =
    user?.role === 'hod' ||
    (user?.role === 'staff' && user?.isAttendanceCoordinator === true)

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll()
      setDepartments(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAll()
      setCourses(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchCourses()
  }, [])

  // Fetch student list for attendance sheet entry when filters change
  const loadStudentSheet = async () => {
    if (!selectedDept || !selectedSem || !selectedCourse) return
    setStudentsLoading(true)
    try {
      const res = await studentAdmissionService.getAll({
        department: selectedDept,
        semester: selectedSem
      })
      const list = res.data.data
      setStudents(list)

      // Initialize sheet with 'Present' for all students
      const initialSheet = {}
      list.forEach(s => {
        initialSheet[s.user?._id || s.user] = 'Present'
      })
      setAttendanceSheet(initialSheet)
    } catch (err) {
      toast.error('Failed to load students for batch')
    } finally {
      setStudentsLoading(false)
    }
  }

  // Load history records
  const fetchAttendanceHistory = async () => {
    setLoading(true)
    try {
      const res = await attendanceService.getAll({
        department: selectedDept,
        semester: selectedSem,
        course: selectedCourse,
        date: selectedDate
      })
      setRecords(res.data.data)
    } catch (err) {
      toast.error('Failed to load attendance history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'view') {
      fetchAttendanceHistory()
    } else {
      loadStudentSheet()
    }
  }, [selectedDept, selectedSem, selectedCourse, selectedDate, activeTab])

  const toggleStatus = (studentUserId) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [studentUserId]: prev[studentUserId] === 'Present' ? 'Absent' : 'Present'
    }))
  }

  const handleSaveAttendance = async () => {
    const list = Object.keys(attendanceSheet).map(key => ({
      student: key,
      status: attendanceSheet[key]
    }))

    if (list.length === 0) {
      toast.error('No student records to save')
      return
    }

    try {
      await attendanceService.save({
        course: selectedCourse,
        department: selectedDept,
        semester: Number(selectedSem),
        date: selectedDate,
        attendanceRecords: list
      })
      toast.success('Attendance sheet saved successfully')
      setActiveTab('view')
      fetchAttendanceHistory()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Attendance Management</h1>
          <p className="text-sm text-ink-400">Track and log student classroom attendance</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6 p-1 bg-ink-900/60 border border-ink-800 rounded-xl w-fit">
        <button
          id="tab-view-history"
          onClick={() => setActiveTab('view')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'view'
              ? 'bg-ink-700 text-ink-50 shadow'
              : 'text-ink-400 hover:text-ink-200'
          }`}
        >
          <ClipboardList size={15} />
          View History
        </button>
        <button
          id="tab-mark-attendance"
          onClick={() => setActiveTab('mark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'mark'
              ? 'bg-lime-400/10 text-lime-300 shadow'
              : 'text-ink-400 hover:text-ink-200'
          }`}
        >
          <PenLine size={15} />
          Mark Attendance
          {!canMarkAttendance && (
            <ShieldOff size={13} className="text-red-400 ml-1" />
          )}
        </button>
      </div>

      {/* Control Filters bar */}
      <div className="bg-ink-900 border border-ink-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="label">Department</label>
          <select
            className="input text-sm"
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setSelectedCourse(''); }}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Semester</label>
          <select
            className="input text-sm"
            value={selectedSem}
            onChange={(e) => { setSelectedSem(e.target.value); setSelectedCourse(''); }}
          >
            <option value="">Select Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Course</label>
          <select
            className="input text-sm"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedDept || !selectedSem}
          >
            <option value="">Select Course</option>
            {courses
              .filter(c => c.department === selectedDept && c.semester === Number(selectedSem))
              .map((c) => (
                <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>
              ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <div className="relative">
            <input
              type="date"
              className="input pl-10 text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
          </div>
        </div>
      </div>

      {/* ── MARK ATTENDANCE TAB ── */}
      {activeTab === 'mark' && (
        <>
          {/* Access Denied Banner for unauthorized staff */}
          {!canMarkAttendance && (
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-red-500/30 bg-red-500/5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <ShieldOff size={20} className="text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-300 text-sm">Access Denied</p>
                <p className="text-xs text-ink-400 mt-1 leading-relaxed">
                  Only the assigned <strong className="text-ink-200">Department Attendance Coordinator</strong>, HOD, or Admin
                  can mark student attendance. Contact your HOD to request coordinator access.
                </p>
              </div>
            </div>
          )}

          {/* Entry Sheet — only shown to authorized users */}
          {canMarkAttendance && (
            <div className="card p-6 border-ink-800">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-ink-800">
                <h2 className="text-lg font-bold font-display text-ink-100">Attendance Entry Sheet</h2>
                <button
                  onClick={handleSaveAttendance}
                  disabled={students.length === 0}
                  className="btn-primary"
                >
                  <Save size={16} /> Save Attendance
                </button>
              </div>

              {studentsLoading ? (
                <div className="p-12 text-center text-ink-500">
                  <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  Loading student lists...
                </div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center text-ink-500">
                  Select department, semester, and course to populate student roll sheet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {students.map((s) => {
                    const uid = s.user?._id || s.user
                    const status = attendanceSheet[uid] || 'Present'
                    return (
                      <div
                        key={s._id}
                        onClick={() => toggleStatus(uid)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                          status === 'Present'
                            ? 'bg-lime-400/5 border-lime-400/30 hover:border-lime-400'
                            : 'bg-red-500/5 border-red-500/30 hover:border-red-500'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-sm text-ink-100">{s.name}</p>
                          <p className="text-xs font-mono text-ink-500">{s.studentId}</p>
                        </div>
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          status === 'Present' ? 'bg-lime-400/10 text-lime-300' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {status === 'Present' ? <Check size={16} /> : <X size={16} />}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── VIEW HISTORY TAB ── */}
      {activeTab === 'view' && (
        <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-ink-800">
            <h2 className="text-lg font-bold font-display text-ink-100">Attendance Log Entries</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-500">
              <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Loading history records...
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-ink-500">
              No attendance records logged for this filter query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-ink-400 text-xs uppercase bg-ink-950/40 border-b border-ink-800">
                  <tr>
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800/60">
                  {records.map((r) => (
                    <tr key={r._id} className="hover:bg-ink-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-ink-300">{r.student?.regnum || '—'}</td>
                      <td className="px-6 py-4 font-semibold text-ink-100">{r.student?.name || '—'}</td>
                      <td className="px-6 py-4 text-ink-200">
                        {r.course ? `${r.course.courseCode} — ${r.course.courseName}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-ink-400">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${r.status === 'Present' ? 'tag-lime' : 'tag-red'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-ink-500">{r.markedBy?.name || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
