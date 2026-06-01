import { useEffect, useState } from 'react'
import { studentAdmissionService, courseService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Pencil, Trash2, Plus, Search, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { DEPART_CHECKER } from '../../utils/deptChecker'

const emptyForm = {
  studentId: '',
  name: '',
  email: '',
  phone: '',
  parentName: '',
  parentPhone: '',
  department: '',
  course: '',
  semester: 1,
  admissionYear: new Date().getFullYear(),
  address: '',
  status: 'Active'
}

export default function StudentAdmission() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [semFilter, setSemFilter] = useState('')

  const isEditable = user?.role === 'admin' || user?.role === 'office_staff'

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await studentAdmissionService.getAll({
        department: deptFilter,
        semester: semFilter,
        search
      })
      setStudents(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch student admissions')
    } finally {
      setLoading(false)
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
    fetchStudents()
    fetchCourses()
  }, [deptFilter, semFilter, search])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || form.name.trim().length < 3) {
      toast.error('Name must be at least 3 characters and contain only letters')
      return
    }
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(form.email)) {
      toast.error('Invalid email format')
      return
    }
    if (!form.studentId) {
      toast.error('Student Registration Number is required')
      return
    }

    try {
      if (editing) {
        await studentAdmissionService.update(editing, form)
        toast.success('Student record updated successfully')
      } else {
        await studentAdmissionService.create(form)
        toast.success('Student admitted successfully')
      }
      setShowModal(false)
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student and their login credentials?')) return
    try {
      await studentAdmissionService.delete(id)
      toast.success('Student deleted')
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student')
    }
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (s) => {
    setForm({
      studentId: s.studentId,
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      parentName: s.parentName || '',
      parentPhone: s.parentPhone || '',
      department: s.department,
      course: s.course?._id || s.course || '',
      semester: s.semester,
      admissionYear: s.admissionYear,
      address: s.address || '',
      status: s.status || 'Active'
    })
    setEditing(s._id)
    setShowModal(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Student Admissions</h1>
          <p className="text-sm text-ink-400">Manage student admissions and profile database</p>
        </div>
        {isEditable && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Admit Student
          </button>
        )}
      </div>

      <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 border-b border-ink-800 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
            <input
              className="input pl-10 text-sm"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input md:w-56 text-sm"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {Object.keys(DEPART_CHECKER).map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            className="input md:w-36 text-sm"
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-ink-500">
            <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading student records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-ink-400 text-xs uppercase bg-ink-950/40 border-b border-ink-800">
                <tr>
                  <th className="px-6 py-4">Student ID / Reg</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Department & Sem</th>
                  <th className="px-6 py-4">Parent Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/60">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-ink-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-lime-300">{s.studentId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink-100">{s.name}</div>
                      <div className="text-xs text-ink-500">{s.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-ink-200">{s.department}</div>
                      <div className="text-xs text-ink-500">Semester {s.semester}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-ink-300">{s.parentName || '—'}</div>
                      <div className="text-xs text-ink-500">{s.parentPhone || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${s.status === 'Active' ? 'tag-lime' : s.status === 'Suspended' ? 'tag-red' : 'tag-amber'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(s)} className="btn-ghost p-2" title={isEditable ? "Edit Profile" : "View Profile"}>
                          {isEditable ? <Pencil size={14} /> : <Eye size={14} />}
                        </button>
                        {isEditable && (
                          <button onClick={() => handleDelete(s._id)} className="btn-ghost p-2 text-red-400 hover:text-red-300" title="Delete Profile">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-ink-500">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold font-display text-ink-150 mb-4">
              {editing ? (isEditable ? 'Edit Student Details' : 'Student Profile Details') : 'New Student Admission'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Registration / Student ID</label>
                  <input
                    disabled={!!editing || !isEditable}
                    className="input font-mono"
                    placeholder="e.g. 8208E22CSE001"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Full Name</label>
                  <input
                    disabled={!isEditable}
                    className="input"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    disabled={!!editing || !isEditable}
                    type="email"
                    className="input"
                    placeholder="student@hit.edu.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    disabled={!isEditable}
                    className="input"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Parent Name</label>
                  <input
                    disabled={!isEditable}
                    className="input"
                    placeholder="Enter parent's name"
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Parent Phone Number</label>
                  <input
                    disabled={!isEditable}
                    className="input"
                    placeholder="10-digit number"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Department</label>
                  <select
                    disabled={!isEditable}
                    className="input"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    {Object.keys(DEPART_CHECKER).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Course Mapping</label>
                  <select
                    disabled={!isEditable}
                    className="input"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                  >
                    <option value="">No Course Assigned</option>
                    {courses.filter(c => c.department === form.department).map((c) => (
                      <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Semester</label>
                  <select
                    disabled={!isEditable}
                    className="input"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Admission Year</label>
                  <input
                    disabled={!isEditable}
                    type="number"
                    className="input"
                    value={form.admissionYear}
                    onChange={(e) => setForm({ ...form, admissionYear: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Address</label>
                  <textarea
                    disabled={!isEditable}
                    className="input h-20"
                    placeholder="Enter street address..."
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    disabled={!isEditable}
                    className="input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                  Close
                </button>
                {isEditable && (
                  <button type="submit" className="btn-primary">
                    Save Record
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
