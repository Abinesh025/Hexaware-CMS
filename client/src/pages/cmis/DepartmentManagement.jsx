import { useEffect, useState } from 'react'
import { departmentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Pencil, Trash2, Plus, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function DepartmentManagement() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ departmentName: '', departmentCode: '', hod: '', description: '' })

  const isAdmin = user?.role === 'admin'

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const res = await departmentService.getAll()
      setDepartments(res.data.data)
    } catch (err) {
      toast.error('Failed to fetch departments')
    } finally {
      setLoading(false)
    }
  }

  const fetchStaffList = async () => {
    try {
      // Get all users who are staff or HOD to populate the hod dropdown
      const res = await api.get('/api/v1/users')
      const allUsers = res.data.data
      const filteredStaff = allUsers.filter(u => u.role === 'staff' || u.role === 'hod')
      setStaffList(filteredStaff)
    } catch (err) {
      console.error('Failed to fetch staff list', err)
    }
  }

  useEffect(() => {
    fetchDepartments()
    if (isAdmin) fetchStaffList()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.departmentName || !form.departmentCode) {
      toast.error('Department name and code are required')
      return
    }

    try {
      if (editing) {
        await departmentService.update(editing, form)
        toast.success('Department updated successfully')
      } else {
        await departmentService.create(form)
        toast.success('Department created successfully')
      }
      setShowModal(false)
      fetchDepartments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return
    try {
      await departmentService.delete(id)
      toast.success('Department deleted')
      fetchDepartments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department')
    }
  }

  const openAdd = () => {
    setForm({ departmentName: '', departmentCode: '', hod: '', description: '' })
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (d) => {
    setForm({
      departmentName: d.departmentName,
      departmentCode: d.departmentCode,
      hod: d.hod?._id || d.hod || '',
      description: d.description || ''
    })
    setEditing(d._id)
    setShowModal(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Department Management</h1>
          <p className="text-sm text-ink-400">Configure academic departments and appoint HODs</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Department
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-ink-500">
          <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading departments...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div key={d._id} className="card p-6 flex flex-col justify-between border-ink-800 hover:border-lime-400/40 hover:shadow-lg transition-all duration-200">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs tag-lime uppercase tracking-wider">{d.departmentCode}</span>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(d)} className="btn-ghost p-1" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(d._id)} className="btn-ghost p-1 text-red-400 hover:text-red-300" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
                <h3 className="font-display font-bold text-lg text-ink-100 mb-2 truncate" title={d.departmentName}>{d.departmentName}</h3>
                <p className="text-sm text-ink-400 line-clamp-3 mb-4">{d.description || 'No description provided.'}</p>
              </div>

              <div className="pt-4 border-t border-ink-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-400/10 flex items-center justify-center text-sky-400">
                  <Users size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">HOD Appointed</p>
                  <p className="text-sm text-ink-200 font-semibold truncate">{d.hod ? d.hod.name : 'Not Assigned'}</p>
                </div>
              </div>
            </div>
          ))}

          {departments.length === 0 && (
            <div className="col-span-full card p-12 text-center text-ink-500">
              No departments configured yet.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold font-display text-ink-150 mb-4">
              {editing ? 'Edit Department' : 'Create Department'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Department Name</label>
                <input
                  className="input"
                  placeholder="e.g. Computer Science and Engineering"
                  value={form.departmentName}
                  onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Department Code</label>
                <input
                  className="input font-mono uppercase"
                  placeholder="e.g. CSE"
                  value={form.departmentCode}
                  onChange={(e) => setForm({ ...form, departmentCode: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div>
                <label className="label">Head of Department (HOD)</label>
                <select
                  className="input"
                  value={form.hod}
                  onChange={(e) => setForm({ ...form, hod: e.target.value })}
                >
                  <option value="">No HOD Assigned</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input h-24"
                  placeholder="Enter short department description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
