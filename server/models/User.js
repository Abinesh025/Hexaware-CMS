const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  regnum: {
    type: String,
    default: '',
    sparse: true   // allows multiple docs without regnum (e.g. admin)
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'hod', 'office_staff', 'principal', 'admin'],
    required: true
  },
  additionalRoles: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    enum:["Artificial Intelligence and Data Science","Biomedical Engineering","Civil Engineering","Computer Science and Business Systems","Computer Science and Engineering","Electronics and Communication Engineering","Electrical and Electronics Engineering","Information Technology","Master of Business Administration","Master of Computer Applications","Mechanical Engineering"],
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  batch: {
    type: String,
    default: ''
  },
  semester: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  otpHash: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  otpPurpose: {
    type: String,
    enum: ["staff_login", "password_change", null],
    default: null
  },
  otpVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)