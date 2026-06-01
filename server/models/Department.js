const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    departmentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedByPrincipal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Principal',
      default: null
    },
    assignedDate: {
      type: Date,
      default: null
    },
    hodAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    hodAssignedByRole: {
      type: String,
      enum: ['principal', 'admin', null],
      default: null
    },
    hodAssignedAt: {
      type: Date,
      default: null
    },
    attendanceCoordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    sportsCoordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    disciplineCoordinator: {
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

module.exports = mongoose.model('Department', departmentSchema)
