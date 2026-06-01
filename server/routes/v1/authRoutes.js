const express = require('express')
const router = express.Router()

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword, role, regnum, department]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               role:
 *                 type: string
 *               regnum:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Validation error / user already exists
 * 
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */

const {
  register,
  login,
  getMe,
  verifyPassword,
  verifyStaffLoginOtp,
  sendPasswordChangeOtp,
  verifyPasswordChangeOtp,
  changePassword
} = require('../../controllers/v1/authController')
const { protectMe } = require('../../middleware/authMiddleware')

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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed for avatars'), false)
    }
  }
})

const { updateProfile } = require('../../controllers/v1/authController')

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
