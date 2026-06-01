const mongoose = require('mongoose')

const testSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true
    },
    answers: {
      type: [Number],
      default: []
    },
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    smsStatus: {
      type: String,
      enum: ['not_sent', 'sent', 'failed'],
      default: 'not_sent'
    },
    smsSentAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('TestSubmission', testSubmissionSchema)
