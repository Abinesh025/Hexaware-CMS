const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true
    },
    courseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    credits: {
      type: Number,
      required: true,
      min: 1
    },
    facultyAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Course', courseSchema)
