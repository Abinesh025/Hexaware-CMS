const Test = require('../models/Test')
const Result = require('../models/Result')
const User = require('../models/User')
const TestSubmission = require('../models/TestSubmission')
const createNotifications = require('../utils/createNotification')
const sendSms = require('../utils/sendSms')

// Create Test (Staff Only)
exports.createTest = async (req, res) => {
  try {
    // Verify logged-in user role is staff
    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Only staff can create tests' })
    }

    const { title, subject, duration, questions } = req.body

    // Get staff department from req.user.department
    const department = req.user.department
    if (!department) {
      return res.status(400).json({ message: 'Staff department is required' })
    }

    // Validation
    if (!title || !subject || !duration || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Ensure valid question structure
    for (let q of questions) {
      if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) {
        return res.status(400).json({ message: 'Invalid question format' })
      }
    }

    const test = await Test.create({
      title,
      subject,
      department,
      duration,
      questions,
      createdBy: req.user._id
    })

    // Find students where role='student' and department equals staff department
    const students = await User.find({ role: 'student', department })

    // Create notifications for them
    const message = `New test uploaded by ${req.user.name || 'Staff'}: ${title}`
    await createNotifications({
      senderId: req.user._id,
      receivers: students,
      receiverRole: 'student',
      department,
      type: 'test_upload',
      title: 'New Test Uploaded',
      message,
      relatedId: test._id,
      relatedModel: 'Test'
    })

    res.status(201).json({
      message: 'Test created successfully',
      test
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get All Tests (Student View)
exports.getTests = async (req, res) => {
  try {
    const tests = await Test.find()
      .select('-questions.correctAnswer')
      .sort({ createdAt: -1 })

    res.json(tests)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get Single Test
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .select('-questions.correctAnswer')

    if (!test) return res.status(404).json({ message: 'Test not found' })

    res.json(test)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Submit Test ( FIXED)
exports.submitTest = async (req, res) => {
  try {
    // Verify logged-in user role is student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit tests' })
    }

    const { answers } = req.body
    const testId = req.params.id

    const test = await Test.findById(testId)
    if (!test) return res.status(404).json({ message: 'Test not found' })

    // Prevent multiple submissions
    const existing = await Result.findOne({
      student: req.user._id,
      test: testId
    })

    if (existing) {
      return res.status(400).json({ message: 'You already submitted this test' })
    }

    let score = 0

    test.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++
      }
    })

    const result = await Result.create({
      student: req.user._id,
      test: testId,
      answers,
      score,
      totalMarks: test.questions.length
    })

    // Send SMS to student phone if registered
    let smsStatus = 'not_sent'
    let smsSentAt = null

    if (req.user.phone) {
      const phoneRegex = /^\+?[0-9]{10,15}$/
      if (phoneRegex.test(req.user.phone.trim())) {
        const studentName = req.user.name || 'Student'
        const testTitle = test.title || 'Test'
        const department = req.user.department || 'General'
        const message = `Dear ${studentName}, your test '${testTitle}' has been submitted successfully. Department: ${department}. Thank you.`
        
        try {
          const smsResult = await sendSms(req.user.phone, message)
          if (smsResult.success) {
            smsStatus = 'sent'
            smsSentAt = new Date()
          } else {
            smsStatus = 'failed'
          }
        } catch (smsErr) {
          console.error('[SMS ERROR] SMS dispatch crashed:', smsErr.message)
          smsStatus = 'failed'
        }
      } else {
        console.warn(`[SMS WARNING] Phone number format is invalid: ${req.user.phone}`)
        smsStatus = 'failed'
      }
    }

    // Save test submission
    const submission = await TestSubmission.create({
      student: req.user._id,
      test: testId,
      answers,
      score,
      totalQuestions: test.questions.length,
      smsStatus,
      smsSentAt
    })

    // Find staff using test.createdBy
    let warning = null
    const staff = await User.findById(test.createdBy)
    if (!staff) {
      warning = "Corresponding staff not found for notification, but submission saved."
    } else {
      // Create notification for staff
      const studentName = req.user.name || 'Student'
      await createNotifications({
        senderId: req.user._id,
        receivers: [staff],
        receiverRole: 'staff',
        department: req.user.department,
        type: 'test_submission',
        title: 'New Test Submission',
        message: `${studentName} submitted the test: ${test.title}`,
        relatedId: submission._id,
        relatedModel: 'TestSubmission'
      })
    }

    res.json({
      message: 'Test submitted successfully',
      score,
      total: test.questions.length,
      result,
      submission,
      warning
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get Student Results
exports.getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('test', 'title subject')
      .sort({ createdAt: -1 })

    res.json(results)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete Test (Staff Only)
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
    if (!test) return res.status(404).json({ message: 'Test not found' })

    if (test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await test.deleteOne()

    res.json({ message: 'Test deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}