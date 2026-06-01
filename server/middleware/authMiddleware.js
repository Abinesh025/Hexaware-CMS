const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protectMe = async (req, res, next) => {
  try {
    let token

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    // No token
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user
    let user = await User.findById(decoded.userID).select('-password')
    if (!user) {
      const OfficeStaff = require('../models/OfficeStaff')
      user = await OfficeStaff.findById(decoded.userID).select('-password')
    }
    if (!user) {
      const Principal = require('../models/Principal')
      user = await Principal.findById(decoded.userID).select('-password')
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Attach user to request
    req.user = user

    next()

  } catch (error) {
    return res.status(401).json({ message: 'Token failed or expired' })
  }
}

// ── Accepts EITHER a regular Bearer JWT (staff/student) OR an x-admin-token ──
// Use this for shared routes like /api/materials/download that all roles need.
exports.protectAny = async (req, res, next) => {
  try {
    // 1. Check for admin token first
    const adminToken = req.headers['x-admin-token']
    if (adminToken) {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET)
      if (decoded.type === 'admin-access') {
        req.user = { _id: '000000000000000000000000', role: 'admin' }
        return next()
      }
    }

    // 2. Fall back to regular Bearer JWT
    let bearerToken
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      bearerToken = req.headers.authorization.split(' ')[1]
    }

    if (!bearerToken) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET)
    let user = await User.findById(decoded.userID).select('-password')
    if (!user) {
      const OfficeStaff = require('../models/OfficeStaff')
      user = await OfficeStaff.findById(decoded.userID).select('-password')
    }
    if (!user) {
      const Principal = require('../models/Principal')
      user = await Principal.findById(decoded.userID).select('-password')
    }
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token failed or expired' })
  }
}
