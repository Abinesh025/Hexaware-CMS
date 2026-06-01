import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout  from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import { LoginPage, RegisterPage } from './pages/auth/AuthPages'
import ChangePassword from './pages/auth/ChangePassword'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile from './pages/student/StudentProfile'
import StudentMaterials from './pages/student/StudentMaterials'
import StudentTests from './pages/student/StudentTests'
import TakeTest from './pages/student/TakeTest'
import StudentResults from './pages/student/StudentResults'
import StudentAttendance from './pages/student/StudentAttendance'
import StudentMarks from './pages/student/StudentMarks'
import StudentFees from './pages/student/StudentFees'
import PlacementHub from './pages/student/PlacementHub'
import StudentChat from './pages/student/StudentChat'
import StudentNotifications from './pages/student/StudentNotifications'
import StudentSettings from './pages/student/StudentSettings'
import StudentProtectedRoute from './components/auth/StudentProtectedRoute'
import Unauthorized from './pages/auth/Unauthorized'
import ChatPage from './pages/student/ChatPage'
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffMaterials from './pages/staff/StaffMaterials'
import StaffTests from './pages/staff/StaffTests'
import StaffResults from './pages/staff/StaffResults'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStaff from './pages/admin/AdminStaff'
import AdminStudents from './pages/admin/AdminStudents'
import AdminHodManagement from './pages/admin/AdminHodManagement'
import AdminMaterials from './pages/admin/AdminMaterials'
import AdminTests from './pages/admin/AdminTests'
import AdminResults from './pages/admin/AdminResults'
import AdminLogin from './pages/admin/AdminLogin'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Ai from './pages/DeptContent/Ai'
import EEE from './pages/DeptContent/EEE'

// CMIS New Pages Imports
import StudentAdmission from './pages/cmis/StudentAdmission'
import DepartmentManagement from './pages/cmis/DepartmentManagement'
import CourseManagement from './pages/cmis/CourseManagement'
import FacultyManagement from './pages/cmis/FacultyManagement'
import AttendanceManagement from './pages/cmis/AttendanceManagement'
import MarksManagement from './pages/cmis/MarksManagement'
import FeeManagement from './pages/cmis/FeeManagement'
import SalaryManagement from './pages/cmis/SalaryManagement'
import LabManagement from './pages/cmis/LabManagement'
import ReportsDashboard from './pages/cmis/ReportsDashboard'
import ParentReport from './pages/cmis/ParentReport'
import HodDashboard from './pages/cmis/HodDashboard'
import HodCoordinators from './pages/cmis/HodCoordinators'
import OfficeStaffLogin from './pages/auth/OfficeStaffLogin'
import OfficeDashboard from './pages/office/OfficeDashboard'
import StudentAdmissions from './pages/office/StudentAdmissions'
import FacultyDetails from './pages/office/FacultyDetails'
import FacultySalary from './pages/office/FacultySalary'
import PrincipalLogin from './pages/Principal/PrincipalLogin'
import PrincipalDashboard from './pages/Principal/PrincipalDashboard'
import HodManagement from './pages/Principal/HodManagement'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />

  const path = location.pathname
  const hasAdminToken = !!sessionStorage.getItem('adminToken')

  // 1. Unauthenticated users: redirect based on route namespace
  if (!user && !hasAdminToken) {
    if (path.startsWith('/admin')) {
      return <Navigate to="/admin-login" replace />
    }
    if (path.startsWith('/principal')) {
      return <Navigate to="/principal-login" replace />
    }
    if (path.startsWith('/office')) {
      return <Navigate to="/office-login" replace />
    }
    if (path.startsWith('/student')) {
      return <Navigate to="/student-login" replace />
    }
    return <Navigate to="/login" replace />
  }

  // 2. Determine active role
  const activeRole = hasAdminToken ? 'admin' : (user ? user.role : null)

  // 3. Normal role checks
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role]
    const isAllowed = allowedRoles.includes(activeRole)

    if (!isAllowed) {
      const redirects = {
        admin: '/admin',
        staff: '/staff',
        student: '/student/dashboard',
        hod: '/hod',
        office_staff: '/office/dashboard',
        principal: '/principal/dashboard'
      }
      const redirect = redirects[activeRole] || '/'
      return <Navigate to={redirect} replace />
    }
  }

  return children
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin" />
        <p className="text-ink-500 text-sm">Loading…</p>
      </div>
    </div>
  )
}



import { Helmet } from 'react-helmet-async'

function StudentLayout({ children }) {
  return (
    <StudentProtectedRoute>
      <Layout>{children}</Layout>
    </StudentProtectedRoute>
  )
}

const routeTitles = {
  '/': 'Home',
  '/login': 'Login',
  '/student-login': 'Student Login',
  '/register': 'Register',
  '/unauthorized': 'Access Denied',
  '/admin-login': 'Admin Login',
  '/student/dashboard': 'Student Dashboard',
  '/student/profile': 'My Profile',
  '/student/materials': 'Materials',
  '/student/tests': 'Tests',
  '/student/results': 'Results',
  '/student/attendance': 'My Attendance',
  '/student/marks': 'My Grades',
  '/student/fees': 'Fee Details',
  '/student/placement': 'Placement Hub',
  '/student/chat': 'Chat',
  '/student/notifications': 'Notifications',
  '/student/settings': 'Settings',
  '/student/placement/on-campus': 'On-Campus Placement',
  '/student/placement/off-campus': 'Off-Campus Placement',
  '/staff': 'Staff Dashboard',
  '/staff/materials': 'Materials',
  '/staff/tests': 'Tests',
  '/staff/results': 'Results',
  '/staff/chat': 'Chat',
  '/admin': 'Admin Dashboard',
  '/admin/staff': 'Staff Management',
  '/admin/students': 'Student Management',
  '/admin/hod-management': 'HOD Assignment Management',
  '/admin/materials': 'Materials Management',
  '/admin/tests': 'Tests Management',
  '/admin/results': 'Results Management',
  '/admissions': 'Student Admissions',
  '/departments': 'Department Management',
  '/courses': 'Course Management',
  '/faculty': 'Faculty Management',
  '/attendance': 'Attendance Management',
  '/marks': 'Marks Management',
  '/fees': 'Fee Management',
  '/salary': 'Salary Management',
  '/labs': 'Lab Infrastructure',
  '/analytics': 'Reports & Analytics',
  '/parent-report': 'Parent Progress Report',
  '/hod': 'HOD Dashboard',
  '/office-login': 'Office Portal Login',
  '/office/dashboard': 'Office Staff Dashboard',
  '/office/admissions': 'Student Admissions Registry',
  '/office/faculty': 'Faculty Registry',
  '/office/salary': 'Faculty Payroll Registry',
  '/principal-login': 'Principal Login',
  '/principal/dashboard': 'Principal Dashboard',
  '/principal/hod-management': 'HOD Management'
}

function DynamicTitle() {
  const location = useLocation()
  let currentTitle = routeTitles[location.pathname] || ''
  if (!currentTitle && location.pathname.startsWith('/student/test/')) {
    currentTitle = 'Take Test'
  }
  const pageTitle = currentTitle ? `${currentTitle} | Academic Hub` : 'Academic Hub'

  return (
    <Helmet>
      <title>{pageTitle}</title>
    </Helmet>
  )
}

import Settings from './pages/settings/Settings'
import EditProfile from './pages/settings/EditProfile'
import MechEnggSyllabus from './pages/DeptContent/Mech'
import CivilEnggTopics from './pages/DeptContent/Civil'
import PlacementOnCampus from './pages/student/PlacementOnCampus'
import PlacementOffCampus from './pages/student/PlacementOffCampus'

function AppRoutes() {
  const { user, loading } = useAuth()
  const hasAdminToken = !!sessionStorage.getItem('adminToken')
  const navigate = useNavigate()
  
  useEffect(() => {
    let timeoutId

    const resetTimer = () => {
      clearTimeout(timeoutId)
      // Only set timer if admin or principal is logged in
      if (sessionStorage.getItem('adminToken')) {
        timeoutId = setTimeout(() => {
          sessionStorage.removeItem('adminToken')
          toast.error('Admin session expired due to inactivity')
          window.location.href = '/admin-login'
        }, 15 * 60 * 1000) // 15 mins
      } else if (user?.role === 'principal' && localStorage.getItem('token')) {
        timeoutId = setTimeout(() => {
          localStorage.removeItem('token')
          toast.error('Principal session expired due to inactivity')
          window.location.href = '/principal-login'
        }, 15 * 60 * 1000) // 15 mins
      }
    }

    // List of events to listen to
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => document.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => document.removeEventListener(event, resetTimer))
    }
  }, [])

  if (loading) return <LoadingScreen />

  const redirects = {
    admin: '/admin',
    staff: '/staff',
    student: '/student/dashboard',
    hod: '/hod',
    office_staff: '/office/dashboard',
    principal: '/principal/dashboard'
  }
  const homeRedirect = user ? (redirects[user.role] || '/') : '/'

  // If admin mode is active, lock all public/unrelated routes back to /admin
  const adminGuard = (element) => hasAdminToken ? <Navigate to="/admin" replace /> : element

  return (
    <>
      <DynamicTitle />
      <Routes>
        {/* Public — blocked when admin mode is active */}
        <Route path="/" element={adminGuard(user ? <Navigate to={homeRedirect} replace /> : <LandingPage />)} />
        <Route path="/login" element={adminGuard(user ? <Navigate to={homeRedirect} replace /> : <LoginPage />)} />
        <Route path="/register" element={adminGuard(user ? <Navigate to={homeRedirect} replace /> : <RegisterPage />)} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/office-login" element={adminGuard(user ? <Navigate to={homeRedirect} replace /> : <OfficeStaffLogin />)} />
        <Route path="/principal-login" element={adminGuard(user ? <Navigate to={homeRedirect} replace /> : <PrincipalLogin />)} />

        <Route path="/student-login" element={adminGuard(user ? <Navigate to={homeRedirect} replace /> : <LoginPage />)} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Student routes */}
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/student/dashboard" element={<StudentLayout><StudentDashboard /></StudentLayout>} />
        <Route path="/student/profile" element={<StudentLayout><StudentProfile /></StudentLayout>} />
        <Route path="/student/materials" element={<StudentLayout><StudentMaterials /></StudentLayout>} />
        <Route path="/student/tests" element={<StudentLayout><StudentTests /></StudentLayout>} />
        <Route path="/student/test/:testId" element={<StudentLayout><TakeTest /></StudentLayout>} />
        <Route path="/student/results" element={<StudentLayout><StudentResults /></StudentLayout>} />
        <Route path="/student/attendance" element={<StudentLayout><StudentAttendance /></StudentLayout>} />
        <Route path="/student/marks" element={<StudentLayout><StudentMarks /></StudentLayout>} />
        <Route path="/student/fees" element={<StudentLayout><StudentFees /></StudentLayout>} />
        <Route path="/student/placement" element={<StudentLayout><PlacementHub /></StudentLayout>} />
        <Route path="/student/chat" element={<StudentLayout><StudentChat /></StudentLayout>} />
        <Route path="/student/notifications" element={<StudentLayout><StudentNotifications /></StudentLayout>} />
        <Route path="/student/settings" element={<StudentLayout><StudentSettings /></StudentLayout>} />
        <Route path="/student/ai" element={<StudentLayout><Ai /></StudentLayout>} />
        <Route path="/student/eee" element={<StudentLayout><EEE /></StudentLayout>} />
        <Route path="/student/mech" element={<StudentLayout><MechEnggSyllabus /></StudentLayout>} />
        <Route path="/student/civil" element={<StudentLayout><CivilEnggTopics /></StudentLayout>} />
        <Route path="/student/placement/on-campus" element={<StudentLayout><PlacementOnCampus /></StudentLayout>} />
        <Route path="/student/placement/off-campus" element={<StudentLayout><PlacementOffCampus /></StudentLayout>} />
        <Route path="/student/*" element={<Navigate to="/student/dashboard" replace />} />

        {/* Legacy student CMIS paths — redirect to namespaced routes */}
        <Route path="/attendance" element={
          user?.role === 'student'
            ? <Navigate to="/student/attendance" replace />
            : <ProtectedRoute role={['hod', 'staff', 'student']}><Layout><AttendanceManagement /></Layout></ProtectedRoute>
        } />
        <Route path="/marks" element={
          user?.role === 'student'
            ? <Navigate to="/student/marks" replace />
            : <ProtectedRoute role={['admin', 'hod', 'staff', 'student']}><Layout><MarksManagement /></Layout></ProtectedRoute>
        } />
        <Route path="/fees" element={
          user?.role === 'student'
            ? <Navigate to="/student/fees" replace />
            : <ProtectedRoute role={['admin', 'office_staff', 'principal', 'student']}><Layout><FeeManagement /></Layout></ProtectedRoute>
        } />
        <Route path="/settings" element={
          user?.role === 'student'
            ? <Navigate to="/student/settings" replace />
            : <ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>
        } />

        {/* Staff routes */}
        <Route path="/staff" element={<ProtectedRoute role="staff"><Layout><StaffDashboard /></Layout></ProtectedRoute>} />
        <Route path="/staff/materials" element={<ProtectedRoute role="staff"><Layout><StaffMaterials /></Layout></ProtectedRoute>} />
        <Route path="/staff/tests" element={<ProtectedRoute role="staff"><Layout><StaffTests /></Layout></ProtectedRoute>} />
        <Route path="/staff/results" element={<ProtectedRoute role="staff"><Layout><StaffResults /></Layout></ProtectedRoute>} />
        <Route path="/staff/chat" element={<ProtectedRoute role="staff"><Layout><ChatPage /></Layout></ProtectedRoute>} />

        {/* HOD routes */}
        <Route path="/hod" element={<ProtectedRoute role="hod"><Layout><HodDashboard /></Layout></ProtectedRoute>} />
        <Route path="/hod/coordinators" element={<ProtectedRoute role="hod"><Layout><HodCoordinators /></Layout></ProtectedRoute>} />

        {/* Office Staff routes */}
        <Route path="/office" element={<Navigate to="/office/dashboard" replace />} />
        <Route path="/office/dashboard" element={<ProtectedRoute role="office_staff"><Layout><OfficeDashboard /></Layout></ProtectedRoute>} />
        <Route path="/office/admissions" element={<ProtectedRoute role="office_staff"><Layout><StudentAdmissions /></Layout></ProtectedRoute>} />
        <Route path="/office/faculty" element={<ProtectedRoute role="office_staff"><Layout><FacultyDetails /></Layout></ProtectedRoute>} />
        <Route path="/office/salary" element={<ProtectedRoute role="office_staff"><Layout><FacultySalary /></Layout></ProtectedRoute>} />

        {/* Principal routes */}
        <Route path="/principal" element={<Navigate to="/principal/dashboard" replace />} />
        <Route path="/principal/dashboard" element={<ProtectedRoute role="principal"><Layout><PrincipalDashboard /></Layout></ProtectedRoute>} />
        <Route path="/principal/hod-management" element={<ProtectedRoute role="principal"><Layout><HodManagement /></Layout></ProtectedRoute>} />

        {/* CMIS Shared Routes */}
        <Route path="/admissions" element={<ProtectedRoute role={['admin', 'office_staff', 'principal', 'hod', 'staff']}><Layout><StudentAdmission /></Layout></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute role={['admin', 'hod', 'principal']}><Layout><DepartmentManagement /></Layout></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute role={['admin', 'hod', 'principal', 'staff', 'student']}><Layout><CourseManagement /></Layout></ProtectedRoute>} />
        <Route path="/faculty" element={<ProtectedRoute role={['admin', 'principal', 'hod']}><Layout><FacultyManagement /></Layout></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute role={['admin', 'office_staff', 'staff', 'hod']}><Layout><SalaryManagement /></Layout></ProtectedRoute>} />
        <Route path="/labs" element={<ProtectedRoute role={['admin', 'hod', 'principal']}><Layout><LabManagement /></Layout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute role={['admin', 'principal', 'hod', 'office_staff']}><Layout><ReportsDashboard /></Layout></ProtectedRoute>} />
        <Route path="/parent-report" element={<ProtectedRoute role={['admin', 'principal', 'hod', 'staff', 'student']}><Layout><ParentReport /></Layout></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/staff" element={<ProtectedRoute role="admin"><Layout><AdminStaff /></Layout></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute role="admin"><Layout><AdminStudents /></Layout></ProtectedRoute>} />
        <Route path="/admin/hod-management" element={<ProtectedRoute role="admin"><Layout><AdminHodManagement /></Layout></ProtectedRoute>} />
        <Route path="/admin/materials" element={<ProtectedRoute role="admin"><Layout><AdminMaterials /></Layout></ProtectedRoute>} />
        <Route path="/admin/tests" element={<ProtectedRoute role="admin"><Layout><AdminTests /></Layout></ProtectedRoute>} />
        <Route path="/admin/results" element={<ProtectedRoute role="admin"><Layout><AdminResults /></Layout></ProtectedRoute>} />
        
        {/* Universal Protected Routes */}
        <Route path="/change-password" element={<ProtectedRoute><Layout><ChangePassword /></Layout></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><Layout><EditProfile /></Layout></ProtectedRoute>} />

        {/* Catch-all — also redirects to /admin if admin mode is on */}
        <Route path="*" element={hasAdminToken ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'default-toaster',
              style: {
                background: 'rgb(var(--ink-800))',
                color: 'rgb(var(--ink-100))',
                border: '1px solid rgb(var(--ink-700))',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: 'rgb(var(--lime-300))', secondary: 'rgb(var(--ink-950))' } },
              error: { iconTheme: { primary: 'rgb(var(--red-400))', secondary: 'rgb(var(--ink-950))' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}