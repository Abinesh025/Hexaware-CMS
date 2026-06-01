const express = require('express')
const router = express.Router()
const { login, logout, profile } = require('../../controllers/v1/officeStaffAuthController')
const { protectMe } = require('../../middleware/authMiddleware')

router.post('/login', login)
router.post('/logout', protectMe, logout)
router.get('/profile', protectMe, profile)

module.exports = router
