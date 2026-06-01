const express = require('express')
const router = express.Router()

const {
  getStudentProfile,
  updateStudentProfile,
  getAllMaterials,
  getMaterialById,
  getAvailableTests,
  getTestDetails,
  getMyResults
} = require('../controllers/studentController')

const { protectMe } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')

router.use(protectMe, authorizeRoles('student'))

router.get('/profile', getStudentProfile)
router.put('/profile', updateStudentProfile)

router.get('/materials', getAllMaterials)
router.get('/materials/:id', getMaterialById)

router.get('/tests', getAvailableTests)
router.get('/tests/:id', getTestDetails)

router.get('/results', getMyResults)

module.exports = router