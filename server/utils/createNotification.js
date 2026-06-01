const Notification = require('../models/Notification')
const { getIo } = require('../socket/chatSocket')

/**
 * Creates notifications for multiple receivers and emits Socket.IO events.
 * * @param {Object} params
 * @param {string} params.senderId - The ID of the user triggering the notification
 * @param {Array<string|Object>} params.receivers - Array of User IDs or User objects to receive the notification
 * @param {string} params.receiverRole - The role of the receivers ('student', 'staff', etc.)
 * @param {string} params.department - The department for the notification
 * @param {string} params.type - The notification type ('material_upload', 'test_upload', 'test_submission')
 * @param {string} params.title - The notification title
 * @param {string} params.message - The notification message content
 * @param {string} params.relatedId - The ID of the related model document
 * @param {string} params.relatedModel - The name of the related model ('Material', 'Test', 'TestSubmission')
 */
const createNotifications = async ({
  senderId,
  receivers,
  receiverRole,
  department,
  type,
  title,
  message,
  relatedId,
  relatedModel
}) => {
  try {
    if (!receivers || receivers.length === 0) {
      return []
    }

    const notificationsData = receivers.map(receiver => {
      const receiverId = receiver._id || receiver
      return {
        sender: senderId,
        receiver: receiverId,
        receiverRole,
        department,
        type,
        title,
        message,
        relatedId,
        relatedModel,
        isRead: false
      }
    })

    const createdNotifications = await Notification.insertMany(notificationsData)

    // Emit Socket.IO real-time notification
    const io = getIo()
    if (io) {
      createdNotifications.forEach(notif => {
        const receiverRoom = `user:${notif.receiver}`
        io.to(receiverRoom).emit('new_notification', {
          id: notif._id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          createdAt: notif.createdAt
        })
      })
    }

    return createdNotifications
  } catch (error) {
    console.error('Error creating notifications:', error.message)
    throw error
  }
}

module.exports = createNotifications
