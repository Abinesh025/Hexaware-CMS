import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { chatService } from '../../services/api'
import { getSocket } from '../../services/socket'
import { Send, MessageSquare, Mic, Square, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ChatPage() {
  const { user, token } = useAuth()
  const ROOM_ID = user?.department || 'general'
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const getMediaUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : ''
    const formattedPath = path.startsWith('/') ? path : `/${path.replace(/\\/g, '/')}`
    return `${base}${formattedPath}`
  }

  useEffect(() => {
    chatService.getMessages(ROOM_ID)
      .then(res => setMessages(res?.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    const socket = getSocket(token)
    socketRef.current = socket
    if (user?._id) socket.emit('join', user._id)
    socket.emit('joinRoom', ROOM_ID)

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    return () => {
      socket.off('message')
      socket.emit('leaveRoom', ROOM_ID)
    }
  }, [token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    socketRef.current?.emit('sendMessage', { room: ROOM_ID, sender: user?._id, content: text.trim() })
    setText('')
  }

  const startRecording = async () => {
    try {
      // Microphone requires a secure context (HTTPS) — always true in dev (basicSsl) and prod (Render)
      if (!window.isSecureContext) {
        toast.error(
          'Microphone requires HTTPS. Please use the deployed site or restart the dev server.',
          { duration: 6000 }
        )
        return
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error(
          'Microphone not supported in this browser. Try Chrome or Edge.',
          { duration: 5000 }
        )
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone access denied. Please allow microphone permission in your browser settings.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.')
      } else if (err.name === 'NotReadableError') {
        toast.error('Microphone is in use by another application. Please close it and try again.')
      } else {
        toast.error('Could not access microphone: ' + (err.message || err.name))
      }
    }
  }


  const stopRecordingAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', audioBlob, 'voice.webm')
        
        try {
          const res = await chatService.uploadVoice(formData)
          socketRef.current?.emit('sendMessage', { 
            room: ROOM_ID, 
            sender: user?._id, 
            content: 'Voice message',
            messageType: 'voice',
            audioUrl: res.data.audioUrl
          })
        } catch (err) {
          toast.error('Failed to send voice message')
        }
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const cancelRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
       mediaRecorderRef.current.onstop = () => {
         mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
       }
       mediaRecorderRef.current.stop()
       setIsRecording(false)
       clearInterval(timerRef.current)
     }
  }

  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
    const secs = time % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink-800 flex items-center gap-3">
        <div className="w-9 h-9 bg-ink-800 rounded-xl flex items-center justify-center">
          <MessageSquare size={16} className="text-lime-300" />
        </div>
        <div>
          <h1 className="font-display font-600 text-ink-100">{user?.department ? `${user.department} Chat` : 'General Chat'}</h1>
          <p className="text-ink-500 text-xs">Department members</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="text-center text-ink-500 text-sm py-8">Loading messages…</div>
        )}
        {messages?.map((m, i) => {
          const isMe = m.sender?._id === user?._id || m.sender === user?._id
          const name = m.sender?.name || 'Unknown'
          const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

          return (
            <div key={m._id || i} className={clsx('flex gap-3', isMe && 'flex-row-reverse')}>
              {!isMe && (
                m.sender?.avatar ? (
                  <img src={getMediaUrl(m.sender.avatar)} alt="Avatar" className="w-8 h-8 rounded-xl object-cover self-end flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-ink-800 flex items-center justify-center flex-shrink-0 self-end">
                    <span className="text-xs font-display font-600 text-ink-400">{initials}</span>
                  </div>
                )
              )}
              <div className={clsx('max-w-[72%] space-y-1', isMe && 'items-end flex flex-col')}>
                {!isMe && (
                  <span className="text-xs text-ink-500 font-500">{name}</span>
                )}
                <div className={clsx(
                  'px-4 py-2.5 rounded-2xl text-sm',
                  isMe
                    ? 'bg-lime-300 text-ink-950 rounded-br-sm'
                    : 'bg-ink-800 text-ink-200 rounded-bl-sm'
                )}>
                  {m.messageType === 'voice' && m.audioUrl ? (
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-xs opacity-70 mb-1 font-medium font-display tracking-wide">{isMe ? 'Voice Message' : `Voice from ${name}`}</span>
                      <audio controls className="h-8 max-w-[200px]" src={getMediaUrl(m.audioUrl)} />
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
                <span className="text-xs text-ink-600 px-1">
                  {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-ink-800">
        {isRecording ? (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm font-medium flex-1 tracking-wider font-display">
              {formatTime(recordingTime)}
            </span>
            <button type="button" onClick={cancelRecording} className="btn-ghost p-2 text-ink-400 hover:text-red-400">
              <Trash2 size={16} />
            </button>
            <button type="button" onClick={stopRecordingAndSend} className="btn-primary bg-red-500 hover:bg-red-400 text-white p-2">
              <Square size={16} className="fill-current inline-block" />
            </button>
          </div>
        ) : (
          <form onSubmit={send} className="flex gap-3">
            <input
              className="input flex-1"
              placeholder="Type a message…"
              value={text}
              onChange={e => setText(e.target.value)}
            />
            {text.trim() ? (
              <button type="submit" className="btn-primary px-4">
                <Send size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                title={
                  !window.isSecureContext
                    ? 'Microphone requires HTTPS or localhost'
                    : 'Record voice message'
                }
                className={`btn-ghost px-4 transition-colors ${
                  !window.isSecureContext
                    ? 'text-ink-700 cursor-not-allowed opacity-50'
                    : 'text-ink-400 hover:text-lime-300 hover:bg-lime-400/10'
                }`}
              >
                <Mic size={18} />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
