const mongoose = require('mongoose')

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    department: {
      type: String,
      required: true
    },
    semester: {
      type: Number,
      required: true
    },
    internalMarks: {
      type: Number,
      min: 0,
      max: 25,
      required: true
    },
    endSemesterMarks: {
      type: Number,
      min: 0,
      max: 75,
      default: null
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    grade: {
      type: String,
      default: 'F'
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Calculate totalMarks and grade prior to saving
marksSchema.pre('save', function (next) {
  const internal = this.internalMarks || 0
  const endSem = this.endSemesterMarks !== null ? this.endSemesterMarks : 0
  this.totalMarks = internal + endSem

  const total = this.totalMarks
  if (total >= 90) this.grade = 'O' // Outstanding
  else if (total >= 80) this.grade = 'A+'
  else if (total >= 70) this.grade = 'A'
  else if (total >= 60) this.grade = 'B'
  else if (total >= 50) this.grade = 'C'
  else this.grade = 'RA' // Re-Appearance (Fail)

  next()
})

module.exports = mongoose.model('Marks', marksSchema)
