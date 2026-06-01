import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { validateRegNum, regNumPlaceholder } from '../../utils/regNumValidator'
import { DEPART_CHECKER } from '../../utils/deptChecker'

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

const validateName = (name) => {
  if (!name || name.trim().length < 3) {
    toast.error('Name must contain at least 3 characters');
    return false;
  }
  if (!/^[A-Za-z\s]+$/.test(name)) {
    toast.error('Name must contain only letters (A-Za-z)');
    return false;
  }
  return true;
}

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\-_^()]).{8,}$/;
  if (!passwordRegex.test(password)) {
    toast.error('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
    return false;
  }
  return true;
}

const roleHome = {
  admin: '/admin',
  staff: '/staff',
  student: '/student/dashboard',
  hod: '/hod',
  office_staff: '/office/dashboard',
  principal: '/principal/dashboard',
}

export function LoginPage() {
  const { login, verifyStaffOtp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // OTP state
  const [requiresOtp, setRequiresOtp] = useState(false)
  const [otp, setOtp] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateEmail(form.email)) return;
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      
      if (data.requiresOtp) {
        setRequiresOtp(true)
        toast.success('OTP sent to your email')
      } else {
        const user = data.user
        toast.success(`Welcome back, ${user.name}!`)
        navigate(roleHome[user.role] || '/student/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const user = await verifyStaffOtp(form.email, otp)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/staff')
    } catch (err) {
      toast.error(err.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (requiresOtp) {
    return (
      <AuthShell title="Staff Verification" subtitle="Enter the 6-digit code sent to your email">
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="label">OTP Code</label>
            <input
              type="text"
              className="input text-center tracking-[1em] font-700 text-lg"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading ? 'Verifying…' : <>Verify & Login <ArrowRight size={15} /></>}
          </button>
          <button 
            type="button" 
            className="text-sm text-ink-500 hover:text-ink-300 w-full text-center mt-2"
            onClick={() => setRequiresOtp(false)}
          >
            Back to Login
          </button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300" onClick={() => setShow(s => !s)}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
          {loading ? 'Signing in…' : <>Sign in <ArrowRight size={15} /></>}
        </button>
      </form>
      <p className="text-center text-ink-500 text-sm mt-5">
        Don't have an account?{' '}
        <Link to="/register" className="text-lime-300 hover:text-lime-400">Create one</Link>
      </p>
      <p className="text-center text-ink-500 text-xs mt-3 border-t border-ink-800/40 pt-3">
        Office Staff?{' '}
        <Link to="/office-login" className="text-sky-300 hover:text-sky-400 font-500">Sign in here</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link to="/principal-login" className="text-amber-300 hover:text-amber-400 font-500">Principal Login</Link>
      </p>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', regnum: '', role: 'student', department: '' })
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  // Live reg-num validation state (now including department cross-check)
  const regValidation = form.regnum ? validateRegNum(form.regnum, form.role, form.department) : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateName(form.name)) return
    if (!validateEmail(form.email)) return
    if (!validatePassword(form.password)) return
    if (!form.department) {
      toast.error('Please select a department')
      return
    }

    // Client-side reg num check before hitting the server
    const rv = validateRegNum(form.regnum, form.role, form.department)
    if (!rv.valid) {
      toast.error(rv.message)
      return
    }

    setLoading(true)
    try {
      const user = await register({ ...form, regnum: form.regnum.trim().toUpperCase() })
      toast.success('Account created!')
      navigate(roleHome[user.role] || '/student/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create account" subtitle="Join Academic Hub today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" placeholder="Enter Your Name" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="you@example.com" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              className="input pr-10"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
              minLength={8}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\-_^()]).{8,}$"
              title="Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300" onClick={() => setShow(s => !s)}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {/* Role selector */}
        <div>
          <label className="label">I am a</label>
          <div className="grid grid-cols-2 gap-2">
            {['student', 'staff'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: r, regnum: '' }))}
                className={`py-2.5 rounded-xl border text-sm font-display font-500 capitalize transition-all ${
                  form.role === r
                    ? 'bg-lime-400/10 border-lime-400 text-lime-300'
                    : 'border-ink-700 text-ink-400 hover:border-ink-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
          {/* Department selector */}
        <div>
          <label className="label">Department</label>
          <select
            className="input appearance-none bg-no-repeat bg-[right_1rem_center]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1.25rem' }}
            value={form.department}
            onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
            required
          >
            <option value="" disabled>Select your department</option>
            {[
              { value: "Artificial Intelligence and Data Science", label: "Artificial Intelligence and Data Science (AIDS)" },
              { value: "Biomedical Engineering", label: "Biomedical Engineering (BME)" },
              { value: "Civil Engineering", label: "Civil Engineering (CIVIL)" },
              { value: "Computer Science and Business Systems", label: "Computer Science and Business Systems (CSBS)" },
              { value: "Computer Science and Engineering", label: "Computer Science and Engineering (CSE)" },
              { value: "Electronics and Communication Engineering", label: "Electronics and Communication Engineering (ECE)" },
              { value: "Electrical and Electronics Engineering", label: "Electrical and Electronics Engineering (EEE)" },
              { value: "Information Technology", label: "Information Technology (IT)" },
              { value: "Master of Business Administration", label: "Master of Business Administration (MBA)" },
              { value: "Master of Computer Applications", label: "Master of Computer Applications (MCA)" },
              { value: "Mechanical Engineering", label: "Mechanical Engineering (ME)" }
            ].map(dept => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
        </div>
        {/* Registration Number with live feedback */}
        <div >
          <label className="label">Registration Number</label>
          <div className="relative">
            <input
              className={`input pr-9 ${
                regValidation
                  ? regValidation.valid
                    ? 'border-lime-400/60 focus:border-lime-400'
                    : 'border-red-400/60 focus:border-red-400'
                  : ''
              }`}
              placeholder={regNumPlaceholder(form.role)}
              value={form.regnum}
              onChange={e => setForm(p => ({ ...p, regnum: e.target.value }))}
              required
            />
            {regValidation && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {regValidation.valid
                  ? <CheckCircle size={15} className="text-lime-400" />
                  : <XCircle size={15} className="text-red-400" />}
              </span>
            )}
          </div>
          {/* Hint line */}
          {regValidation && !regValidation.valid && (
            <p className="text-red-400 text-xs mt-1 mb-5">{regValidation.message}</p>
          )}
          {!regValidation && (
            <p className="text-ink-600 text-xs mt-2">
              {form.role === 'student'
                ? `Format: 8208E[YY][DEPT][3 digits] ${form.department && DEPART_CHECKER[form.department] ? `— Use: ${DEPART_CHECKER[form.department].join(' or ')}` : ''}`
                : 'Format: HITPxxx or HITPExxx'}
            </p>
          )}
        </div>
      

        <button 
          type="submit" 
          disabled={loading || (form.regnum && regValidation && !regValidation.valid)} 
          className={`btn-primary w-full justify-center mt-2 ${ (form.regnum && regValidation && !regValidation.valid) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Creating…' : <>Create account <ArrowRight size={15} /></>}
        </button>
      </form>
      <p className="text-center text-ink-500 text-sm mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-lime-300 hover:text-lime-400">Sign in</Link>
      </p>
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />
      </div>

      <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8 inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors text-sm font-500 z-10 animate-fade-in">
        <ArrowLeft size={16} /> Back to Portal
      </Link>

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-ink-950" />
          </div>
          <span className="font-display font-700 text-ink-50 text-2xl tracking-tight">Academic Hub</span>
        </div>

        <div className="card p-8">
          <h1 className="font-display font-700 text-xl text-ink-50 mb-1">{title}</h1>
          <p className="text-ink-500 text-sm mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
