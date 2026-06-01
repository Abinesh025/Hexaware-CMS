const mongoose = require('mongoose')

const studentAdmissionSchema = new mongoose.Schema(
  {
    studentName: {
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
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    semester: {
      type: Number,
      default: 1
    },
    admissionYear: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear()
    },
    parentName: {
      type: String,
      trim: true
    },
    parentPhone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    admissionStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfficeStaff'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('StudentAdmission', studentAdmissionSchema)
