const User = require('../models/User')
const { validateName } = require('../utils/nameValidator')
const Material = require('../models/Material')
const Test = require('../models/Test')
const Result = require('../models/Result')

// Get Student Profile
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select('-password')
    if (!student) return res.status(404).json({ message: 'Student not found' })

    res.json(student)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update Student Profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const { name, department, avatar } = req.body

    const student = await User.findById(req.user._id)
    if (!student) return res.status(404).json({ message: 'Student not found' })

    if (name) {
      const nameValidation = validateName(name)
      if (!nameValidation.valid) {
        return res.status(400).json({ success: false, message: nameValidation.message })
      }
      student.name = name
    }
    if (department) student.department = department
    if (avatar) student.avatar = avatar

    await student.save()

    res.json({ message: 'Profile updated', student })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get All Study Materials (Filter supported)
exports.getAllMaterials = async (req, res) => {
  try {
    const { subject, department, semester, course } = req.query
    const studentDept = req.user.department || department

    let filter = {}
    if (studentDept) filter.department = studentDept
    if (subject) filter.subject = subject
    if (semester) filter.semester = Number(semester)
    if (course) filter.course = { $regex: course, $options: 'i' }

    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name department')
      .sort({ createdAt: -1 })

    res.json(materials)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get Single Material
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
    if (!material) return res.status(404).json({ message: 'Material not found' })

    res.json(material)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get Available Tests
exports.getAvailableTests = async (req, res) => {
  try {
    const { department } = req.query
    const studentDept = department || req.user.department

    const filter = {}
    if (studentDept) {
      // Find tests with matching department or empty department (global)
      filter.$or = [
        { department: studentDept },
        { department: { $in: [null, ''] } }
      ]
    }

    const tests = await Test.find(filter)
      .select('title subject department duration createdAt')
      .sort({ createdAt: -1 })

    res.json(tests)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get Test Details (hide answers)
exports.getTestDetails = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .select('-questions.correctAnswer')

    if (!test) return res.status(404).json({ message: 'Test not found' })

    res.json(test)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Submit Test ( IMPORTANT – YOU MISSED THIS)
exports.submitTest = async (req, res) => {
  try {
    const { answers } = req.body
    const testId = req.params.id

    const test = await Test.findById(testId)
    if (!test) return res.status(404).json({ message: 'Test not found' })

    let score = 0

    test.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++
      }
    })

    const result = await Result.create({
      student: req.user._id,
      test: testId,
      score,
      totalQuestions: test.questions.length
    })

    res.json({
      message: 'Test submitted successfully',
      score,
      total: test.questions.length,
      result
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get My Results
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('test', 'title subject')
      .sort({ createdAt: -1 })

    res.json(results)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}