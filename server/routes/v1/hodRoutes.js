const express = require('express')
const router = express.Router()
const {
  getCoordinators,
  getDeptStaff,
  assignCoordinator,
  removeCoordinator
} = require('../../controllers/v1/hodController')
const { protectMe } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectMe)
router.use(authorizeRoles('hod'))

router.get('/coordinators', getCoordinators)
router.get('/staff', getDeptStaff)
router.put('/coordinators', assignCoordinator)
router.delete('/coordinators/:type', removeCoordinator)

module.exports = router
