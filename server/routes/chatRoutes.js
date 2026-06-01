const express = require('express')
const router = express.Router()
const { getChatHistory, uploadVoice, getRoomHistory } = require('../controllers/chatController')
const { protectMe } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

router.get('/history/:userId', protectMe, getChatHistory)
router.get('/room/:roomId', protectMe, getRoomHistory)
router.post('/upload-voice', protectMe, upload.single('audio'), uploadVoice)

module.exports = router