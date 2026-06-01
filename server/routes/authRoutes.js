const express = require('express')
const router = express.Router()

const {
  register,
  getMe,
  login,
  verifyPassword,
  updateProfile,
  verifyStaffLoginOtp,
  sendPasswordChangeOtp,
  verifyPasswordChangeOtp,
  changePassword
} = require('../controllers/authController')
const { protectMe } = require('../middleware/authMiddleware')

const multer = require('multer')
const path = require('path')

// Configure multer for avatar uploads specifically
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar-' + Date.now() + path.extname(file.originalname))
  }
})
const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed for avatars'), false)
    }
  }
})

router.post('/register', register)
router.post('/login', login)
router.get('/profile', protectMe, getMe)
router.post('/verify-password', verifyPassword)
router.put('/profile', protectMe, uploadAvatar.single('avatar'), updateProfile)
router.post('/verify-staff-login-otp', verifyStaffLoginOtp)
router.post('/send-password-change-otp', protectMe, sendPasswordChangeOtp)
router.post('/verify-password-change-otp', protectMe, verifyPasswordChangeOtp)
router.put('/change-password', protectMe, changePassword)

module.exports = router