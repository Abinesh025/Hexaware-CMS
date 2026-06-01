import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const validateEmail = (email) => {
  if (/[A-Z]/.test(email)) {
    toast.error('Capital letters are not allowed in email');
    return false;
  }
  const localPart = email.split('@')[0];
  if (localPart && /^\d+$/.test(localPart)) {
    toast.error('Email prefix cannot consist of only numbers');
    return false;
  }
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(email)) {
    toast.error('Invalid email format');
    return false;
  }
  return true;
}

export default function OfficeStaffLogin() {
  const { officeLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateEmail(form.email)) return
    setLoading(true)
    try {
      const data = await officeLogin(form.email, form.password)
      const user = data.user
      toast.success(`Welcome back, ${user.name || 'Office Staff'}!`)
      navigate('/office/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" />
      </div>

      <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8 inline-flex items-center gap-2 text-ink-400 hover:text-sky-300 transition-colors text-sm font-500 z-10 animate-fade-in">
        <ArrowLeft size={16} /> Back to Portal
      </Link>

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-ink-950" />
          </div>
          <span className="font-display font-700 text-ink-50 text-2xl tracking-tight">Academic Hub</span>
        </div>

        <div className="card p-8 border border-ink-800 bg-ink-900/60 backdrop-blur-md">
          <h1 className="font-display font-700 text-xl text-ink-50 mb-1">Office Portal</h1>
          <p className="text-ink-500 text-sm mb-6">Sign in to manage admissions, faculty details & salary</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-ink-300">Office Email</label>
              <input
                type="email"
                className="input focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                placeholder="office@hit.edu.in"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label text-ink-300">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input pr-10 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300"
                  onClick={() => setShow(s => !s)}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-ink-950 rounded-xl text-sm font-600 transition shadow-lg shadow-sky-400/10 mt-2"
            >
              {loading ? 'Signing in…' : <>Office Login <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-800 text-center">
            <Link to="/login" className="text-ink-400 hover:text-sky-300 text-xs">
              Go to standard Student/Staff Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
