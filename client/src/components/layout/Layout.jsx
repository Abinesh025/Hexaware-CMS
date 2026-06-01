import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { authService } from '../../services/api'
import toast from 'react-hot-toast'
import Navbar from './Navbar'
import Footer from './Footer'
import {
  LayoutDashboard, BookOpen, FileText, MessageSquare,
  Users, BarChart3, LogOut, X,
  GraduationCap, ChevronDown, Settings, ShieldCheck,
  PanelLeft, PanelLeftClose, Lock, Briefcase, Building2,Bell
} from 'lucide-react'
import clsx from 'clsx';

const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/profile', label: 'My Profile', icon: Users },
  { to: '/courses', label: 'Course Catalog', icon: BookOpen },
  { to: '/student/attendance', label: 'My Attendance', icon: FileText },
  { to: '/student/marks', label: 'My Grades', icon: BarChart3 },
  { to: '/student/fees', label: 'Fee Details', icon: Briefcase },
  { to: '/parent-report', label: 'Progress Report', icon: FileText },
  { to: '/student/materials', label: 'LMS Materials', icon: BookOpen },
  { to: '/student/tests', label: 'LMS Tests', icon: FileText },
  { to: '/student/results', label: 'LMS Test Results', icon: BarChart3 },
  { to: '/student/chat', label: 'LMS Chat', icon: MessageSquare },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/settings', label: 'Settings', icon: Settings },
]

const departmentComponentMap = {
  "Computer Science and Engineering": ["Learn About AI", "Learn About Ai"],
  "Computer Science and Business Systems": ["Learn About AI", "Learn About Ai"],
  "Artificial Intelligence and Data Science": ["Learn About AI", "Learn About Ai"],
  "Information Technology": ["Learn About AI", "Learn About Ai"],
  "Electronics and Communication Engineering": ["Learn About Micro-Controller"],
  "Electrical and Electronics Engineering": ["Learn About Micro-Controller"],
  "Mechanical Engineering": ["Learn About Designs"],
  "Civil Engineering":["Learn About Constructions"]
}

const staffNav = [
  { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/attendance', label: 'Attendance Entry', icon: X },
  { to: '/marks', label: 'Marks Entry', icon: FileText },
  { to: '/parent-report', label: 'Student Reports', icon: FileText },
  { to: '/staff/materials', label: 'LMS Materials', icon: BookOpen },
  { to: '/staff/tests', label: 'LMS Tests', icon: FileText },
  { to: '/staff/results', label: 'LMS Test Results', icon: BarChart3 },
  { to: '/staff/chat', label: 'LMS Chat', icon: MessageSquare },
]

const hodNav = [
  { to: '/hod', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/hod/coordinators', label: 'Coordinator Mgmt', icon: Users },
  { to: '/courses', label: 'Course Management', icon: BookOpen },
  { to: '/marks', label: 'Approve Grades', icon: BarChart3 },
  { to: '/attendance', label: 'Attendance Approval', icon: BarChart3 },
  { to: '/analytics', label: 'Dept Analytics', icon: BarChart3 },
  { to: '/staff/chat', label: 'LMS Chat', icon: MessageSquare },
]

const officeNav = [
  { to: '/office/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/office/admissions', label: 'Student Admissions', icon: GraduationCap },
  { to: '/office/faculty', label: 'Faculty Details', icon: Users },
  { to: '/office/salary', label: 'Faculty Salary', icon: Briefcase },
]

const principalNav = [
  { to: '/principal/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/principal/hod-management', label: 'HOD Management', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/faculty', label: 'Faculty Summary', icon: Users },
  { to: '/admissions', label: 'Student Records', icon: GraduationCap },
  { to: '/analytics', label: 'Reports & Analytics', icon: BarChart3 },
]

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/staff', label: 'Staff Management', icon: Users },
  { to: '/admin/students', label: 'Student Management', icon: GraduationCap },
  { to: '/admin/hod-management', label: 'HOD Management', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/faculty', label: 'Faculty Profiles', icon: Users },
  { to: '/marks', label: 'Marks Ledger', icon: BarChart3 },
  { to: '/fees', label: 'Fees System', icon: Briefcase },
  { to: '/labs', label: 'Lab Infrastructure', icon: Settings },
  { to: '/salary', label: 'Salaries', icon: Briefcase },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { isLight, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [placementOpen, setPlacementOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === null ? true : saved === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', next);
      return next;
    });
  };
  const [showExitModal, setShowExitModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  // Navigation verification state
  const [showNavModal, setShowNavModal] = useState(false)
  const [pendingNav, setPendingNav] = useState(null)

  // Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileData, setProfileData] = useState({ name: '', file: null })
  const [isUpdating, setIsUpdating] = useState(false)

  const isAdminRoute = !!sessionStorage.getItem('adminToken')

  const filteredStudentNav = studentNav.filter(item => {
    const labelLower = item.label.toLowerCase();
    const deptSpecificLabels = [
      'learn about ai',
      'learn about micro-controller',
      'learn about designs',
      'learn about constructions'
    ];

    if (!deptSpecificLabels.includes(labelLower)) {
      return true;
    }

    const userDept = user?.department;
    if (!userDept || !departmentComponentMap[userDept]) {
      return true;
    }

    const allowedComponents = departmentComponentMap[userDept];
    return allowedComponents.some(allowed => allowed.toLowerCase() === labelLower);
  });

  const navItems =
    isAdminRoute ? adminNav :
    user?.role === 'staff' ? staffNav :
    user?.role === 'hod' ? hodNav :
    user?.role === 'office_staff' ? officeNav :
    user?.role === 'principal' ? principalNav :
    filteredStudentNav

  // Resolve avatar URL — works in dev (Vite proxy for /uploads) and production
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null
    if (avatarPath.startsWith('http')) return avatarPath
    const base = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
      : ''
    return `${base}${avatarPath}`
  }

  const handleLogout = () => {
    const dest = user?.role === 'student' ? '/student-login' : '/login'
    logout()
    navigate(dest)
  }

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminToken')
    const redirects = {
      admin: '/admin',
      staff: '/staff',
      student: '/student/dashboard',
      hod: '/hod',
      office_staff: '/office',
      principal: '/principal'
    }
    const dest = user ? (redirects[user.role] || '/') : '/'
    navigate(dest)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    // Name validation
    if (profileData.name) {
      if (profileData.name.trim().length < 3) {
        toast.error('Name must contain at least 3 characters');
        return;
      }
      if (!/^[A-Za-z\s]+$/.test(profileData.name)) {
        toast.error('Name must contain only letters (A-Za-z)');
        return;
      }
    }

    setIsUpdating(true)
    try {
      const formData = new FormData()
      if (profileData.name) formData.append('name', profileData.name)
      if (profileData.file) formData.append('avatar', profileData.file)

      const res = await authService.updateProfile(formData)
      window.location.reload() // Fast & unified way to refresh auth state everywhere
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const initials = isAdminRoute ? 'AD' : user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const roleLabel =
    isAdminRoute ? '⬡ Admin' :
    user?.role === 'staff' ? '★ Staff' :
    user?.role === 'hod' ? '✦ HOD' :
    user?.role === 'office_staff' ? '⚙ Office' :
    user?.role === 'principal' ? '👑 Principal' :
    '◆ Student'

  const roleBadgeClass =
    isAdminRoute ? 'tag-sky' :
    user?.role === 'staff' ? 'tag-lime' :
    user?.role === 'hod' ? 'tag-amber' :
    user?.role === 'office_staff' ? 'tag-sky' :
    user?.role === 'principal' ? 'tag-amber' :
    'tag-sky'

  const Sidebar = ({ collapsed, onToggle }) => (
    <aside className={clsx(
      collapsed ? 'w-16 opacity-100' : 'w-64 opacity-100',
      'flex flex-col h-full bg-ink-900 border-ink-800 transition-all duration-300 overflow-hidden border-r'
    )}>
      {/* Logo */}
      <div className={clsx(
        "flex items-center justify-between gap-3 border-b border-ink-800",
        collapsed ? "px-2 py-5 justify-center" : "px-5 py-5"
      )}>
        {collapsed ? (
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-ink-800 text-ink-400" title="Expand Sidebar">
            <PanelLeft size={18} />
          </button>
        ) : (
          <>
            <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-display font-700 text-ink-50 text-lg tracking-tight truncate">
              Academic Hub
            </span>
            <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-ink-800 text-ink-400 shrink-0" title="Collapse Sidebar">
              <PanelLeftClose size={18} />
            </button>
          </>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-5 py-3">
          <span className={clsx('badge text-xs', roleBadgeClass, roleLabel==="⬡ Admin" ? "bg-yellow-100 text-yellow" : "")}>
            {roleLabel}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const { to, label, icon: Icon, end } = item
          // Helper to determine if active manually:
          const isActive = end ? window.location.pathname === to : window.location.pathname.startsWith(to)
          return (
            <button
              key={to}
              title={collapsed ? label : undefined}
              onClick={() => {
                setOpen(false)
                if (isActive) return // Do nothing if already there
                
                const isStaffInAdmin = false // Handled natively by separate admin now
                
                if (isStaffInAdmin && to.startsWith('/staff')) {
                  setPendingNav(item)
                  setShowNavModal(true)
                } else {
                  navigate(to)
                }
              }}
              className={clsx('nav-link w-full text-left', isActive && 'active', collapsed && 'justify-center px-0')}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          )
        })}
      </nav>

      {user?.role === 'student' && (user.department === 'Computer Science and Engineering' || user.department === 'Computer Science and Business Systems' || user.department === 'Electronics and Communication Engineering') && (
        <div className="border-t border-ink-800 px-3 py-2 space-y-0.5">
          <button
            title={collapsed ? "Placement Preparation" : undefined}
            onClick={() => {
              if (collapsed) {
                onToggle()
                setPlacementOpen(true)
              } else {
                setPlacementOpen(!placementOpen)
              }
            }}
            className={clsx(
              'nav-link w-full text-left flex items-center justify-between',
              (window.location.pathname.startsWith('/student/placement')) && 'active',
              collapsed && 'justify-center px-0'
            )}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={16} className="shrink-0 text-ink-400" />
              {!collapsed && <span className="truncate">Placement Prep</span>}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={14} 
                className={clsx('shrink-0 text-ink-500 transition-transform duration-200', placementOpen && 'rotate-180')} 
              />
            )}
          </button>
          
          {placementOpen && !collapsed && (
            <div className="pl-6 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => { setOpen(false); navigate('/student/placement'); }}
                className={clsx(
                  'nav-link w-full text-left text-xs py-1.5 px-3 flex items-center gap-2',
                  window.location.pathname === '/student/placement' ? 'active font-500 text-lime-300 bg-lime-400/5' : 'text-ink-400 hover:text-ink-200'
                )}
              >
                <span className="w-1 h-1 rounded-full bg-lime-400"></span>
                Hub
              </button>
              <button
                onClick={() => { setOpen(false); navigate('/student/placement/on-campus'); }}
                className={clsx(
                  'nav-link w-full text-left text-xs py-1.5 px-3 flex items-center gap-2',
                  window.location.pathname === '/student/placement/on-campus' ? 'active font-500 text-lime-300 bg-lime-400/5' : 'text-ink-400 hover:text-ink-200'
                )}
              >
                <span className="w-1 h-1 rounded-full bg-lime-400"></span>
                On-Campus
              </button>
              <button
                onClick={() => { setOpen(false); navigate('/student/placement/off-campus'); }}
                className={clsx(
                  'nav-link w-full text-left text-xs py-1.5 px-3 flex items-center gap-2',
                  window.location.pathname === '/student/placement/off-campus' ? 'active font-500 text-sky-300 bg-sky-400/5' : 'text-ink-400 hover:text-ink-200'
                )}
              >
                <span className="w-1 h-1 rounded-full bg-sky-400"></span>
                Off-Campus
              </button>
            </div>
          )}
        </div>
      )}

      {/* User area removed from sidebar */}
    </aside>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-ink-950">
      
      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
            <form onSubmit={handleProfileUpdate} className="p-6">
              <h3 className="text-lg font-600 text-ink-100 mb-4 font-display">
                Edit Profile
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-ink-400 mb-1">Avatar Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileData({ ...profileData, file: e.target.files[0] })}
                    className="w-full text-sm text-ink-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-lime-400/10 file:text-lime-300 hover:file:bg-lime-400/20 transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs text-ink-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-ink-100 text-sm focus:outline-none focus:border-lime-400"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileModal(false)
                      navigate('/change-password')
                    }}
                    className="w-full flex items-center justify-center gap-2 text-lime-300 text-sm font-500 hover:text-lime-400 transition-colors p-2 bg-lime-400/5 rounded-xl border border-lime-400/10"
                  >
                    <Lock size={14} />
                    Change Security Password
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 border border-ink-700 bg-ink-800/50 hover:bg-ink-800 
                           text-ink-300 rounded-xl text-sm font-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-50
                           text-white rounded-xl text-sm font-600 transition shadow-lg shadow-lime-400/20"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Modal */}
      {showNavModal && pendingNav && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-sky-400/10 flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-sky-400" />
              </div>
              <h3 className="text-lg font-600 text-ink-100 mb-2 font-display">
                Exit Admin Mode?
              </h3>
              <p className="text-sm text-ink-400 leading-relaxed mb-6">
                Are you sure you want to lock the admin controls, exit Admin Mode, and go to {pendingNav.label}?
                {user || isAdminRoute ? (
                    <div className="flex items-center gap-2">
                        {/* Profile Icon */}
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center border",
                            isAdminRoute ? "bg-sky-400/10 border-sky-400/20" : "bg-lime-400/10 border-lime-400/20"
                        )}>
                            <span className={clsx(
                                "font-display font-600 text-xs",
                                isAdminRoute ? "text-sky-400" : "text-lime-300"
                            )}>{initials}</span>
                        </div>
                        {/* Settings Button */}
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                            title="Settings"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                ) : null}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNavModal(false)
                    setPendingNav(null)
                  }}
                  className="flex-1 px-4 py-2 border border-ink-700 bg-ink-800/50 hover:bg-ink-800 
                           text-ink-300 rounded-xl text-sm font-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('adminToken')
                    navigate(pendingNav.to)
                    setShowNavModal(false)
                    setPendingNav(null)
                  }}
                  className="flex-1 px-4 py-2 bg-sky-400 hover:bg-sky-300 
                           text-white rounded-xl text-sm font-600 transition shadow-lg shadow-sky-400/20"
                >
                  Yes, Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-red-400/10 flex items-center justify-center mb-4">
                <LogOut size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-600 text-ink-100 mb-2 font-display">
                Sign Out?
              </h3>
              <p className="text-sm text-ink-400 leading-relaxed mb-6">
                Are you sure you want to sign out of your account? You will need to log back in to access your dashboard.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 border border-ink-700 bg-ink-800/50 hover:bg-ink-800 
                           text-ink-300 rounded-xl text-sm font-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false)
                    handleLogout()
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-400 
                           text-white rounded-xl text-sm font-600 transition shadow-lg shadow-red-500/20"
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Admin Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-sky-400/10 flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-sky-400" />
              </div>
              <h3 className="text-lg font-600 text-ink-100 mb-2 font-display">
                Exit Admin Mode?
              </h3>
              <p className="text-sm text-ink-400 leading-relaxed mb-6">
                Are you sure you want to lock the admin controls and return to your standard dashboard?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 px-4 py-2 border border-ink-700 bg-ink-800/50 hover:bg-ink-800 
                           text-ink-300 rounded-xl text-sm font-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false)
                    handleAdminLogout()
                  }}
                  className="flex-1 px-4 py-2 bg-sky-400 hover:bg-sky-300 
                           text-white rounded-xl text-sm font-600 transition shadow-lg shadow-sky-400/20"
                >
                  Yes, Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Navbar spans full width ── */}
      <Navbar 
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={() => setOpen(true)} 
        onEditProfile={() => {
          setProfileData({ name: user?.name || '', file: null })
          setShowProfileModal(true)
        }}
        onLogout={() => setShowLogoutModal(true)}
        onExitAdmin={() => setShowExitModal(true)}
        isAdminRoute={isAdminRoute}
      />

      {/* ── Middle row: sidebar + scrollable content ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        
        {/* Desktop sidebar — sits between navbar and footer */}
        <div className="hidden md:flex md:flex-shrink-0">
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Mobile sidebar overlay */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="flex-shrink-0">
              <Sidebar collapsed={false} onToggle={() => setOpen(false)} />
            </div>
            <div className="flex-1 bg-ink-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto min-w-0 transition-all duration-300">
          {children}
        </main>
      </div>

      {/* ── Footer spans full width ── */}
      <Footer />
    </div>
  )
}
