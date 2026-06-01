const express = require('express')
const router = express.Router()
const {
  createFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty
} = require('../../controllers/v1/officeFacultyController')
const { protectMe } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

// Secure all routes in this file for office staff only
router.use(protectMe, authorizeRoles('office_staff'))

router.post('/', createFaculty)
router.get('/', getAllFaculty)
router.get('/:id', getFacultyById)
router.put('/:id', updateFaculty)
router.delete('/:id', deleteFaculty)

module.exports = router
