const Message = require('../models/Message')
const { Server } = require('socket.io')

let onlineUsers = {}
let ioInstance = null

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
  })
  ioInstance = io

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // ── User joins ───────────────────────────────
    socket.on('join', (userId) => {
      onlineUsers[userId] = socket.id
      socket.join(`user:${userId}`)
      io.emit('onlineUsers', Object.keys(onlineUsers))
      console.log('Online Users:', Object.keys(onlineUsers))
      console.log('User joined personal room:', `user:${userId}`)
    })

    // ── Room joins ───────────────────────────────
    socket.on('joinRoom', (room) => {
      socket.join(room)
      console.log('User joined room:', room)
    })
    
    socket.on('joinDepartmentRoom', (data) => {
      if (data && data.department) {
        socket.join(data.department)
        console.log(`User joined department room: ${data.department}`)
        if (data.semester) {
          const semRoom = `${data.department}_Semester_${data.semester}`
          socket.join(semRoom)
          console.log(`User joined department-semester room: ${semRoom}`)
        }
      }
    })

    socket.on('leaveRoom', (room) => {
      socket.leave(room)
      console.log('User left room:', room)
    })

    // ── Send message ─────────────────────────────
    socket.on('sendMessage', async (data) => {
      try {
        const { sender, receiver, room, content, message, messageType = 'text', audioUrl = '', fileUrl = '' } = data
        const messageText = content || message || ''

        const newMessage = await Message.create({
          sender, receiver, room, message: messageText, messageType, audioUrl, fileUrl
        })

        if (room) {
          const populated = await newMessage.populate('sender', 'name email role department avatar')
          io.to(room).emit('message', {
            _id: populated._id,
            content: populated.message,
            messageType: populated.messageType,
            audioUrl: populated.audioUrl,
            fileUrl: populated.fileUrl,
            sender: populated.sender,
            createdAt: populated.createdAt
          })
        } else {
          // 1-on-1 Chat
          const receiverSocket = onlineUsers[receiver]
          if (receiverSocket) {
            io.to(receiverSocket).emit('receiveMessage', newMessage)
          }

          const senderSocket = onlineUsers[sender]
          if (senderSocket) {
            io.to(senderSocket).emit('receiveMessage', newMessage)
          }
        }
      } catch (error) {
        console.error('Error sending message:', error.message)
      }
    })

    // ── Disconnect ───────────────────────────────
    socket.on('disconnect', () => {
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId]
          break
        }
      }
      io.emit('onlineUsers', Object.keys(onlineUsers))
      console.log('User disconnected:', socket.id)
    })
  })
}

module.exports = { initSocket, getIo: () => ioInstance }