const express = require('express')
const router = express.Router()
const { uploadMaterial, getMaterials, downloadMaterial } = require('../controllers/materialController')
const { protectMe, protectAny } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')
const { uploadMaterial: cloudinaryUpload } = require('../config/cloudinary')

// Only staff can upload materials
router.post(
  '/upload',
  protectMe,
  authorizeRoles('staff', 'admin'),
  cloudinaryUpload.single('file'),
  uploadMaterial
)

// Students can view materials
router.get('/', protectMe, getMaterials)

// Download proxy — accepts ANY valid token (staff, student, or admin)
// protectAny checks x-admin-token first, then falls back to Bearer JWT
router.get('/download/:id', protectAny, downloadMaterial)

module.exports = router