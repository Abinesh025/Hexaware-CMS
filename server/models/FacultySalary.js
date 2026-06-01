const mongoose = require('mongoose')

const facultySalarySchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0
    },
    netSalary: {
      type: Number
    },
    salaryMonth: {
      type: String,
      required: true,
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending'
    },
    paymentDate: {
      type: Date
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'bank', 'upi']
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

// Auto calculate net salary on save
facultySalarySchema.pre('save', function (next) {
  this.netSalary = this.basicSalary + (this.allowances || 0) - (this.deductions || 0)
  next()
})

module.exports = mongoose.model('FacultySalary', facultySalarySchema)
