import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, ShieldCheck, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  // If already logged in as admin via session storage, redirect
  useEffect(() => {
    if (sessionStorage.getItem("adminToken")) {
      navigate("/admin");
    }
  }, [navigate]);

  // Determine where "Back to Portal" should go
  const getBackRoute = () => {
    if (!user) return '/'
    if (user.role === 'staff') return '/staff'
    if (user.role === 'student') return '/student'
    return '/'
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password) return toast.error('Please enter the admin password')

    setLoading(true)
    try {
      const res = await api.post('/api/auth/verify-password', { password })
      sessionStorage.setItem('adminToken', res.data.adminToken)
      toast.success('Admin Access Granted')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-300/10 rounded-full blur-3xl pointer-events-none" />

      <button 
        onClick={() => navigate(getBackRoute())}
        className="absolute top-8 left-8 flex items-center gap-2 text-ink-500 hover:text-ink-300 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-500">Back to Portal</span>
      </button>

      <div className="w-full max-w-md bg-ink-900 border border-ink-800 rounded-3xl p-8 z-10 animate-fade-up shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-4 border border-yellow-600/20">
            <ShieldCheck size={32} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-display font-700 text-ink-50">Admin Authentication</h1>
          <p className="text-ink-400 text-sm mt-2 text-center">
            Restricted access. Please enter the master password to continue to the administration dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-500 text-ink-300 ml-1">Master Password</label>
            <div className="relative">
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="password"
                className="input pl-11 w-full bg-ink-950/50"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                autoComplete="new-password"
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-ink-950 shadow-lg shadow-sky-400/20"
          >
            {loading ? 'Verifying...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
