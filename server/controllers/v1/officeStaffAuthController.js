const OfficeStaff = require('../../models/OfficeStaff')
const bcrypt = require('bcryptjs')
const generateToken = require('../../config/jwt')

// desc    Office Staff Login
// route   POST /api/v1/office-staff/login
// access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    const staff = await OfficeStaff.findOne({ email: email.toLowerCase() })
    if (!staff) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    if (staff.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact the administrator.'
      })
    }

    const isMatch = await bcrypt.compare(password, staff.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    const token = generateToken(staff._id, staff.role)

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status
      }
    })
  } catch (error) {
    console.error('Office Staff Login Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Get Office Staff Profile
// route   GET /api/v1/office-staff/profile
// access  Private
exports.profile = async (req, res) => {
  try {
    const staff = await OfficeStaff.findById(req.user._id).select('-password')
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Office staff profile not found'
      })
    }

    res.status(200).json({
      success: true,
      user: staff
    })
  } catch (error) {
    console.error('Office Staff Profile Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Office Staff Logout
// route   POST /api/v1/office-staff/logout
// access  Private
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Office Staff Logout Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}
