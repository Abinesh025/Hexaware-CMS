import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

let socket = null

export const getSocket = (token) => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : '/'

    socket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
    })

    socket.on('disconnect', () => {
      toast.error('Connection lost', { id: 'socket-disconnect' })
    })
    socket.on('connect_error', () => {
      toast.error('Connection error', { id: 'socket-error' })
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
