import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Lock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Password Input, 2: OTP Verification
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
    otp: ''
  })

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    
    // Minimal local validation (Backend will do strict validation)
    if (formData.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters')
    }

    setLoading(true)
    try {
      await api.post('/api/auth/send-password-change-otp')
      toast.success('Verification code sent to your email')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Verify OTP
      await api.post('/api/auth/verify-password-change-otp', { otp: formData.otp })
      
      // 2. Change Password
      await api.put('/api/auth/change-password', {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })

      toast.success('Password changed successfully')
      navigate(-1) // Go back to previous page
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-ink-900 border border-ink-800 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-ink-800 rounded-lg text-ink-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-700 text-ink-100 font-display">Change Password</h1>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="p-4 bg-lime-400/5 border border-lime-400/10 rounded-xl mb-4 text-xs text-lime-300">
            <p className="flex items-center gap-2">
              <ShieldCheck size={14} />
              A verification code will be sent to your registered email.
            </p>
          </div>
          
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
              <input
                type="password"
                className="input pl-10"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
              <input
                type="password"
                className="input pl-10"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Sending Code...' : <>Send Verification Code <ArrowRight size={16} className="ml-2" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndChange} className="space-y-4">
          <div className="p-4 bg-sky-400/5 border border-sky-400/10 rounded-xl mb-4 text-xs text-sky-400">
            <p className="flex items-center gap-2">
              <ShieldCheck size={14} />
              Enter the 6-digit code sent to your email.
            </p>
          </div>

          <div>
            <label className="label">Verification Code</label>
            <input
              type="text"
              className="input text-center tracking-[1em] text-lg font-700"
              placeholder="000000"
              maxLength={6}
              value={formData.otp}
              onChange={e => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Changing Password...' : 'Verify & Update Password'}
          </button>
          
          <button 
            type="button" 
            className="w-full text-center text-sm text-ink-500 hover:text-ink-300"
            onClick={() => setStep(1)}
          >
            Change Password again?
          </button>
        </form>
      )}
    </div>
  )
}
