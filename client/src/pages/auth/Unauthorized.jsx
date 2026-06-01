import { Link } from 'react-router-dom'
import { ShieldOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const roleHome = {
  admin: '/admin',
  staff: '/staff',
  student: '/student/dashboard',
  hod: '/hod',
  office_staff: '/office/dashboard',
  principal: '/principal/dashboard',
}

export default function Unauthorized() {
  const { user } = useAuth()
  const home = user ? (roleHome[user.role] || '/') : '/'

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <ShieldOff size={32} className="text-red-400" />
        </div>
        <h1 className="font-display font-700 text-2xl text-ink-50 mb-2">Access Denied</h1>
        <p className="text-ink-400 text-sm mb-8 leading-relaxed">
          You do not have permission to view this page. Please sign in with the correct account or return to your dashboard.
        </p>
        <Link to={home} className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
