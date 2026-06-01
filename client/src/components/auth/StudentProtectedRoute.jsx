import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return false
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
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

export default function StudentProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const token = localStorage.getItem('token')

  if (loading) return <LoadingScreen />

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token')
    return <Navigate to="/student-login" replace state={{ from: location }} />
  }

  if (!user) {
    return <Navigate to="/student-login" replace state={{ from: location }} />
  }

  if (user.role !== 'student') {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
