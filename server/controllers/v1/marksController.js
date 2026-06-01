const Marks = require('../../models/Marks')
const User = require('../../models/User')
const { getIo } = require('../../socket/chatSocket')

// Save or Update Marks (Staff enters marks)
exports.saveMarks = async (req, res) => {
  try {
    const { student, course, department, semester, internalMarks, endSemesterMarks } = req.body

    if (!student || !course || !department || !semester || internalMarks === undefined) {
      return res.status(400).json({ success: false, message: 'Required fields missing' })
    }

    const enteredBy = req.user._id

    // Check if marks record already exists
    let markRecord = await Marks.findOne({ student, course })

    if (markRecord) {
      markRecord.internalMarks = Number(internalMarks)
      if (endSemesterMarks !== undefined) {
        markRecord.endSemesterMarks = endSemesterMarks !== null ? Number(endSemesterMarks) : null
      }
      markRecord.enteredBy = enteredBy
      markRecord.isApproved = false // reset HOD approval on edits
      await markRecord.save()
    } else {
      markRecord = await Marks.create({
        student,
        course,
        department,
        semester: Number(semester),
        internalMarks: Number(internalMarks),
        endSemesterMarks: endSemesterMarks !== undefined && endSemesterMarks !== null ? Number(endSemesterMarks) : null,
        enteredBy
      })
    }

    // Trigger Notification for HOD
    const io = getIo()
    if (io) {
      io.emit('marks_submitted', { student, course, enteredBy })
    }

    res.status(200).json({ success: true, message: 'Marks saved successfully', data: markRecord })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Get Marks with search/filters
exports.getMarks = async (req, res) => {
  try {
    const { studentId, department, semester, course } = req.query
    const filter = {}

    if (studentId) {
      const query = { role: 'student' }
      if (require('mongoose').Types.ObjectId.isValid(studentId)) {
        query._id = studentId
      } else {
        query.regnum = studentId.toUpperCase()
      }
      const studentUser = await User.findOne(query)
      if (studentUser) {
        filter.student = studentUser._id
      } else {
        return res.status(200).json({ success: true, hasAttendedTest: false, data: [] })
      }
    }
    if (department) filter.department = department
    if (semester) filter.semester = Number(semester)
    if (course) filter.course = course

    const marks = await Marks.find(filter)
      .populate('student', 'name email regnum department')
      .populate('course', 'courseName courseCode')
      .populate('enteredBy', 'name')
      .sort({ createdAt: -1 })

    const resultsCount = filter.student ? await require('../../models/Result').countDocuments({ student: filter.student }) : 0
    res.status(200).json({ 
      success: true, 
      hasAttendedTest: filter.student ? resultsCount > 0 : true,
      data: marks 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// HOD approves marks
exports.approveMarks = async (req, res) => {
  try {
    const { id } = req.params
    const marks = await Marks.findByIdAndUpdate(id, { isApproved: true }, { new: true })
      .populate('student', 'name email')
      .populate('course', 'courseName')

    if (!marks) {
      return res.status(404).json({ success: false, message: 'Marks record not found' })
    }

    // Trigger Notification to Student
    const io = getIo()
    if (io) {
      io.to(String(marks.student._id)).emit('new_notification', {
        title: 'Marks Approved',
        message: `Your marks for ${marks.course.courseName} have been approved by HOD.`,
        type: 'marks_published',
        createdAt: new Date()
      })
    }

    res.status(200).json({ success: true, message: 'Marks approved successfully', data: marks })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Student views their own marks
exports.getMyMarks = async (req, res) => {
  try {
    const marks = await Marks.find({ student: req.user._id, isApproved: true })
      .populate('course', 'courseName courseCode credits')
      .populate('enteredBy', 'name')

    res.status(200).json({ success: true, data: marks })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
