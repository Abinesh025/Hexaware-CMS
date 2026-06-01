import { useEffect, useState } from 'react'
import { reportsService } from '../../services/api'
import { GraduationCap, DollarSign, Wallet, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function OfficeDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportsService.getSummary()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load office stats'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-ink-50">Office Staff Portal</h1>
        <p className="text-sm text-ink-400">Manage student enrollment admissions, invoices, and payment tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 border-ink-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-300">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Total Admitted Students</p>
            <p className="text-2xl font-bold text-ink-50">{stats?.counts?.students || 0}</p>
          </div>
        </div>

        <div className="card p-6 border-ink-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-350">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Tuition Fees Collected</p>
            <p className="text-2xl font-bold text-ink-50">₹{stats?.fees?.collected?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="card p-6 border-ink-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-400/10 flex items-center justify-center text-red-400">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-xs text-ink-500 uppercase font-mono tracking-wider">Pending Fee Balance</p>
            <p className="text-2xl font-bold text-ink-50">₹{stats?.fees?.pending?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-ink-800">
          <h3 className="font-display font-bold text-lg text-ink-100 mb-4">Operations Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/admissions" className="p-4 rounded-xl border border-ink-800 hover:border-lime-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all text-center">
              <span className="block font-semibold text-ink-200">Student Admissions</span>
              <span className="text-xs text-ink-500">Admit & edit student profiles</span>
            </Link>
            <Link to="/fees" className="p-4 rounded-xl border border-ink-800 hover:border-lime-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all text-center">
              <span className="block font-semibold text-ink-200">Tuition Fees Management</span>
              <span className="text-xs text-ink-500">Log payments & print receipts</span>
            </Link>
            <Link to="/salary" className="p-4 rounded-xl border border-ink-800 hover:border-lime-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all text-center">
              <span className="block font-semibold text-ink-200">Faculty Payroll logs</span>
              <span className="text-xs text-ink-500">View salaries & designations</span>
            </Link>
            <Link to="/analytics" className="p-4 rounded-xl border border-ink-800 hover:border-lime-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all text-center">
              <span className="block font-semibold text-ink-200">Fee Reports</span>
              <span className="text-xs text-ink-500">View financial ledger stats</span>
            </Link>
          </div>
        </div>

        <div className="card p-6 border-ink-800 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-ink-100 mb-3">Office Administration Note</h3>
            <p className="text-sm text-ink-400 mb-4 leading-relaxed">
              Ensure all newly admitted students are assigned their correct registration numbers and department tags. Transaction modes should be entered carefully when issuing fee receipts.
            </p>
          </div>
          <div className="bg-ink-950/50 p-4 border border-ink-800 rounded-xl flex items-center gap-3 text-xs text-ink-400">
            <ShieldAlert size={16} className="text-lime-300 shrink-0" />
            <span>Administrative transactions are secured with role-based checks.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
