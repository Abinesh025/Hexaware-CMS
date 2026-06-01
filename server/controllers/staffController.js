const User = require('../models/User')
const { validateName } = require('../utils/nameValidator')
const Material = require('../models/Material')
const Test = require('../models/Test')
const Result = require('../models/Result')
const fs = require('fs')
const path = require('path')
const { getIo } = require('../socket/chatSocket')

// GET STAFF PROFILE
exports.getStaffProfile = async (req, res) => {
  try {
    const staff = await User.findById(req.user._id).select('-password')

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      })
    }

    res.status(200).json({
      success: true,
      data: staff
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// UPDATE STAFF PROFILE
exports.updateStaffProfile = async (req, res) => {
  try {
    const { name, department, avatar } = req.body

    const staff = await User.findById(req.user._id)
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      })
    }

    if (name) {
      const nameValidation = validateName(name)
      if (!nameValidation.valid) {
        return res.status(400).json({
          success: false,
          message: nameValidation.message
        })
      }
      staff.name = name
    }
    if (department) staff.department = department
    if (avatar) staff.avatar = avatar

    await staff.save()

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: staff
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// UPDATE MATERIAL
exports.updateMaterial = async (req, res) => {
  try {
    const { title, subject, department, unit, type, semester, course } = req.body

    const material = await Material.findById(req.params.id)
    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" })
    }

    if (material.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" })
    }

    if (title) material.title = title
    if (subject) material.subject = subject
    if (req.user.department) material.department = req.user.department
    if (unit) material.unit = unit
    if (type) material.type = type
    if (semester !== undefined) material.semester = semester ? Number(semester) : null
    if (course !== undefined) material.course = course || ''

    await material.save()

    const io = getIo()
    if (io) io.emit('data_changed', 'material')

    res.status(200).json({ success: true, message: "Material updated successfully", data: material })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET MY MATERIALS
exports.getMyMaterials = async (req, res) => {
  try {
    const { semester, course } = req.query
    const filter = { uploadedBy: req.user._id }

    if (semester) {
      filter.semester = Number(semester)
    }
    if (course) {
      filter.course = { $regex: course, $options: 'i' }
    }

    const materials = await Material.find(filter)
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// DELETE MATERIAL
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      })
    }

    if (material.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      })
    }

    // delete file
    if (material.fileUrl) {
      const filePath = path.join(__dirname, "..", material.fileUrl)

      fs.unlink(filePath, (err) => {
        if (err) console.log("File delete error:", err)
      })
    }

    await material.deleteOne()

    const io = getIo();
    if (io) io.emit('data_changed', 'material');

    res.status(200).json({
      success: true,
      message: "Material deleted successfully"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// GET MY TESTS
exports.getMyTests = async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// DELETE TEST
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      })
    }

    if (test.createdBy && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      })
    }

    await test.deleteOne()

    const io = getIo();
    if (io) io.emit('data_changed', 'test');

    res.status(200).json({
      success: true,
      message: "Test deleted successfully"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// GET TEST RESULTS
exports.getTestResults = async (req, res) => {
  try {
    const results = await Result.find({ test: req.params.testId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}



// ── Dashboard Stats ───────────────────────────────
// For Admin: counts all users, materials, tests, results
exports.getDashboardStats = async (req, res) => {
  try {
    let totalStudents, totalStaff, totalMaterials, totalTests, totalResults

    if (req.user.role === 'admin') {
      totalStudents = await User.countDocuments({ role: 'student' })
      totalStaff    = await User.countDocuments({ role: 'staff' })
      totalMaterials = await Material.countDocuments()
      totalTests    = await Test.countDocuments()
      totalResults  = await Result.countDocuments()
    } else if (req.user.role === 'staff') {
      totalMaterials = await Material.countDocuments({ uploadedBy: req.user._id });
      totalTests     = await Test.countDocuments({ createdBy: req.user._id });
      totalResults   = await Result.countDocuments()
    }

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalStaff,
        totalMaterials,
        totalTests,
        totalResults
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    })
  }
}