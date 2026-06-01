const express = require('express')
const router = express.Router()
const {
  getDepartments,
  getDepartmentStaff,
  assignHod,
  removeHod,
  getAuditLogs
} = require('../../controllers/v1/hodManagementController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

// All routes require authentication + principal OR admin role
// Uses protectAny to support both admin (x-admin-token) and principal (Bearer JWT)
router.use(protectAny)
router.use(authorizeRoles('principal', 'admin'))

router.get('/departments', getDepartments)
router.get('/departments/:departmentId/staff', getDepartmentStaff)
router.get('/staff', getDepartmentStaff)
router.post('/departments/:departmentId/assign-hod', assignHod)
router.delete('/departments/:departmentId/remove-hod', removeHod)
router.get('/logs', getAuditLogs)

module.exports = router
