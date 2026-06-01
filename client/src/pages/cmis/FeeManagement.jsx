import { useEffect, useState } from 'react'
import { feesService, studentAdmissionService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, DollarSign, CreditCard, FileText, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FeeManagement() {
  const { user } = useAuth()
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState(null) // holds selected fee record for receipt modal

  const [form, setForm] = useState({ student: '', totalFee: '', paidAmount: '', paymentMode: 'Cash' })
  const [payForm, setPayForm] = useState({ id: '', amount: '', paymentMode: 'Online' })

  const [studentSearch, setStudentSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [duesOnly, setDuesOnly] = useState(false)

  const isOffice = user?.role === 'admin' || user?.role === 'office_staff' || !!sessionStorage.getItem('adminToken')

  const fetchFees = async () => {
    setLoading(true)
    try {
      let res
      if (user?.role === 'student') {
        res = await feesService.getMyFees()
      } else if (duesOnly) {
        res = await feesService.getDues()
      } else {
        res = await feesService.getAll({
          studentId: studentSearch,
          paymentStatus: statusFilter
        })
      }
      const data = res.data.data
      setFees(Array.isArray(data) ? data : (data ? [data] : []))
    } catch (err) {
      if (user?.role === 'student' && err.response?.status === 404) {
        setFees([])
      } else {
        toast.error('Failed to load fee records')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await studentAdmissionService.getAll()
      setStudents(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchFees()
    if (isOffice) fetchStudents()
  }, [studentSearch, statusFilter, duesOnly])

  const handleCreateRecord = async (e) => {
    e.preventDefault()
    if (!form.student || !form.totalFee) {
      toast.error('Student and total fee are required')
      return
    }

    try {
      await feesService.create(form)
      toast.success('Fee record created')
      setShowAddModal(false)
      fetchFees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record')
    }
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    if (!payForm.amount || payForm.amount <= 0) {
      toast.error('Enter a valid payment amount')
      return
    }

    try {
      await feesService.pay(payForm.id, payForm.amount, payForm.paymentMode)
      toast.success('Payment recorded successfully')
      setShowPayModal(false)
      fetchFees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    }
  }

  const openPay = (fee) => {
    setPayForm({ id: fee._id, amount: fee.balanceDue, paymentMode: 'Online' })
    setShowPayModal(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Fee Management</h1>
          <p className="text-sm text-ink-400">Track paid tuition fees, pending balances, and generate receipts</p>
        </div>
        {isOffice && (
          <button onClick={() => { setForm({ student: '', totalFee: '', paidAmount: '', paymentMode: 'Cash' }); setShowAddModal(true); }} className="btn-primary">
            <Plus size={16} /> Create Invoice
          </button>
        )}
      </div>

      <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden">
        {/* Search & Filters */}
        {user?.role !== 'student' && (
          <div className="p-4 border-b border-ink-800 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
              <input
                className="input pl-10 text-sm"
                placeholder="Search by student registration number..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                disabled={duesOnly}
              />
            </div>
            <select
              className="input md:w-44 text-sm w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={duesOnly}
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-ink-300 select-none shrink-0 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-ink-800 border-ink-700 text-lime-400 focus:ring-lime-400/30"
                checked={duesOnly}
                onChange={(e) => setDuesOnly(e.target.checked)}
              />
              Dues Pending Only
            </label>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-ink-500">
            <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading fee records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-ink-400 text-xs uppercase bg-ink-950/40 border-b border-ink-800">
                <tr>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Total Fee</th>
                  <th className="px-6 py-4">Paid Amount</th>
                  <th className="px-6 py-4">Balance Due</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/60">
                {fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-ink-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-ink-300">{fee.student?.regnum || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-ink-100">{fee.student?.name || '—'}</td>
                    <td className="px-6 py-4 text-ink-150">₹{fee.totalFee.toLocaleString()}</td>
                    <td className="px-6 py-4 text-lime-300">₹{fee.paidAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-400 font-bold">₹{fee.balanceDue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${fee.paymentStatus === 'Paid' ? 'tag-lime' : fee.paymentStatus === 'Partial' ? 'tag-amber' : 'tag-red'}`}>
                        {fee.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowReceipt(fee)} className="btn-ghost p-2" title="View Receipt">
                          <FileText size={14} />
                        </button>
                        {isOffice && fee.balanceDue > 0 && (
                          <button onClick={() => openPay(fee)} className="btn-outline text-xs px-2.5 py-1" title="Collect Payment">
                            Record Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {fees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-ink-500">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold font-display text-ink-150 mb-4">Create Fee Invoice</h2>
            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="label">Select Student</label>
                <select
                  className="input"
                  value={form.student}
                  onChange={(e) => setForm({ ...form, student: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Student Roll</option>
                  {students.map((s) => (
                    <option key={s._id} value={s.user?._id || s.user}>{s.name} ({s.studentId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Total Academic Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  className="input"
                  placeholder="e.g. 85000"
                  value={form.totalFee}
                  onChange={(e) => setForm({ ...form, totalFee: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Initial Paid Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    placeholder="e.g. 20000"
                    value={form.paidAmount}
                    onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Payment Mode</label>
                  <select
                    className="input"
                    value={form.paymentMode}
                    onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online">Online Link</option>
                    <option value="Card">POS Card</option>
                    <option value="UPI">UPI Scanner</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 w-full max-w-sm mx-auto">
            <h2 className="text-xl font-bold font-display text-ink-150 mb-4">Record Installment Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="label">Amount Received (₹)</label>
                <input
                  type="number"
                  min={1}
                  className="input font-semibold"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Payment Mode</label>
                <select
                  className="input"
                  value={payForm.paymentMode}
                  onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online Transfer</option>
                  <option value="Card">POS Card</option>
                  <option value="UPI">UPI App</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowPayModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-ink-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white text-ink-950 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative border border-gray-200">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-6">
              <div>
                <h3 className="font-bold text-xl tracking-tight text-gray-900">HIT ENGINEERING COLLEGE</h3>
                <p className="text-xs text-gray-500">Nagapattinam, Tamil Nadu — Official Fee Receipt</p>
              </div>
              <span className="font-mono text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{showReceipt.receiptNumber || 'REC-INVOICE'}</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Student Name:</span>
                <span className="font-semibold text-gray-900">{showReceipt.student?.name}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Registration Number:</span>
                <span className="font-mono font-semibold text-gray-900">{showReceipt.student?.regnum}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Department:</span>
                <span className="text-gray-800">{showReceipt.student?.department || '—'}</span>
              </div>
              <div className="grid grid-cols-2 border-t border-gray-100 pt-3">
                <span className="text-gray-500">Total Academic Fee:</span>
                <span className="font-semibold text-gray-900">₹{showReceipt.totalFee.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500 text-green-700">Total Paid Amount:</span>
                <span className="font-bold text-green-700">₹{showReceipt.paidAmount.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 text-red-600">Balance Due Outstanding:</span>
                <span className="font-bold text-red-600">₹{showReceipt.balanceDue.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 pt-2">
                <span className="text-gray-500">Last Payment Mode:</span>
                <span className="font-semibold text-gray-800">{showReceipt.paymentMode || 'Cash'}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Last Transaction Date:</span>
                <span className="text-gray-800">
                  {showReceipt.paymentDate ? new Date(showReceipt.paymentDate).toLocaleDateString() : 'No payment made'}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-[10px] text-gray-400">Computer generated receipt. No signature required.</p>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800">
                  Print Receipt
                </button>
                <button onClick={() => setShowReceipt(null)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-100">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
