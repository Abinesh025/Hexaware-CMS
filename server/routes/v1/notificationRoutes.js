const express = require('express')
const router = express.Router()
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotification
} = require('../../controllers/notificationController')
const { protectMe } = require('../../middleware/authMiddleware')

router.use(protectMe)

router.get('/', getNotifications)
router.patch('/:id/read', markAsRead)
router.put('/read-all', markAllAsRead)
router.delete('/delete/:id', deleteNotification)
router.delete('/delete-all', deleteAllNotification)

module.exports = router
