const express = require('express')
const { getNotifications, markAsRead, markAllAsRead,deleteNotification,deleteAllNotification } = require('../controllers/notificationController')
const { protectMe } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protectMe, getNotifications)
router.patch('/:id/read', protectMe, markAsRead)
router.put('/:id/read', protectMe, markAsRead)
router.put('/read-all', protectMe, markAllAsRead)
router.delete('/delete/:id', protectMe, deleteNotification);
router.delete('/delete-all', protectMe, deleteAllNotification);

module.exports = router
