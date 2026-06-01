const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

// Check if Cloudinary is configured
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME'

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Storage for materials (pdf, video, audio, docs)
let materialStorage;

if (hasCloudinary) {
  materialStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      let resource_type = 'auto'
      if (file.mimetype.startsWith('video/')) resource_type = 'video'
      else if (file.mimetype.startsWith('audio/')) resource_type = 'video'
      else if (file.mimetype.startsWith('image/')) resource_type = 'image'
      else resource_type = 'raw'
  
      return {
        folder: 'egs-materials',
        resource_type,
        public_id: `material-${Date.now()}`,
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mp3', 'webm', 'wav', 'jpg', 'jpeg', 'png'],
      }
    },
  })
} else {
  // Fallback to local disk storage
  const fs = require('fs')
  const path = require('path')
  const uploadDir = path.join(__dirname, '../uploads/materials')
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  materialStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      cb(null, `material-${Date.now()}${path.extname(file.originalname)}`)
    }
  })
}

// Storage for avatars
let avatarStorage;

if (hasCloudinary) {
  avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'egs-avatars',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 256, height: 256, crop: 'fill' }],
    },
  })
} else {
  const fs = require('fs')
  const path = require('path')
  const uploadDir = path.join(__dirname, '../uploads/avatars')
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      cb(null, `avatar-${req.user ? req.user._id : Date.now()}${path.extname(file.originalname)}`)
    }
  })
}

const uploadMaterial = multer({
  storage: materialStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
})

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

module.exports = { cloudinary, uploadMaterial, uploadAvatar }
