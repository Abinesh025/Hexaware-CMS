import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/api/auth/profile')
        .then(res => setUser(res.data.user))
        .catch(() => { logout() })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password })

      if (res.data.requiresOtp) {
        return res.data
      }

      const { token: t, user: u } = res.data

      localStorage.setItem('token', t)
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`
      setToken(t)
      setUser(u)

      return res.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed"

      throw new Error(message)
    }
  }

  const officeLogin = async (email, password) => {
    try {
      const res = await api.post('/api/v1/office-staff/login', { email, password })
      const { token: t, user: u } = res.data

      localStorage.setItem('token', t)
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`
      setToken(t)
      setUser(u)

      return res.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed"

      throw new Error(message)
    }
  }

  const principalLogin = async (email, password) => {
    try {
      const res = await api.post('/api/v1/principal/login', { email, password })
      const { token: t, user: u } = res.data

      localStorage.setItem('token', t)
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`
      setToken(t)
      setUser(u)

      return res.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed"

      throw new Error(message)
    }
  }

  const verifyStaffOtp = async (email, otp) => {
    try {
      const res = await api.post('/api/auth/verify-staff-login-otp', { email, otp })
      const { token: t, user: u } = res.data

      localStorage.setItem('token', t)
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`
      setToken(t)
      setUser(u)

      return u
    } catch (err) {
      throw new Error(err.response?.data?.message || "OTP verification failed")
    }
  }

  const register = async (data) => {
    const res = await api.post('/api/auth/register', data)
    const { token: t, user: u } = res.data
    localStorage.setItem('token', t)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t)
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, verifyStaffOtp, officeLogin, principalLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
