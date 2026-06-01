const express = require('express')
const router = express.Router()
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../../controllers/v1/userController')
const { protectAny } = require('../../middleware/authMiddleware')
const { authorizeRoles } = require('../../middleware/roleMiddleware')

// Protect all routes under /api/v1/users to authenticated users
router.use(protectAny)

router.get('/', authorizeRoles('admin', 'office_staff'), getAllUsers)
router.get('/:id', authorizeRoles('admin', 'office_staff'), getUserById)
router.post('/', authorizeRoles('admin'), createUser)
router.put('/:id', authorizeRoles('admin'), updateUser)
router.delete('/:id', authorizeRoles('admin'), deleteUser)

module.exports = router
