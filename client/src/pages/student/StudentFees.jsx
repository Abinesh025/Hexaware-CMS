import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentService } from '../../services/api'
import { ArrowLeft, DollarSign, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentFees() {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentService.getFees()
      .then(res => {
        const data = res.data?.data
        setFees(Array.isArray(data) ? data : (data ? [data] : []))
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setFees([])
        } else {
          toast.error('Failed to load fee details')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors text-sm font-500"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div>
        <h1 className="page-title mb-1">Fee Details</h1>
        <p className="text-ink-500 text-sm">View your fee records — payments are managed by the office.</p>
      </div>

      {loading ? (
        <div className="card p-12 animate-pulse h-48" />
      ) : fees.length === 0 ? (
        <div className="card p-12 text-center">
          <DollarSign size={32} className="text-ink-700 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">No fee records found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fees.map((fee) => {
            const due = (fee.totalFee || 0) - (fee.paidAmount || 0)
            const isPaid = due <= 0
            return (
              <div key={fee._id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-ink-100 font-500 text-sm mb-1">Fee Record</p>
                  <div className="flex flex-wrap gap-4 text-xs text-ink-500">
                    <span>Total: ₹{fee.totalFee?.toLocaleString()}</span>
                    <span>Paid: ₹{(fee.paidAmount || 0).toLocaleString()}</span>
                    {!isPaid && <span className="text-amber-400">Due: ₹{due.toLocaleString()}</span>}
                  </div>
                </div>
                <span className={`badge inline-flex items-center gap-1 ${isPaid ? 'tag-lime' : 'tag-amber'}`}>
                  {isPaid ? <><CheckCircle size={12} /> Paid</> : <><Clock size={12} /> Pending</>}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
