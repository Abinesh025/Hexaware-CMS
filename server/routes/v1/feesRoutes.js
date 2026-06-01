const express = require('express')
const router = express.Router()
const { getAllFees, createFeeRecord, payFees, getMyFees, getFeeDuesReport } = require('../../controllers/v1/feesController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

// Student self-service
router.get('/my', authorizeRoles('student'), getMyFees)

// Administrative actions
router.get('/', authorizeRoles('admin', 'office_staff', 'principal'), getAllFees)
router.post('/', authorizeRoles('admin', 'office_staff'), createFeeRecord)
router.put('/pay/:id', authorizeRoles('admin', 'office_staff'), payFees)
router.get('/dues', authorizeRoles('admin', 'office_staff', 'principal'), getFeeDuesReport)

module.exports = router
