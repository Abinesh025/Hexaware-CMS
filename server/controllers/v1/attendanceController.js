const Attendance = require('../../models/Attendance')
const User = require('../../models/User')

// Enter or update attendance for a batch of students
exports.saveAttendance = async (req, res) => {
  try {
    const { course, department, semester, date, attendanceRecords } = req.body
    // attendanceRecords is an array: [{ studentId: ObjectId, status: 'Present' | 'Absent' }]

    if (!course || !department || !semester || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ success: false, message: 'All fields are required and attendanceRecords must be an array' })
    }

    // ── Access control ──────────────────────────────────────────────────
    // Admin and HOD are always allowed. Staff are only allowed if they are
    // the designated Attendance Coordinator for the selected department.
    const requestorRole = req.user.role
    if (requestorRole === 'staff') {
      const Department = require('../../models/Department')
      const dept = await Department.findOne({ departmentName: department })
      if (!dept || dept.attendanceCoordinator?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Only the assigned Department Attendance Coordinator can mark attendance.'
        })
      }
    } else if (requestorRole !== 'admin' && requestorRole !== 'hod') {
      return res.status(403).json({ success: false, message: 'Access Denied: You are not authorized to mark attendance.' })
    }
    // ────────────────────────────────────────────────────────────────────

    const markedBy = req.user._id
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0) // normalize date to midnight for comparison

    const operations = attendanceRecords.map(async (record) => {
      return Attendance.findOneAndUpdate(
        {
          student: record.student,
          course,
          department,
          semester: Number(semester),
          date: attendanceDate
        },
        {
          status: record.status,
          markedBy
        },
        { upsert: true, new: true }
      )
    })

    await Promise.all(operations)
    res.status(200).json({ success: true, message: 'Attendance records updated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}


// Get attendance records with filters
exports.getAttendance = async (req, res) => {
  try {
    const { department, semester, course, date } = req.query
    const filter = {}

    if (department) filter.department = department
    if (semester) filter.semester = Number(semester)
    if (course) filter.course = course
    if (date) {
      const searchDate = new Date(date)
      searchDate.setHours(0, 0, 0, 0)
      filter.date = searchDate
    }

    const records = await Attendance.find(filter)
      .populate('student', 'name email regnum')
      .populate('course', 'courseName courseCode')
      .populate('markedBy', 'name')
      .sort({ date: -1 })

    res.status(200).json({ success: true, data: records })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Get student's overall & course-wise attendance stats
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id

    const totalClasses = await Attendance.countDocuments({ student: studentId })
    const totalPresent = await Attendance.countDocuments({ student: studentId, status: 'Present' })

    const percentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0

    // Course-wise details
    const courseStats = await Attendance.aggregate([
      { $match: { student: new (require('mongoose').Types.ObjectId)(studentId) } },
      {
        $group: {
          _id: '$course',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } }
        }
      }
    ])

    // Populate course details manually
    const populatedStats = await Promise.all(
      courseStats.map(async (stat) => {
        const Course = require('../../models/Course')
        const courseInfo = await Course.findById(stat._id).select('courseName courseCode')
        return {
          course: courseInfo,
          total: stat.total,
          present: stat.present,
          percentage: stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0
        }
      })
    )

    res.status(200).json({
      success: true,
      data: {
        totalClasses,
        totalPresent,
        percentage,
        courses: populatedStats
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
