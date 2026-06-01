const User = require('../models/User')
const bcrypt = require('bcryptjs')
const generateToken = require('../config/jwt')
const { validateRegNum } = require('../utils/regNumValidator')
const { validateName } = require('../utils/nameValidator')
const { validatePassword } = require('../utils/passwordValidator')
const { generateOtp, hashOtp } = require('../utils/generateOtp')
const sendEmail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken')

// REGISTER
exports.register = async (req, res) => {

  try {
    const { name, email, password, role, regnum, department } = req.body;

    // Name validation
    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return res.status(400).json({
        success: false,
        message: nameValidation.message
      })
    }

    // Basic field validation
    if (!name || !email || !password || !regnum || !department) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, email, password, registration number, department)'
      })
    }

    // Role restriction
    const allowedRoles = ['student', 'staff']
    const userRole = role || 'student'
    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      })
    }

    // Registration number validation (role-aware)
    const regValidation = validateRegNum(regnum, userRole, department)
    if (!regValidation.valid) {
      return res.status(400).json({
        success: false,
        message: regValidation.message
      })
    }
    const normalizedRegnum = regnum.trim().toUpperCase()

    // Duplicate checks
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    const regnumExists = await User.findOne({ regnum: normalizedRegnum })
    if (regnumExists) {
      return res.status(400).json({
        success: false,
        message: 'This registration number is already registered'
      })
    }

    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      regnum: normalizedRegnum,
      role: userRole,
      department
    })

    const token = generateToken(user._id, user.role)

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        avatar: user.avatar || null,
        semester: user.semester || null
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      })
    } 

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      })
    }

    // Handle Staff OTP Login
    if (user.role === 'staff') {
      const otp = generateOtp();
      const hashedOtp = hashOtp(otp);
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      user.otpHash = hashedOtp;
      user.otpExpiresAt = otpExpiresAt;
      user.otpPurpose = 'staff_login';
      user.otpVerified = false;
      await user.save();

      try {
        await sendEmail({
          email: user.email,
          subject: 'Your Staff Login OTP Code',
          message: `Your OTP is ${otp}. This OTP is valid for 5 minutes. Do not share it with anyone.`,
          html: `<p>Your OTP is <b>${otp}</b>. This OTP is valid for 5 minutes. Do not share it with anyone.</p>`
        });

        return res.status(200).json({
          success: true,
          requiresOtp: true,
          message: "OTP sent to staff email."
        });
      } catch (err) {
        user.otpHash = null;
        user.otpExpiresAt = null;
        user.otpPurpose = null;
        await user.save();
        return res.status(500).json({ success: false, message: "Failed to send OTP email" });
      }
    }

    // Normal Login (Student or Admin)
    const token = generateToken(user._id, user.role)

    res.status(200).json({
      success: true,
      requiresOtp: false,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        avatar: user.avatar || null,
        semester: user.semester || null
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// GET CURRENT USER (/me)
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password");
    if (!user) {
      const OfficeStaff = require('../models/OfficeStaff')
      user = await OfficeStaff.findById(req.user._id).select("-password")
    }
    if (!user) {
      const Principal = require('../models/Principal')
      user = await Principal.findById(req.user._id).select("-password")
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    // Attach coordinator flags for staff and HOD roles
    let coordinatorFlags = {}
    if (user.role === 'staff' || user.role === 'hod') {
      try {
        const Department = require('../models/Department')
        const dept = await Department.findOne({ departmentName: user.department })
        if (dept) {
          const uid = user._id.toString()
          coordinatorFlags = {
            isAttendanceCoordinator: dept.attendanceCoordinator?.toString() === uid,
            isSportsCoordinator: dept.sportsCoordinator?.toString() === uid,
            isDisciplineCoordinator: dept.disciplineCoordinator?.toString() === uid
          }
        }
      } catch (err) {
        // Non-critical: silently skip coordinator flags on lookup error
      }
    }

    res.status(200).json({
      success: true,
      user: { ...user.toObject(), ...coordinatorFlags }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    })
  }
}


// VERIFY PASSWORD FOR ADMIN UNLOCK
exports.verifyPassword = async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      })
    }

    const adminSecret = process.env.ADMIN_SECRET || 'hitspec@2026'

    if (password !== adminSecret) {
      console.log(`[ADMIN] Failed login attempt at ${new Date().toISOString()}`)
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      })
    }

    // Issue a short-lived admin access token (10 minutes)
 
    const adminToken = jwt.sign(
      { type: 'admin-access', grantedAt: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    )

    console.log(`[ADMIN] ✅ Admin access granted at ${new Date().toISOString()}`)

    res.status(200).json({
      success: true,
      message: "Admin access granted",
      adminToken
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// UPDATE PROFILE (Name, Password, Avatar)
exports.updateProfile = async (req, res) => {
  try {
    const { name, password, phone } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (name) {
      const nameValidation = validateName(name)
      if (!nameValidation.valid) {
        return res.status(400).json({
          success: false,
          message: nameValidation.message
        })
      }
      user.name = name
    }

    if (phone !== undefined) {
      const trimmedPhone = phone.trim()
      if (trimmedPhone && !/^\+?[0-9]{10,15}$/.test(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format. It must be 10 to 15 digits long, optionally starting with '+'."
        })
      }
      user.phone = trimmedPhone || ''
    }

    if (password) {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message
        })
      }
      const bcrypt = require('bcryptjs')
      user.password = await bcrypt.hash(password, 10)
    }

    if (req.file) {
      user.avatar = '/uploads/' + req.file.filename
    }

    await user.save()

    const updatedUser = await User.findById(user._id).select("-password")

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    })
  }
}

// VERIFY STAFF LOGIN OTP
exports.verifyStaffLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" })
    }

    const user = await User.findOne({ email, role: 'staff' })
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid request" })
    }

    // Check OTP
    if (!user.otpHash || !user.otpExpiresAt || user.otpPurpose !== 'staff_login') {
      return res.status(400).json({ success: false, message: "OTP not found or expired" })
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" })
    }

    if (user.otpHash !== hashOtp(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" })
    }

    // Clear OTP
    user.otpHash = null
    user.otpExpiresAt = null
    user.otpPurpose = null
    user.otpVerified = true
    await user.save()

    const token = generateToken(user._id, user.role)

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        avatar: user.avatar || null,
        semester: user.semester || null
      },
      message: "Staff login successful."
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// SEND PASSWORD CHANGE OTP
exports.sendPasswordChangeOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otpHash = hashedOtp;
    user.otpExpiresAt = otpExpiresAt;
    user.otpPurpose = 'password_change';
    user.otpVerified = false;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Password Change Verification Code',
      message: `Your OTP for changing password is ${otp}. Valid for 5 minutes.`,
      html: `<p>Your OTP for changing password is <b>${otp}</b>. Valid for 5 minutes.</p>`
    });

    res.status(200).json({ success: true, message: "Password change OTP sent to registered email." })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// VERIFY PASSWORD CHANGE OTP
exports.verifyPasswordChangeOtp = async (req, res) => {
  try {
    const { otp } = req.body
    if (!otp) return res.status(400).json({ success: false, message: "OTP is required" })

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    if (!user.otpHash || !user.otpExpiresAt || user.otpPurpose !== 'password_change') {
      return res.status(400).json({ success: false, message: "OTP not found" })
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" })
    }

    if (user.otpHash !== hashOtp(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" })
    }

    user.otpVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: "OTP verified. You can now change your password." })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" })
    }

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    if (!user.otpVerified || user.otpPurpose !== 'password_change') {
      return res.status(400).json({ success: false, message: "Please verify OTP before changing password." })
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    user.otpHash = null
    user.otpExpiresAt = null
    user.otpPurpose = null
    user.otpVerified = false
    await user.save()

    res.status(200).json({ success: true, message: "Password changed successfully." })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}