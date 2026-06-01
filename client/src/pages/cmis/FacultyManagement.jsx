import { useEffect, useState } from 'react'
import { facultyService, departmentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyForm = {
  facultyId: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  salary: 50000,
  joiningDate: new Date().toISOString().split('T')[0]
}

export default function FacultyManagement() {
  const { user } = useAuth()
  const [faculty, setFaculty] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')

  const isAdmin = user?.role === 'admin'

  const fetchFaculty = async () => {
    setLoading(true)
    try {
      const res = await facultyService.getAll({
        department: deptFilter,
        search
      })
      setFaculty(res.data.data)
    } catch (err) {
      toast.error('Failed to fetch faculty list')
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

  useEffect(() => {
    fetchFaculty()
    fetchDepartments()
  }, [deptFilter, search])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || form.name.trim().length < 3) {
      toast.error('Name must contain only letters and at least 3 characters')
      return
    }
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(form.email)) {
      toast.error('Invalid email format')
      return
    }
    if (form.salary < 0) {
      toast.error('Salary must be a positive number')
      return
    }

    try {
      if (editing) {
        await facultyService.update(editing, form)
        toast.success('Faculty updated successfully')
      } else {
        await facultyService.create(form)
        toast.success('Faculty registered successfully')
      }
      setShowModal(false)
      fetchFaculty()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member? This deletes their credentials.')) return
    try {
      await facultyService.delete(id)
      toast.success('Faculty member deleted')
      fetchFaculty()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete faculty')
    }
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (f) => {
    setForm({
      facultyId: f.facultyId,
      name: f.name,
      email: f.email,
      phone: f.phone || '',
      department: f.department,
      designation: f.designation,
      salary: f.salary,
      joiningDate: f.joiningDate ? new Date(f.joiningDate).toISOString().split('T')[0] : ''
    })
    setEditing(f._id)
    setShowModal(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Faculty Management</h1>
          <p className="text-sm text-ink-400">Manage instructors, staff assignments, and profiles</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Faculty
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
              placeholder="Search by faculty name, ID, or email..."
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
        </div>

        {loading ? (
          <div className="p-12 text-center text-ink-500">
            <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading faculty records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-ink-400 text-xs uppercase bg-ink-950/40 border-b border-ink-800">
                <tr>
                  <th className="px-6 py-4">Faculty ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Department & Designation</th>
                  <th className="px-6 py-4">Joined Date</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/60">
                {faculty.map((f) => (
                  <tr key={f._id} className="hover:bg-ink-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-lime-300">{f.facultyId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink-100">{f.name}</div>
                      <div className="text-xs text-ink-500">{f.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-ink-200">{f.department}</div>
                      <div className="text-xs text-ink-500">{f.designation}</div>
                    </td>
                    <td className="px-6 py-4 text-ink-300">
                      {f.joiningDate ? new Date(f.joiningDate).toLocaleDateString() : '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openEdit(f)} className="btn-ghost p-2" title="Edit Faculty">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(f._id)} className="btn-ghost p-2 text-red-400 hover:text-red-300" title="Delete Faculty">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {faculty.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-ink-500">
                      No faculty records found.
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
              {editing ? 'Edit Faculty Member' : 'Add Faculty Member'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Faculty ID</label>
                <input
                  disabled={!!editing}
                  className="input font-mono uppercase"
                  placeholder="e.g. HITP1024"
                  value={form.facultyId}
                  onChange={(e) => setForm({ ...form, facultyId: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div>
                <label className="label">Full Name</label>
                <input
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
                  disabled={!!editing}
                  type="email"
                  className="input"
                  placeholder="name@hit.edu.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
              <div>
                <label className="label">Designation</label>
                <input
                  className="input"
                  placeholder="e.g. Assistant Professor"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Monthly Base Salary (₹)</label>
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="label">Joining Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.joiningDate}
                  onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
