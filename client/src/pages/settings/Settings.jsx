import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Settings as SettingsIcon, User, Palette, Info } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ProfileDetails from '../../components/settings/ProfileDetails'
import ThemeSelector from '../../components/settings/ThemeSelector'
import AboutPlatform from '../../components/settings/AboutPlatform'

export default function Settings() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile')

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
    }
  }, [location.state?.tab])

  const handleLogout = () => {
    logout()
    navigate(user?.role === 'student' ? '/student-login' : '/login')
  }

  const tabs = [
    { id: 'profile', label: 'Profile Details', icon: <User className="w-5 h-5" /> },
    { id: 'theme', label: 'Change Theme', icon: <Palette className="w-5 h-5" /> },
    { id: 'about', label: 'About Platform', icon: <Info className="w-5 h-5" /> },
  ]

  const renderContent = () => {
    switch(activeTab) {
      case 'profile': return <ProfileDetails />
      case 'theme': return <ThemeSelector />
      case 'about': return <AboutPlatform />
      default: return <ProfileDetails />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 h-full flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="p-2 bg-indigo-100/10 rounded-xl text-indigo-500">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-ink-50">Settings</h1>
        </div>
        
        <div className="flex flex-row md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors shrink-0 w-full ${
                activeTab === tab.id 
                  ? 'bg-ink-800 text-ink-50 shadow-sm' 
                  : 'text-ink-400 hover:bg-ink-800/50 hover:text-ink-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          
          <div className="md:pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-medium text-red-500 hover:bg-red-500/10 transition-colors shrink-0 w-full"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>
    </div>
  )
}
