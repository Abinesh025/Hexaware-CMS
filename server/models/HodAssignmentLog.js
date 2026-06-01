const mongoose = require('mongoose')

const hodAssignmentLogSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    previousHod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    newHod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    action: {
      type: String,
      enum: ['assigned', 'removed'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    performedByRole: {
      type: String,
      enum: ['principal', 'admin'],
      required: true
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('HodAssignmentLog', hodAssignmentLogSchema)
