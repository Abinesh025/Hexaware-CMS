import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ProfileDetails from '../../components/settings/ProfileDetails'

export default function StudentProfile() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors text-sm font-500"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <ProfileDetails />
    </div>
  )
}
