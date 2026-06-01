import { useEffect, useState } from 'react'
import { courseService, departmentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Pencil, Trash2, Plus, Filter, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function CourseManagement() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [departments, setDepartments] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ courseName: '', courseCode: '', department: '', semester: 1, credits: 3, facultyAssigned: '', description: '' })
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [semFilter, setSemFilter] = useState('')

  const isEditable = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'principal' || !!sessionStorage.getItem('adminToken')

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await courseService.getAll({
        department: deptFilter,
        semester: semFilter
      })
      setCourses(res.data.data)
    } catch (err) {
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll()
      setDepartments(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStaffList = async () => {
    try {
      const res = await api.get('/api/v1/users')
      const allUsers = res.data.data
      setStaffList(allUsers.filter(u => u.role === 'staff' || u.role === 'hod'))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchDepartments()
    if (isEditable) fetchStaffList()
  }, [deptFilter, semFilter])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.courseName || !form.courseCode || !form.department) {
      toast.error('Required fields are missing')
      return
    }

    try {
      if (editing) {
        await courseService.update(editing, form)
        toast.success('Course updated')
      } else {
        await courseService.create(form)
        toast.success('Course created')
      }
      setShowModal(false)
      fetchCourses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return
    try {
      await courseService.delete(id)
      toast.success('Course deleted')
      fetchCourses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course')
    }
  }

  const openAdd = () => {
    setForm({ courseName: '', courseCode: '', department: '', semester: 1, credits: 3, facultyAssigned: '', description: '' })
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (c) => {
    setForm({
      courseName: c.courseName,
      courseCode: c.courseCode,
      department: c.department,
      semester: c.semester,
      credits: c.credits,
      facultyAssigned: c.facultyAssigned?._id || c.facultyAssigned || '',
      description: c.description || ''
    })
    setEditing(c._id)
    setShowModal(true)
  }

  const filteredCourses = courses.filter(c =>
    c.courseName.toLowerCase().includes(search.toLowerCase()) ||
    c.courseCode.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Course Management</h1>
          <p className="text-sm text-ink-400">Add courses, configure credits, and assign faculty</p>
        </div>
        {isEditable && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Course
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
              placeholder="Search by course name or code..."
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
            {departments.map((d) => (
              <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
            ))}
          </select>
          <select
            className="input md:w-44 text-sm"
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
            Loading courses...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-ink-400 text-xs uppercase bg-ink-950/40 border-b border-ink-800">
                <tr>
                  <th className="px-6 py-4">Course Code</th>
                  <th className="px-6 py-4">Course Name</th>
                  <th className="px-6 py-4">Department & Sem</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4">Assigned Faculty</th>
                  {isEditable && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/60">
                {filteredCourses.map((c) => (
                  <tr key={c._id} className="hover:bg-ink-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-lime-300">{c.courseCode}</td>
                    <td className="px-6 py-4 font-semibold text-ink-100">{c.courseName}</td>
                    <td className="px-6 py-4">
                      <div className="text-ink-200">{c.department}</div>
                      <div className="text-xs text-ink-500">Semester {c.semester}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge tag-lime">{c.credits} Credits</span>
                    </td>
                    <td className="px-6 py-4 text-ink-300">
                      {c.facultyAssigned ? c.facultyAssigned.name : 'Not Assigned'}
                    </td>
                    {isEditable && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openEdit(c)} className="btn-ghost p-2" title="Edit Course">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(c._id)} className="btn-ghost p-2 text-red-400 hover:text-red-300" title="Delete Course">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan={isEditable ? 6 : 5} className="px-6 py-12 text-center text-ink-500">
                      No courses found.
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
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold font-display text-ink-150 mb-4">
              {editing ? 'Edit Course' : 'Create Course'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Course Name</label>
                <input
                  className="input"
                  placeholder="e.g. Design and Analysis of Algorithms"
                  value={form.courseName}
                  onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Course Code</label>
                <input
                  className="input font-mono uppercase"
                  placeholder="e.g. CS8401"
                  value={form.courseCode}
                  onChange={(e) => setForm({ ...form, courseCode: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div>
                <label className="label">Department</label>
                <select
                  className="input"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Semester</label>
                  <select
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
                  <label className="label">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="input"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Faculty Assignment</label>
                <select
                  className="input"
                  value={form.facultyAssigned}
                  onChange={(e) => setForm({ ...form, facultyAssigned: e.target.value })}
                >
                  <option value="">No Faculty Assigned</option>
                  {staffList.filter(s => s.department === form.department).map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.role === 'hod' ? 'HOD' : 'Staff'}) — {s.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input h-20"
                  placeholder="Enter course syllabus description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
