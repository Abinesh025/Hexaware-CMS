import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { studentService } from '../../services/api'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { getSocket } from '../../services/socket'
import { ArrowLeft, Bell, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentNotifications() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await studentService.getNotifications()
      const data = res.data?.data ?? res.data
      if (res.data?.success !== false) {
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    if (!user || !token) return
    const socket = getSocket(token)
    socket.on('new_notification', (newNotif) => {
      setNotifications(prev => [{
        _id: newNotif.id,
        type: newNotif.type,
        title: newNotif.title,
        message: newNotif.message,
        createdAt: newNotif.createdAt,
        isRead: false,
      }, ...prev])
    })
    return () => socket.off('new_notification')
  }, [user, token])

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch {
      toast.error('Could not mark as read')
    }
  }

  const handleClick = (notification) => {
    if (!notification.isRead) markAsRead(notification._id)
    if (notification.type === 'material_upload') navigate('/student/materials')
    else if (notification.type === 'test_upload') navigate('/student/tests')
    else if (notification.type === 'test_submission') navigate('/student/results')
  }

  const deleteNotification = async (id, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/api/notifications/delete/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors text-sm font-500"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex items-center gap-3">
        <Bell size={22} className="text-lime-300" />
        <h1 className="page-title mb-0">Notifications</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card p-4 animate-pulse h-16" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center text-ink-500 text-sm">No notifications yet.</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n._id}
              type="button"
              onClick={() => handleClick(n)}
              className={`card p-4 w-full text-left flex items-start gap-3 transition-all ${
                !n.isRead ? 'border-lime-300/20 bg-lime-400/5' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-500 text-ink-100">{n.title}</p>
                <p className="text-xs text-ink-400 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-ink-600 mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => deleteNotification(n._id, e)}
                className="p-2 text-ink-500 hover:text-red-400 shrink-0"
                aria-label="Delete notification"
              >
                <Trash2 size={14} />
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
