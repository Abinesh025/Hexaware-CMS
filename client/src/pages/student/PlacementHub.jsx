import { Link } from 'react-router-dom'
import { ArrowLeft, Briefcase, Building2, Globe } from 'lucide-react'

export default function PlacementHub() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors text-sm font-500"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div>
        <h1 className="page-title mb-1">Placement Preparation</h1>
        <p className="text-ink-500 text-sm">Resources for on-campus and off-campus placement readiness.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/student/placement/on-campus"
          className="card p-6 hover:border-lime-300/30 transition-all group"
        >
          <div className="w-10 h-10 bg-lime-300/10 rounded-xl flex items-center justify-center mb-4">
            <Building2 size={20} className="text-lime-300" />
          </div>
          <h2 className="text-ink-100 font-600 mb-1">On-Campus</h2>
          <p className="text-ink-500 text-sm">Company visits, aptitude prep, and interview guides.</p>
        </Link>

        <Link
          to="/student/placement/off-campus"
          className="card p-6 hover:border-sky-400/30 transition-all group"
        >
          <div className="w-10 h-10 bg-sky-400/10 rounded-xl flex items-center justify-center mb-4">
            <Globe size={20} className="text-sky-400" />
          </div>
          <h2 className="text-ink-100 font-600 mb-1">Off-Campus</h2>
          <p className="text-ink-500 text-sm">External opportunities and application tips.</p>
        </Link>
      </div>

      <div className="card p-5 flex items-start gap-3 border-ink-800">
        <Briefcase size={18} className="text-ink-500 shrink-0 mt-0.5" />
        <p className="text-ink-400 text-sm leading-relaxed">
          Placement resources may vary by department. Contact your department coordinator for the latest drives and eligibility criteria.
        </p>
      </div>
    </div>
  )
}
