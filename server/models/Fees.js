const mongoose = require('mongoose')

const feesSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    totalFee: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    balanceDue: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Unpaid', 'Partial'],
      default: 'Unpaid'
    },
    paymentDate: {
      type: Date
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Online', 'Card', 'UPI']
    },
    receiptNumber: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

feesSchema.pre('save', function (next) {
  this.balanceDue = this.totalFee - this.paidAmount

  if (this.paidAmount >= this.totalFee) {
    this.paymentStatus = 'Paid'
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'Partial'
  } else {
    this.paymentStatus = 'Unpaid'
  }

  next()
})

module.exports = mongoose.model('Fees', feesSchema)
