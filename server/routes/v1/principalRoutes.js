const express = require('express')
const router = express.Router()
const {
  login,
  getDashboard,
  getDepartments,
  getDepartmentStaff,
  assignHod,
  removeHod
} = require('../../controllers/v1/principalController')
const { protectMe } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

// Public routes
router.post('/login', login)

// Protected principal-only routes
router.use(protectMe)
router.use(authorizeRoles('principal'))

router.get('/dashboard', getDashboard)
router.get('/departments', getDepartments)
router.get('/departments/:departmentId/staff', getDepartmentStaff)
router.put('/departments/:departmentId/assign-hod', assignHod)
router.delete('/departments/:departmentId/remove-hod', removeHod)

module.exports = router
