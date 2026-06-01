import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function EditProfile() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put('/api/auth/profile', { name, phone })
      if (data.success) {
        setUser(data.user)
        toast.success('Profile updated successfully')
        navigate('/settings')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <button 
        onClick={() => navigate('/settings')}
        className="flex items-center gap-2 text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </button>

      <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-sm border border-ink-200 dark:border-ink-800 overflow-hidden">
        <div className="p-6 border-b border-ink-200 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-950/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink-900 dark:text-white">Edit Profile</h1>
              <p className="text-sm text-ink-500 dark:text-ink-400">Update your personal information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-900 dark:text-ink-100">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-ink-950 border border-ink-300 dark:border-ink-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all text-ink-900 dark:text-ink-100"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-900 dark:text-ink-100">Email Address</label>
              <input 
                type="email" 
                defaultValue={user?.email || ''}
                readOnly
                className="w-full px-4 py-2 bg-ink-50 dark:bg-ink-900/50 border border-ink-300 dark:border-ink-700 rounded-lg text-ink-500 dark:text-ink-400 cursor-not-allowed"
              />
              <p className="text-xs text-ink-500 dark:text-ink-400">Email address cannot be changed</p>
            </div>
            {user?.phone !== undefined && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-900 dark:text-ink-100">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-ink-950 border border-ink-300 dark:border-ink-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all text-ink-900 dark:text-ink-100"
                  placeholder="Enter your phone number"
                />
              </div>
            )}
            {user?.department !== undefined && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-900 dark:text-ink-100">Department</label>
                <input 
                  type="text" 
                  defaultValue={user?.department || ''}
                  readOnly
                  className="w-full px-4 py-2 bg-ink-50 dark:bg-ink-900/50 border border-ink-300 dark:border-ink-700 rounded-lg text-ink-500 dark:text-ink-400 cursor-not-allowed"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-ink-200 dark:border-ink-800">
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
