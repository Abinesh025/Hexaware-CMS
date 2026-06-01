const express = require('express')
const router = express.Router()
const { saveAttendance, getAttendance, getStudentAttendanceStats } = require('../../controllers/v1/attendanceController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

// Students can view their own stats, staff/admin/HOD/principal can view any stats
router.get('/stats/:studentId', getStudentAttendanceStats)
router.get('/stats', getStudentAttendanceStats) // for current logged-in student

// Entering attendance is limited to staff and HOD
router.post('/', authorizeRoles('staff', 'hod'), saveAttendance)

// Viewing records is limited to HOD, principal, and staff
router.get('/', authorizeRoles('principal', 'hod', 'staff'), getAttendance)

module.exports = router
