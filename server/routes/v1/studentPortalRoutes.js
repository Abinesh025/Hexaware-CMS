const express = require('express')
const router = express.Router()
const {
  getAllMaterials,
  getAvailableTests,
  getMyResults,
} = require('../../controllers/studentController')
const { getStudentAttendanceStats } = require('../../controllers/v1/attendanceController')
const { getMyMarks } = require('../../controllers/v1/marksController')
const { getMyFees } = require('../../controllers/v1/feesController')
const { getNotifications } = require('../../controllers/notificationController')
const { protectMe } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectMe, authorizeRoles('student'))

router.get('/materials', getAllMaterials)
router.get('/tests', getAvailableTests)
router.get('/results', getMyResults)
router.get('/attendance', getStudentAttendanceStats)
router.get('/marks', getMyMarks)
router.get('/fees', getMyFees)
router.get('/notifications', getNotifications)

module.exports = router
