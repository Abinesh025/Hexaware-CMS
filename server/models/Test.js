const mongoose = require('mongoose')

// ── Question Subschema ───────────────────────────────
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'At least 2 options required']
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  }
})

// ── Test Schema ───────────────────────────────────────
const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      enum:["Artificial Intelligence and Data Science","Biomedical Engineering","Civil Engineering","Computer Science and Business Systems","Computer Science and Engineering","Electronics and Communication Engineering","Electrical and Electronics Engineering","Information Technology","Master of Business Administration","Master of Computer Applications","Mechanical Engineering"],
      default: ''
    },
    duration: {
      type: Number,
      required: true,
      min: 1 // minutes
    },
    questions: {
      type: [questionSchema],
      validate: [arr => arr.length > 0, 'At least one question required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Test', testSchema)