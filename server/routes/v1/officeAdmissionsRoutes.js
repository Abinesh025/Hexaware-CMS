const express = require('express')
const router = express.Router()
const {
  createAdmission,
  getAllAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission
} = require('../../controllers/v1/officeAdmissionsController')
const { protectMe } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

// Secure all routes in this file for office staff only
router.use(protectMe, authorizeRoles('office_staff'))

router.post('/', createAdmission)
router.get('/', getAllAdmissions)
router.get('/:id', getAdmissionById)
router.put('/:id', updateAdmission)
router.delete('/:id', deleteAdmission)

module.exports = router
