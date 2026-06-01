const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Auto-create upload directories if they don't exist
;['uploads/images', 'uploads/videos', 'uploads/voice', 'uploads/files'].forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir)
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true })
})


// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, 'uploads/images')
    } else if (file.mimetype.startsWith('video')) {
      cb(null, 'uploads/videos')
    } else if (file.mimetype.startsWith('audio')) {
      cb(null, 'uploads/voice')
    } else {
      cb(null, 'uploads/files') // pdf, doc, ppt
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname
    cb(null, uniqueName)
  }
})

// File filter (security)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'audio/mpeg',
    'audio/webm'
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('File type not allowed'), false)
  }
}

// Upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
})

module.exports = upload