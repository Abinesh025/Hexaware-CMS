const express = require('express')
const router = express.Router()
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../../controllers/v1/courseController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

router.get('/', getAllCourses)
router.get('/:id', getCourseById)

// CRUD allowed for admin, HOD, and principal
router.post('/', authorizeRoles('admin', 'hod', 'principal'), createCourse)
router.put('/:id', authorizeRoles('admin', 'hod', 'principal'), updateCourse)
router.delete('/:id', authorizeRoles('admin', 'hod', 'principal'), deleteCourse)

module.exports = router
