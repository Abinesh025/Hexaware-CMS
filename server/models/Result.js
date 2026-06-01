const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema(
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

    totalMarks: {
      type: Number,
      required: true
    },

    percentage: {
      type: Number
    }
  },
  {
    timestamps: true
  }
)

// Prevent duplicate test attempts
resultSchema.index({ student: 1, test: 1 }, { unique: true })

// Auto calculate percentage
resultSchema.pre('save', function (next) {
  if (this.totalMarks > 0) {
    this.percentage = (this.score / this.totalMarks) * 100
  }
  next()
})

module.exports = mongoose.model('Result', resultSchema)