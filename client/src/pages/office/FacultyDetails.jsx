import { useEffect, useState } from 'react'
import { officeFacultyService } from '../../services/api'
import { Pencil, Trash2, Plus, Search, Calendar, Phone, Mail, Award, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
  "Artificial Intelligence and Data Science",
  "Biomedical Engineering",
  "Civil Engineering",
  "Computer Science and Business Systems",
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Information Technology",
  "Master of Business Administration",
  "Master of Computer Applications",
  "Mechanical Engineering"
]

const emptyForm = {
  facultyName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  qualification: '',
  experience: 0,
  joiningDate: new Date().toISOString().split('T')[0],
  employmentStatus: 'active'
}

export default function FacultyDetails() {
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchFaculties = async () => {
    setLoading(true)
    try {
      const res = await officeFacultyService.getAll({
        search,
        department: deptFilter,
        page,
        limit: 10
      })
      setFaculties(res.data.data || [])
      setTotalPages(res.data.pagination?.pages || 1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch faculty list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaculties()
  }, [search, deptFilter, page])

  const handleSave = async (e) => {
    e.preventDefault()

    if (form.facultyName.trim().length < 3) {
      toast.error('Faculty name must be at least 3 characters')
      return
    }

    if (!form.email || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(form.email)) {
      toast.error('Invalid email format (lowercase only)')
      return
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error('Faculty phone must be a 10-digit number')
      return
    }

    if (Number(form.experience) < 0) {
      toast.error('Experience cannot be negative')
      return
    }

    try {
      if (editing) {
        await officeFacultyService.update(editing, form)
        toast.success('Faculty details updated successfully')
      } else {
        await officeFacultyService.create(form)
        toast.success('Faculty details registered successfully')
      }
      setShowModal(false)
      fetchFaculties()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save faculty details')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty record?')) return
    try {
      await officeFacultyService.delete(id)
      toast.success('Faculty record deleted')
      fetchFaculties()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record')
    }
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (fac) => {
    const formattedJoining = fac.joiningDate ? new Date(fac.joiningDate).toISOString().split('T')[0] : ''
    setForm({
      facultyName: fac.facultyName || '',
      email: fac.email || '',
      phone: fac.phone || '',
      department: fac.department || '',
      designation: fac.designation || '',
      qualification: fac.qualification || '',
      experience: fac.experience || 0,
      joiningDate: formattedJoining,
      employmentStatus: fac.employmentStatus || 'active'
    })
    setEditing(fac._id)
    setShowModal(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Faculty Registry</h1>
          <p className="text-sm text-ink-400">Classify, monitor, and update profiles of teaching faculty</p>
        </div>
        <button onClick={openAdd} className="btn-primary bg-lime-400 hover:bg-lime-300 text-ink-950 flex items-center gap-2">
          <Plus size={16} /> Add Faculty Member
        </button>
      </div>

      <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Search & Filter */}
        <div className="p-4 border-b border-ink-800 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
            <input
              className="input pl-10 text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400/20"
              placeholder="Search faculty name, email, designation..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input md:w-64 text-sm focus:border-lime-400"
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Roster table */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-ink-400">Loading roster...</p>
          </div>
        ) : faculties.length === 0 ? (
          <div className="p-12 text-center text-ink-500">
            No faculty members registered in this portal yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink-800 text-xs text-ink-400 font-mono">
                  <th className="p-4">Faculty Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Joining & Experience</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/40 text-ink-200">
                {faculties.map((fac) => (
                  <tr key={fac._id} className="hover:bg-ink-800/10 transition-colors">
                    <td className="p-4">
                      <div className="font-600 text-ink-100">{fac.facultyName}</div>
                      <div className="text-xs text-lime-300 mt-0.5">{fac.designation}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-ink-300">
                        <Mail size={12} className="text-lime-400/70" />
                        <span>{fac.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-ink-400 mt-1">
                        <Phone size={12} className="text-ink-500" />
                        <span>{fac.phone}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-ink-200">{fac.department}</div>
                      {fac.qualification && (
                        <div className="text-xs text-ink-400 flex items-center gap-1 mt-1">
                          <Award size={12} className="text-amber-400" />
                          <span>{fac.qualification}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-ink-300 flex items-center gap-1">
                        <Calendar size={12} className="text-ink-500" />
                        <span>Joined: {fac.joiningDate ? new Date(fac.joiningDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="text-xs text-ink-400 mt-1">
                        Experience: {fac.experience || 0} years
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`badge text-xs capitalize ${
                        fac.employmentStatus === 'active' ? 'tag-lime' : 'tag-red'
                      }`}>
                        {fac.employmentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(fac)}
                          className="p-1.5 rounded-lg hover:bg-ink-800 text-ink-400 hover:text-ink-200 transition-colors"
                          title="Edit Details"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(fac._id)}
                          className="p-1.5 rounded-lg hover:bg-red-950/40 text-red-400/70 hover:text-red-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-ink-800 flex justify-between items-center text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 border border-ink-700 bg-ink-800/50 text-ink-300 rounded-lg hover:bg-ink-800 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-ink-500 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-ink-700 bg-ink-800/50 text-ink-300 rounded-lg hover:bg-ink-800 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-ink-800 flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-ink-50">
                {editing ? 'Modify Faculty Record' : 'Register Faculty Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-400 hover:text-ink-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label text-ink-300">Faculty Full Name *</label>
                  <input
                    type="text"
                    required
                    className="input focus:border-lime-400"
                    placeholder="Enter Faculty Name"
                    value={form.facultyName}
                    onChange={e => setForm({ ...form, facultyName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Faculty Email * (lowercase only)</label>
                  <input
                    type="email"
                    required
                    className="input focus:border-lime-400"
                    placeholder="faculty@hit.edu.in"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Faculty Phone * (10 digits)</label>
                  <input
                    type="tel"
                    required
                    className="input focus:border-lime-400"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Department *</label>
                  <select
                    required
                    className="input focus:border-lime-400"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                  >
                    <option value="" disabled>Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label text-ink-300">Designation *</label>
                  <input
                    type="text"
                    required
                    className="input focus:border-lime-400"
                    placeholder="e.g. Assistant Professor, HOD"
                    value={form.designation}
                    onChange={e => setForm({ ...form, designation: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Qualification</label>
                  <input
                    type="text"
                    className="input focus:border-lime-400"
                    placeholder="e.g. M.Tech, Ph.D."
                    value={form.qualification}
                    onChange={e => setForm({ ...form, qualification: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    className="input focus:border-lime-400"
                    placeholder="Years of experience"
                    value={form.experience}
                    onChange={e => setForm({ ...form, experience: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Joining Date</label>
                  <input
                    type="date"
                    className="input focus:border-lime-400"
                    value={form.joiningDate}
                    onChange={e => setForm({ ...form, joiningDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Employment Status</label>
                  <select
                    className="input focus:border-lime-400"
                    value={form.employmentStatus}
                    onChange={e => setForm({ ...form, employmentStatus: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-ink-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-ink-700 bg-ink-800/50 hover:bg-ink-800 text-ink-300 rounded-xl text-sm font-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-ink-950 rounded-xl text-sm font-600 transition-colors shadow-lg shadow-lime-400/20"
                >
                  {editing ? 'Save Changes' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
