const express = require('express')
const router = express.Router()
const { getAllSalaries, updateSalary, getMySalary } = require('../../controllers/v1/salaryController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

// Faculty self-check
router.get('/my', authorizeRoles('staff', 'hod'), getMySalary)

// CRUD (Admin, Office Staff)
router.get('/', authorizeRoles('admin', 'office_staff'), getAllSalaries)
router.put('/:id', authorizeRoles('admin', 'office_staff'), updateSalary)

module.exports = router
