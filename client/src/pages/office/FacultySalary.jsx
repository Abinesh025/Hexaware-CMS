import { useEffect, useState } from 'react'
import api, { officeSalaryService } from '../../services/api'
import { Pencil, Trash2, Plus, Search, Calendar, DollarSign, User, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyForm = {
  facultyId: '',
  basicSalary: 0,
  allowances: 0,
  deductions: 0,
  salaryMonth: new Date().toISOString().split('T')[0].substring(0, 7), // "YYYY-MM"
  paymentStatus: 'pending',
  paymentDate: '',
  paymentMode: 'bank'
}

export default function FacultySalary() {
  const [salaries, setSalaries] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchSalaries = async () => {
    setLoading(true)
    try {
      const res = await officeSalaryService.getAll({
        search,
        paymentStatus: statusFilter,
        page,
        limit: 10
      })
      setSalaries(res.data.data || [])
      setTotalPages(res.data.pagination?.pages || 1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch salary records')
    } finally {
      setLoading(false)
    }
  }

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/api/v1/users?roles=staff,hod,office_staff,principal')
      setFaculties(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch staff for payroll selection', err)
    }
  }

  useEffect(() => {
    fetchSalaries()
    fetchFaculties()
  }, [search, statusFilter, page])

  const handleSave = async (e) => {
    e.preventDefault()

    if (!form.facultyId) {
      toast.error('Please select a faculty member')
      return
    }

    if (Number(form.basicSalary) < 0 || Number(form.allowances) < 0 || Number(form.deductions) < 0) {
      toast.error('Basic salary, allowances, and deductions must be non-negative')
      return
    }

    if (!form.salaryMonth) {
      toast.error('Please choose a salary month')
      return
    }

    try {
      if (editing) {
        await officeSalaryService.update(editing, form)
        toast.success('Salary record updated successfully')
      } else {
        await officeSalaryService.create(form)
        toast.success('Salary record registered successfully')
      }
      setShowModal(false)
      fetchSalaries()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save salary record')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this salary record?')) return
    try {
      await officeSalaryService.delete(id)
      toast.success('Salary record deleted')
      fetchSalaries()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record')
    }
  }

  const openAdd = () => {
    setForm({
      ...emptyForm,
      salaryMonth: new Date().toISOString().split('T')[0].substring(0, 7)
    })
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (sal) => {
    const formattedDate = sal.paymentDate ? new Date(sal.paymentDate).toISOString().split('T')[0] : ''
    setForm({
      facultyId: sal.facultyId?._id || sal.facultyId || '',
      basicSalary: sal.basicSalary || 0,
      allowances: sal.allowances || 0,
      deductions: sal.deductions || 0,
      salaryMonth: sal.salaryMonth || new Date().toISOString().split('T')[0].substring(0, 7),
      paymentStatus: sal.paymentStatus || 'pending',
      paymentDate: formattedDate,
      paymentMode: sal.paymentMode || 'bank'
    })
    setEditing(sal._id)
    setShowModal(true)
  }

  // Live calculation of net salary
  const liveNetSalary = (Number(form.basicSalary) || 0) + (Number(form.allowances) || 0) - (Number(form.deductions) || 0)

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Faculty Payroll Registry</h1>
          <p className="text-sm text-ink-400 font-sans">Issue payrolls, record payments, and track salary ledger records</p>
        </div>
        <button onClick={openAdd} className="btn-primary bg-emerald-400 hover:bg-emerald-350 text-ink-950 flex items-center gap-2">
          <Plus size={16} /> Record Payroll Sheet
        </button>
      </div>

      <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Search & Filters */}
        <div className="p-4 border-b border-ink-800 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
            <input
              className="input pl-10 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
              placeholder="Search faculty name, department..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input md:w-56 text-sm focus:border-emerald-400"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Ledger table */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-ink-400">Loading payroll registry...</p>
          </div>
        ) : salaries.length === 0 ? (
          <div className="p-12 text-center text-ink-500">
            No salary records logged in this portal yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink-800 text-xs text-ink-400 font-mono">
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Department & Designation</th>
                  <th className="p-4">Pay Month</th>
                  <th className="p-4">Salary Breakdown (₹)</th>
                  <th className="p-4">Net Pay (₹)</th>
                  <th className="p-4">Status & Details</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/40 text-ink-200">
                {salaries.map((sal) => (
                  <tr key={sal._id} className="hover:bg-ink-800/10 transition-colors">
                    <td className="p-4">
                      <div className="font-600 text-ink-100 flex items-center gap-1.5">
                        <User size={13} className="text-ink-400 shrink-0" />
                        <span>{sal.facultyId?.name || 'Unknown Faculty'}</span>
                      </div>
                      <div className="text-[11px] text-ink-500 font-mono pl-4">{sal.facultyId?.email || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-ink-200">{sal.facultyId?.department || 'N/A'}</div>
                      <div className="text-xs text-ink-400 mt-0.5 capitalize">{sal.facultyId?.role?.replace('_', ' ') || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs">{sal.salaryMonth}</span>
                    </td>
                    <td className="p-4 text-xs font-mono space-y-0.5 text-ink-400">
                      <div>Basic: {sal.basicSalary?.toLocaleString()}</div>
                      <div>Allowances: +{sal.allowances?.toLocaleString()}</div>
                      <div>Deductions: -{sal.deductions?.toLocaleString()}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-ink-50">
                      ₹{sal.netSalary?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`badge text-xs capitalize ${
                        sal.paymentStatus === 'paid' ? 'tag-lime' : 'tag-amber'
                      }`}>
                        {sal.paymentStatus}
                      </span>
                      {sal.paymentStatus === 'paid' && (
                        <div className="text-[10px] text-ink-400 mt-1 font-sans">
                          Mode: <span className="uppercase font-mono">{sal.paymentMode || 'bank'}</span>
                          {sal.paymentDate && (
                            <span className="block text-[9px] text-ink-500">
                              On: {new Date(sal.paymentDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(sal)}
                          className="p-1.5 rounded-lg hover:bg-ink-800 text-ink-400 hover:text-ink-200 transition-colors"
                          title="Edit Details"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(sal._id)}
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
          <div className="bg-ink-900 border border-ink-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in-up my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-ink-800 flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-ink-50">
                {editing ? 'Modify Payroll Details' : 'Record Salary Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-400 hover:text-ink-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="label text-ink-300">Select Faculty Member *</label>
                  {editing ? (
                    // Display read-only when editing
                    <div className="p-2.5 bg-ink-950/80 border border-ink-800 rounded-xl text-ink-100 font-semibold text-sm">
                      {faculties.find(f => f._id === form.facultyId)?.name || 'Faculty Selected'}
                    </div>
                  ) : (
                    <select
                      required
                      className="input focus:border-emerald-400"
                      value={form.facultyId}
                      onChange={e => setForm({ ...form, facultyId: e.target.value })}
                    >
                      <option value="" disabled>Choose Staff / Faculty...</option>
                      {faculties.map(fac => (
                        <option key={fac._id} value={fac._id}>
                          {fac.name} ({fac.role?.replace('_', ' ')} - {fac.department || 'No Department'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label text-ink-300">Basic Salary (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="input focus:border-emerald-400 font-mono"
                      value={form.basicSalary}
                      onChange={e => setForm({ ...form, basicSalary: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="label text-ink-300">Allowances (₹)</label>
                    <input
                      type="number"
                      min={0}
                      className="input focus:border-emerald-400 font-mono"
                      value={form.allowances}
                      onChange={e => setForm({ ...form, allowances: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="label text-ink-300">Deductions (₹)</label>
                    <input
                      type="number"
                      min={0}
                      className="input focus:border-emerald-400 font-mono"
                      value={form.deductions}
                      onChange={e => setForm({ ...form, deductions: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Live calculated net salary show */}
                <div className="p-4 bg-emerald-400/5 border border-emerald-400/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-350">
                    <DollarSign size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider font-mono">Calculated Net Salary</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-ink-50">₹{liveNetSalary.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-ink-300">Salary Month *</label>
                    <input
                      type="month"
                      required
                      className="input focus:border-emerald-400"
                      value={form.salaryMonth}
                      onChange={e => setForm({ ...form, salaryMonth: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label text-ink-300">Payment Status *</label>
                    <select
                      className="input focus:border-emerald-400"
                      value={form.paymentStatus}
                      onChange={e => setForm({ ...form, paymentStatus: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                {form.paymentStatus === 'paid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-ink-800 bg-ink-950/40 rounded-xl animate-fade-in">
                    <div>
                      <label className="label text-ink-300">Payment Date</label>
                      <input
                        type="date"
                        className="input focus:border-emerald-400"
                        value={form.paymentDate}
                        onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="label text-ink-300">Payment Mode</label>
                      <select
                        className="input focus:border-emerald-400"
                        value={form.paymentMode}
                        onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                      >
                        <option value="bank">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                      </select>
                    </div>
                  </div>
                )}
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
                  className="flex-1 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-350 text-ink-950 rounded-xl text-sm font-600 transition-colors shadow-lg shadow-emerald-400/20"
                >
                  {editing ? 'Save Changes' : 'Confirm Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
