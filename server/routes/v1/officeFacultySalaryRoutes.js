const express = require('express')
const router = express.Router()
const {
  createSalary,
  getAllSalaries,
  getSalaryById,
  updateSalary,
  deleteSalary
} = require('../../controllers/v1/officeFacultySalaryController')
const { protectMe } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

// Secure all routes in this file for office staff only
router.use(protectMe, authorizeRoles('office_staff'))

router.post('/', createSalary)
router.get('/', getAllSalaries)
router.get('/:id', getSalaryById)
router.put('/:id', updateSalary)
router.delete('/:id', deleteSalary)

module.exports = router
