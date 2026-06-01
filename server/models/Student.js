const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: ''
    },
    parentName: {
      type: String,
      default: ''
    },
    parentPhone: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
      default: 1
    },
    admissionYear: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Graduated'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Student', studentSchema)
