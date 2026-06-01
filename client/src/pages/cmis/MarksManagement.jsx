import { useEffect, useState } from 'react'
import { marksService, courseService, departmentService, studentAdmissionService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Save, Search, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MarksManagement() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [hasAttendedTest, setHasAttendedTest] = useState(true)
  const [marksList, setMarksList] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedSem, setSelectedSem] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [studentSearch, setStudentSearch] = useState('')

  // Form input state
  const [showEntry, setShowEntry] = useState(false)
  const [entryForm, setEntryForm] = useState({ student: '', course: '', internalMarks: 0, endSemesterMarks: '' })

  const isStaff = user?.role === 'staff' || user?.role === 'hod' || user?.role === 'admin' || !!sessionStorage.getItem('adminToken')
  const isHod = user?.role === 'hod' || user?.role === 'admin' || !!sessionStorage.getItem('adminToken')

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

  const fetchMarks = async () => {
    setLoading(true)
    try {
      const res = await marksService.getAll({
        department: selectedDept,
        semester: selectedSem,
        course: selectedCourse,
        studentId: studentSearch
      })
      setMarksList(res.data.data)
      setHasAttendedTest(res.data.hasAttendedTest !== false)
    } catch (err) {
      toast.error('Failed to load marks list')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllStudents = async () => {
    try {
      const res = await studentAdmissionService.getAll()
      setAllStudents(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchCourses()
    fetchAllStudents()
  }, [])

  useEffect(() => {
    fetchMarks()
  }, [selectedDept, selectedSem, selectedCourse, studentSearch])

  const handleSaveMarks = async (e) => {
    e.preventDefault()
    const internal = Number(entryForm.internalMarks)
    const endSem = entryForm.endSemesterMarks !== '' ? Number(entryForm.endSemesterMarks) : null

    if (internal < 0 || internal > 25) {
      toast.error('Internal marks must be between 0 and 25')
      return
    }
    if (endSem !== null && (endSem < 0 || endSem > 75)) {
      toast.error('End semester marks must be between 0 and 75')
      return
    }

    try {
      await marksService.save({
        ...entryForm,
        department: selectedDept,
        semester: Number(selectedSem),
        course: selectedCourse,
        internalMarks: internal,
        endSemesterMarks: endSem
      })
      toast.success('Marks recorded successfully')
      setShowEntry(false)
      fetchMarks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks')
    }
  }

  const handleApprove = async (id) => {
    try {
      await marksService.approve(id)
      toast.success('Marks approved and published')
      fetchMarks()
    } catch (err) {
      toast.error('Failed to approve marks')
    }
  }

  const calculateGrade = (internal, endSem) => {
    const total = Number(internal || 0) + Number(endSem || 0)
    if (total >= 90) return { total, grade: 'O', label: 'Outstanding' }
    if (total >= 80) return { total, grade: 'A+', label: 'Very Good' }
    if (total >= 70) return { total, grade: 'A', label: 'Good' }
    if (total >= 60) return { total, grade: 'B', label: 'Average' }
    if (total >= 50) return { total, grade: 'C', label: 'Pass' }
    return { total, grade: 'RA', label: 'Re-Appearance (Fail)' }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Marks Management</h1>
          <p className="text-sm text-ink-400">Record and approve student internal/external exam grades</p>
        </div>
        {isStaff && (
          <button
            onClick={() => {
              if (selectedDept && selectedSem && selectedCourse) {
                setEntryForm({ student: '', course: selectedCourse, internalMarks: 0, endSemesterMarks: '' })
                setShowEntry(!showEntry)
              } else {
                toast.error('Please select Department, Semester, and Course first')
              }
            }}
            className="btn-primary"
          >
            {showEntry ? 'Cancel Entry' : 'Record Student Marks'}
          </button>
        )}
      </div>

      {/* Control Filter Bar */}
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
        <div className="flex-1">
          <label className="label">Select Student</label>
          <select
            className="input text-sm"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          >
            <option value="">All Students</option>
            {allStudents.map((s) => (
              <option key={s._id} value={s.user?._id || s.user}>
                {s.name} ({s.studentId || s.regnum})
              </option>
            ))}
          </select>
        </div>
      </div>

      {showEntry ? (
        // Record form
        <div className="card p-6 border-ink-800 max-w-lg mx-auto mb-6">
          <h2 className="text-lg font-bold font-display text-ink-100 mb-4 pb-2 border-b border-ink-800">
            Record Marks Form
          </h2>
          <form onSubmit={handleSaveMarks} className="space-y-4">
            <div>
              <label className="label">Select Student</label>
              <select
                className="input"
                value={entryForm.student}
                onChange={(e) => setEntryForm({ ...entryForm, student: e.target.value })}
                required
              >
                <option value="" disabled>Select student roll</option>
                {allStudents.map((s) => (
                  <option key={s._id} value={s.user?._id || s.user}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Internal Marks (Out of 25)</label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  className="input"
                  value={entryForm.internalMarks}
                  onChange={(e) => setEntryForm({ ...entryForm, internalMarks: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="label">End Sem Marks (Out of 75)</label>
                <input
                  type="number"
                  min={0}
                  max={75}
                  className="input"
                  placeholder="Not entered yet"
                  value={entryForm.endSemesterMarks}
                  onChange={(e) => setEntryForm({ ...entryForm, endSemesterMarks: e.target.value !== '' ? Number(e.target.value) : '' })}
                />
              </div>
            </div>

            {/* Live grade view */}
            <div className="p-3 bg-ink-950/50 border border-ink-800 rounded-xl flex items-center justify-between text-sm">
              <span className="text-ink-400">Estimated Total & Grade:</span>
              <span className="font-bold text-lime-300">
                {calculateGrade(entryForm.internalMarks, entryForm.endSemesterMarks).total} / 100 ({calculateGrade(entryForm.internalMarks, entryForm.endSemesterMarks).grade})
              </span>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowEntry(false)} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary"><Save size={14} /> Save Marks</button>
            </div>
          </form>
        </div>
      ) : (
        // Marks List
        <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-ink-800">
            <h2 className="text-lg font-bold font-display text-ink-100">Student Marks List</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-500">
              <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Loading marks log...
            </div>
          ) : !hasAttendedTest ? (
            <div className="p-12 text-center text-ink-500">
              No test attended.
            </div>
          ) : marksList.length === 0 ? (
            <div className="p-12 text-center text-ink-500">
              No marks recorded matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-ink-400 text-xs uppercase bg-ink-950/40 border-b border-ink-800">
                  <tr>
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Internal (25)</th>
                    <th className="px-6 py-4">End Sem (75)</th>
                    <th className="px-6 py-4">Total (100)</th>
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4">Status</th>
                    {isHod && <th className="px-6 py-4 text-right">Approval Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800/60">
                  {marksList.map((m) => (
                    <tr key={m._id} className="hover:bg-ink-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-ink-300">{m.student?.regnum || '—'}</td>
                      <td className="px-6 py-4 font-semibold text-ink-100">{m.student?.name || '—'}</td>
                      <td className="px-6 py-4 text-ink-200">
                        {m.course ? `${m.course.courseCode} — ${m.course.courseName}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-ink-300">{m.internalMarks}</td>
                      <td className="px-6 py-4 text-ink-300">{m.endSemesterMarks !== null ? m.endSemesterMarks : '—'}</td>
                      <td className="px-6 py-4 font-bold text-ink-150">{m.totalMarks}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${m.grade !== 'RA' ? 'tag-lime' : 'tag-red'}`}>{m.grade}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs ${m.isApproved ? 'text-lime-300' : 'text-amber-400'}`}>
                          {m.isApproved ? (
                            <><CheckCircle size={12} /> Approved</>
                          ) : (
                            <><AlertCircle size={12} /> Pending Approval</>
                          )}
                        </span>
                      </td>
                      {isHod && (
                        <td className="px-6 py-4 text-right">
                          {!m.isApproved && (
                            <button
                              onClick={() => handleApprove(m._id)}
                              className="btn-outline py-1 px-3 text-xs"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      )}
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
