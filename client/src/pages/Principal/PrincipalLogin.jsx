import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function PrincipalLogin() {
  const { principalLogin } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Email and password are required')
      return
    }
    setLoading(true)
    try {
      await principalLogin(form.email, form.password)
      toast.success('Welcome, Principal!')
      navigate('/principal/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-600/3 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/20 mb-4 shadow-lg shadow-amber-400/10">
            <ShieldCheck size={30} className="text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Principal Access</h1>
          <p className="text-sm text-ink-400 mt-1">Institutional Authority Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-ink-900/90 border border-ink-800 rounded-2xl p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono font-semibold">
              👑 Principal Authentication
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label text-ink-300">Institutional Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
                <input
                  id="principal-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="principal@college.edu"
                  className="input pl-10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label text-ink-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
                <input
                  id="principal-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your secure password"
                  className="input pl-10 pr-10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="principal-login-btn"
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:bg-ink-700 disabled:text-ink-500 text-ink-950 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-ink-950 border-t-transparent rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Sign In as Principal
                </>
              )}
            </button>
          </form>

          {/* Session notice */}
          <div className="mt-6 p-3 bg-ink-950/60 border border-ink-800 rounded-xl text-xs text-ink-500 text-center">
            🔒 Session auto-expires after 15 minutes of inactivity
          </div>
        </div>

        {/* Back to login */}
        <p className="text-center mt-6 text-sm text-ink-500">
          Not the Principal?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
            Return to General Login
          </Link>
        </p>
      </div>
    </div>
  )
}
