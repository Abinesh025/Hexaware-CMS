const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    attendanceSummary: {
      type: Number, // Percentage of attendance
      required: true,
      default: 0
    },
    marksSummary: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course'
        },
        courseName: String,
        courseCode: String,
        internalMarks: Number,
        endSemesterMarks: Number,
        totalMarks: Number,
        grade: String
      }
    ],
    feeSummary: {
      totalFee: Number,
      paidAmount: Number,
      balanceDue: Number,
      paymentStatus: String
    },
    progressStatus: {
      type: String,
      default: 'Good'
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Report', reportSchema)
