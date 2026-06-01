const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },

    subjectName: {
      type: String,
      trim: true
    },

    unit: {
      type: String,
      required: true,
      trim: true
    },

    fileType: {
      type: String,
      required: true
    },

    fileUrl: {
      type: String,
      required: true
    },

    department: {
      type: String,
      enum:["Artificial Intelligence and Data Science","Biomedical Engineering","Civil Engineering","Computer Science and Business Systems","Computer Science and Engineering","Electronics and Communication Engineering","Electrical and Electronics Engineering","Information Technology","Master of Business Administration","Master of Computer Applications","Mechanical Engineering"],
      default: '' // Optional for older records
    },

    semester: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
      default: null
    },

    course: {
      type: String,
      trim: true,
      default: ''
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    staffName: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

// Faster filtering
materialSchema.index({ subject: 1, semester: 1, department: 1 })

module.exports = mongoose.model('Material', materialSchema)