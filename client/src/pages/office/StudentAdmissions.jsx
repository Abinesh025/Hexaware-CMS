import { useEffect, useState } from 'react'
import { officeAdmissionsService } from '../../services/api'
import { Pencil, Trash2, Plus, Search, Calendar, Phone, Mail, Award, MapPin } from 'lucide-react'
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
  studentName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'Male',
  department: '',
  course: '',
  semester: 1,
  admissionYear: new Date().getFullYear(),
  parentName: '',
  parentPhone: '',
  address: '',
  admissionStatus: 'pending'
}

export default function StudentAdmissions() {
  const [admissions, setAdmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchAdmissions = async () => {
    setLoading(true)
    try {
      const res = await officeAdmissionsService.getAll({
        search,
        department: deptFilter,
        admissionStatus: statusFilter,
        page,
        limit: 10
      })
      setAdmissions(res.data.data || [])
      setTotalPages(res.data.pagination?.pages || 1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch admissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmissions()
  }, [search, deptFilter, statusFilter, page])

  const handleSave = async (e) => {
    e.preventDefault()

    if (form.studentName.trim().length < 3) {
      toast.error('Student name must be at least 3 characters')
      return
    }

    if (!form.email || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(form.email)) {
      toast.error('Invalid email format (lowercase only)')
      return
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error('Student phone must be a 10-digit number')
      return
    }

    if (form.parentPhone && !/^\d{10}$/.test(form.parentPhone)) {
      toast.error('Parent phone must be a 10-digit number')
      return
    }

    try {
      if (editing) {
        await officeAdmissionsService.update(editing, form)
        toast.success('Admission record updated successfully')
      } else {
        await officeAdmissionsService.create(form)
        toast.success('Admission record created successfully')
      }
      setShowModal(false)
      fetchAdmissions()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save admission')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admission record?')) return
    try {
      await officeAdmissionsService.delete(id)
      toast.success('Record deleted')
      fetchAdmissions()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record')
    }
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (adm) => {
    const formattedDob = adm.dateOfBirth ? new Date(adm.dateOfBirth).toISOString().split('T')[0] : ''
    setForm({
      studentName: adm.studentName || '',
      email: adm.email || '',
      phone: adm.phone || '',
      dateOfBirth: formattedDob,
      gender: adm.gender || 'Male',
      department: adm.department || '',
      course: adm.course || '',
      semester: adm.semester || 1,
      admissionYear: adm.admissionYear || new Date().getFullYear(),
      parentName: adm.parentName || '',
      parentPhone: adm.parentPhone || '',
      address: adm.address || '',
      admissionStatus: adm.admissionStatus || 'pending'
    })
    setEditing(adm._id)
    setShowModal(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Admissions Registry</h1>
          <p className="text-sm text-ink-400">Add, track and manage student admission credentials</p>
        </div>
        <button onClick={openAdd} className="btn-primary bg-sky-400 hover:bg-sky-300 text-ink-950 flex items-center gap-2">
          <Plus size={16} /> New Admission
        </button>
      </div>

      <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Search & Filters */}
        <div className="p-4 border-b border-ink-800 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
            <input
              className="input pl-10 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
              placeholder="Search student name, email, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input md:w-56 text-sm focus:border-sky-400"
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            className="input md:w-44 text-sm focus:border-sky-400"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table list */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-ink-400">Loading admissions...</p>
          </div>
        ) : admissions.length === 0 ? (
          <div className="p-12 text-center text-ink-500">
            No admission records found matching the filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink-800 text-xs text-ink-400 font-mono">
                  <th className="p-4">Student</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Department & Course</th>
                  <th className="p-4">Parent Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/40 text-ink-200">
                {admissions.map((adm) => (
                  <tr key={adm._id} className="hover:bg-ink-800/10 transition-colors">
                    <td className="p-4">
                      <div className="font-600 text-ink-100">{adm.studentName}</div>
                      <div className="text-xs text-ink-500 font-mono">Year: {adm.admissionYear} | Sem: {adm.semester}</div>
                      <div className="text-[10px] text-ink-400 mt-0.5 capitalize">{adm.gender || 'Unknown gender'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-ink-300">
                        <Mail size={12} className="text-sky-400" />
                        <span>{adm.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-ink-400 mt-1">
                        <Phone size={12} className="text-ink-500" />
                        <span>{adm.phone}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-500 text-xs text-ink-200">{adm.department}</div>
                      <div className="text-xs text-sky-300/80 mt-0.5">{adm.course}</div>
                    </td>
                    <td className="p-4">
                      {adm.parentName ? (
                        <>
                          <div className="text-xs text-ink-300">{adm.parentName}</div>
                          {adm.parentPhone && (
                            <div className="text-[11px] text-ink-500">{adm.parentPhone}</div>
                          )}
                        </>
                      ) : (
                        <span className="text-ink-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`badge text-xs capitalize ${
                        adm.admissionStatus === 'approved' ? 'tag-lime' :
                        adm.admissionStatus === 'rejected' ? 'tag-red' : 'tag-amber'
                      }`}>
                        {adm.admissionStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(adm)}
                          className="p-1.5 rounded-lg hover:bg-ink-800 text-ink-400 hover:text-ink-200 transition-colors"
                          title="Edit Details"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(adm._id)}
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
                {editing ? 'Modify Student Admission Record' : 'Record New Student Admission'}
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
                  <label className="label text-ink-300">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    className="input focus:border-sky-400"
                    placeholder="Enter Student Name"
                    value={form.studentName}
                    onChange={e => setForm({ ...form, studentName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Student Email * (lowercase only)</label>
                  <input
                    type="email"
                    required
                    className="input focus:border-sky-400"
                    placeholder="student@hit.edu.in"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Student Phone * (10 digits)</label>
                  <input
                    type="tel"
                    required
                    className="input focus:border-sky-400"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Date of Birth</label>
                  <input
                    type="date"
                    className="input focus:border-sky-400"
                    value={form.dateOfBirth}
                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Gender</label>
                  <select
                    className="input focus:border-sky-400"
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label text-ink-300">Department *</label>
                  <select
                    required
                    className="input focus:border-sky-400"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value, course: '' })}
                  >
                    <option value="" disabled>Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label text-ink-300">Course / Specialization *</label>
                  <input
                    type="text"
                    required
                    className="input focus:border-sky-400"
                    placeholder="e.g. B.E. Computer Science"
                    value={form.course}
                    onChange={e => setForm({ ...form, course: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Semester</label>
                  <select
                    className="input focus:border-sky-400"
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label text-ink-300">Admission Year *</label>
                  <input
                    type="number"
                    required
                    className="input focus:border-sky-400"
                    value={form.admissionYear}
                    onChange={e => setForm({ ...form, admissionYear: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Parent / Guardian Name</label>
                  <input
                    type="text"
                    className="input focus:border-sky-400"
                    placeholder="Enter Parent Name"
                    value={form.parentName}
                    onChange={e => setForm({ ...form, parentName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Parent Phone (10 digits)</label>
                  <input
                    type="tel"
                    className="input focus:border-sky-400"
                    placeholder="Parent Contact Number"
                    value={form.parentPhone}
                    onChange={e => setForm({ ...form, parentPhone: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <div>
                  <label className="label text-ink-300">Admission Status</label>
                  <select
                    className="input focus:border-sky-400"
                    value={form.admissionStatus}
                    onChange={e => setForm({ ...form, admissionStatus: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-ink-300">Address Details</label>
                <textarea
                  rows={3}
                  className="input py-2 resize-none focus:border-sky-400"
                  placeholder="Enter full postal address..."
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
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
                  className="flex-1 px-4 py-2.5 bg-sky-400 hover:bg-sky-350 text-ink-950 rounded-xl text-sm font-600 transition-colors shadow-lg shadow-sky-400/20"
                >
                  {editing ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
