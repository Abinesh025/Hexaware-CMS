const mongoose = require('mongoose')

const officeFacultySchema = new mongoose.Schema(
  {
    facultyName: {
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
    department: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      required: true,
      trim: true
    },
    qualification: {
      type: String,
      trim: true
    },
    experience: {
      type: Number,
      default: 0
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
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

module.exports = mongoose.model('OfficeFaculty', officeFacultySchema)
