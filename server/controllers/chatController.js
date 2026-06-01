const Message = require('../models/Message')

// SEND MESSAGE (TEXT / FILE / VOICE)
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, messageType, text } = req.body

    if (!receiverId || !messageType) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message type required"
      })
    }

    let fileUrl = null

    // If file or voice uploaded
    if (req.file) {
      fileUrl = req.file.path
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: messageType === "text" ? text : null,
      fileUrl: fileUrl,
      messageType, // text | image | file | voice
      timestamp: new Date()
    })

    const populatedMessage = await message.populate([
      { path: "sender", select: "name email role" },
      { path: "receiver", select: "name email role" }
    ])

    res.status(201).json({
      success: true,
      data: populatedMessage
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// GET CHAT HISTORY
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required"
      })
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .populate("sender", "name email role avatar")
      .populate("receiver", "name email role avatar")
      .sort({ createdAt: 1 }) // better than timestamp if schema uses timestamps

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// UPLOAD VOICE MESSAGE
exports.uploadVoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio file uploaded"
      })
    }

    // Convert disk path (uploads/voice/xxx.webm) to a proper URL path (/uploads/voice/xxx.webm)
    // If Cloudinary is used, req.file.path is already an https:// URL
    let audioUrl = req.file.path
    if (audioUrl && !audioUrl.startsWith('http')) {
      // Normalize Windows backslashes and ensure leading slash
      audioUrl = '/' + audioUrl.replace(/\\/g, '/')
      if (!audioUrl.startsWith('/uploads')) {
        audioUrl = '/uploads' + audioUrl
      }
    }

    res.status(200).json({
      success: true,
      message: "Voice uploaded successfully",
      audioUrl
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// GET ROOM CHAT HISTORY
exports.getRoomHistory = async (req, res) => {
  try {
    const { roomId } = req.params

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID required"
      })
    }

    const messages = await Message.find({ room: roomId })
      .populate("sender", "name email role department avatar")
      .sort({ createdAt: 1 })

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages.map(m => ({
        _id: m._id,
        content: m.message,
        messageType: m.messageType,
        audioUrl: m.audioUrl,
        fileUrl: m.fileUrl,
        sender: m.sender,
        createdAt: m.createdAt
      }))
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}