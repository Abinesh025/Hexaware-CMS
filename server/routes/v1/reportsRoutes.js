const express = require('express')
const router = express.Router()
const { getGeneralSummary, getDepartmentPerformance, generateStudentProgressReport, getStudentReports } = require('../../controllers/v1/reportsController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

// Summary metrics (Admin, Principal, HOD)
router.get('/summary', authorizeRoles('admin', 'principal', 'hod'), getGeneralSummary)
router.get('/performance', authorizeRoles('admin', 'principal', 'hod'), getDepartmentPerformance)

// Progress report card generation (Staff, HOD, Admin)
router.post('/generate', authorizeRoles('staff', 'hod', 'admin'), generateStudentProgressReport)

// Read reports (Admin, HOD, Principal, Staff can view any; Students view their own)
router.get('/student/:studentId', authorizeRoles('admin', 'hod', 'principal', 'staff', 'student'), getStudentReports)
router.get('/student', authorizeRoles('student'), getStudentReports)

module.exports = router
