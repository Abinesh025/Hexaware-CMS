const express = require('express')
const router = express.Router()
const {
  createTest,
  getTests,
  getTestById,
  submitTest,
  getStudentResults
} = require('../controllers/testController')

const { protectMe } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')

// Staff creates test
router.post('/', protectMe, authorizeRoles('staff', 'admin'), createTest)
router.get('/all', protectMe, authorizeRoles('staff', 'admin'), getTests)

// Students view tests
router.get('/', protectMe, authorizeRoles('student'), getTests)
router.get('/:id', protectMe, authorizeRoles('student'), getTestById)

// Student submits
router.post('/:id/submit', protectMe, authorizeRoles('student'), submitTest)

// Student results
router.get('/results/me', protectMe, authorizeRoles('student'), getStudentResults)

module.exports = router