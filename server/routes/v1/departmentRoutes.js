const express = require('express')
const router = express.Router()
const { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../../controllers/v1/departmentController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

// Read routes
router.get('/', getAllDepartments)
router.get('/:id', getDepartmentById)

// CRUD routes for admin
router.post('/', authorizeRoles('admin'), createDepartment)
router.put('/:id', authorizeRoles('admin'), updateDepartment)
router.delete('/:id', authorizeRoles('admin'), deleteDepartment)

module.exports = router
