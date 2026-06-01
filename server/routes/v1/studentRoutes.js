const express = require('express')
const router = express.Router()
const { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent } = require('../../controllers/v1/studentController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

// Read permissions: admin, office staff, principal, HOD, and faculty
router.get('/', authorizeRoles('admin', 'office_staff', 'principal', 'hod', 'staff'), getAllStudents)
router.get('/:id', authorizeRoles('admin', 'office_staff', 'principal', 'hod', 'staff'), getStudentById)

// CRUD permissions: admin, office_staff
router.post('/', authorizeRoles('admin', 'office_staff'), createStudent)
router.put('/:id', authorizeRoles('admin', 'office_staff'), updateStudent)
router.delete('/:id', authorizeRoles('admin', 'office_staff'), deleteStudent)

module.exports = router
