const express = require('express')
const router = express.Router()
const { getAllLabs, createLabEquipment, updateLabEquipment, deleteLabEquipment } = require('../../controllers/v1/labsController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

router.use(protectAny)

router.get('/', getAllLabs)

router.post('/', authorizeRoles('admin', 'hod'), createLabEquipment)
router.put('/:id', authorizeRoles('admin', 'hod'), updateLabEquipment)
router.delete('/:id', authorizeRoles('admin', 'hod'), deleteLabEquipment)

module.exports = router
