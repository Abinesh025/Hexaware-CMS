const express = require('express')
const router = express.Router()
const { getAllFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty } = require('../../controllers/v1/facultyController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

router.get('/', authorizeRoles('admin', 'principal', 'hod'), getAllFaculty)
router.get('/:id', authorizeRoles('admin', 'principal', 'hod'), getFacultyById)

router.post('/', authorizeRoles('admin'), createFaculty)
router.put('/:id', authorizeRoles('admin'), updateFaculty)
router.delete('/:id', authorizeRoles('admin'), deleteFaculty)

module.exports = router
