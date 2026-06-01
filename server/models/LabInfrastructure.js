const mongoose = require('mongoose')

const labInfrastructureSchema = new mongoose.Schema(
  {
    labName: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    equipmentName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    condition: {
      type: String,
      enum: ['Working', 'Under Maintenance', 'Broken'],
      default: 'Working'
    },
    purchaseDate: {
      type: Date
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

module.exports = mongoose.model('LabInfrastructure', labInfrastructureSchema)
