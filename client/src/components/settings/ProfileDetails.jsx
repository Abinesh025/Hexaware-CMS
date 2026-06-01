import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Edit } from 'lucide-react'

export default function ProfileDetails() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div className="bg-ink-900 rounded-2xl p-6 md:p-8 shadow-sm border border-ink-800 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
            <User className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-semibold text-ink-50">Profile Details</h3>
        </div>
        <button
          onClick={() => navigate('/profile/edit')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-ink-800" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow w-full">
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink-400">Full Name</p>
            <p className="font-semibold text-lg text-ink-50">{user.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink-400">Email Address</p>
            <p className="font-semibold text-lg text-ink-50">{user.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink-400">Role</p>
            <p className="font-semibold text-lg capitalize text-ink-50">{user.role}</p>
          </div>
          {user.department && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-ink-400">Department</p>
              <p className="font-semibold text-lg text-ink-50">{user.department}</p>
            </div>
          )}
          {user.registerNumber && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-ink-400">Register Number</p>
              <p className="font-semibold text-lg text-ink-50">{user.registerNumber}</p>
            </div>
          )}
          {user.phone && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-ink-400">Phone Number</p>
              <p className="font-semibold text-lg text-ink-50">{user.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
