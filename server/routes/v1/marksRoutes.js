const express = require('express')
const router = express.Router()
const { saveMarks, getMarks, approveMarks, getMyMarks } = require('../../controllers/v1/marksController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

// Students view their own approved marks
router.get('/my', authorizeRoles('student'), getMyMarks)

// Entering marks (staff, HOD, admin)
router.post('/', authorizeRoles('staff', 'hod', 'admin'), saveMarks)

// Querying marks (admin, principal, HOD, staff)
router.get('/', authorizeRoles('admin', 'principal', 'hod', 'staff'), getMarks)

// HOD approvals (HOD, admin)
router.patch('/approve/:id', authorizeRoles('hod', 'admin'), approveMarks)

module.exports = router
