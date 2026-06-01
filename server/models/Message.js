const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    room: {
      type: String,
      default: ''
    },

    message: {
      type: String,
      trim: true,
      default: ''
    },

    messageType: {
      type: String,
      enum: ['text', 'voice', 'file'],
      default: 'text'
    },

    audioUrl: {
      type: String,
      default: ''
    },

    fileUrl: {
      type: String,
      default: ''
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Fast chat queries
messageSchema.index({ sender: 1, receiver: 1 })

module.exports = mongoose.model('Message', messageSchema)