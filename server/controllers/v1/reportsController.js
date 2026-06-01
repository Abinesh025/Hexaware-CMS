const Attendance = require('../../models/Attendance')
const Marks = require('../../models/Marks')
const Fees = require('../../models/Fees')
const Faculty = require('../../models/Faculty')
const Student = require('../../models/Student')
const User = require('../../models/User')
const Report = require('../../models/Report')

// Get complete stats summary (Principal / Admin view)
exports.getGeneralSummary = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' })
    const facultyCount = await User.countDocuments({ role: 'staff' })
    const hodCount = await User.countDocuments({ role: 'hod' })

    const feeStats = await Fees.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$paidAmount' },
          totalDues: { $sum: '$balanceDue' }
        }
      }
    ])

    const attendanceStats = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ])

    const totalAttendancePct = attendanceStats.length > 0 && attendanceStats[0].total > 0
      ? Math.round((attendanceStats[0].present / attendanceStats[0].total) * 100)
      : 0

    res.status(200).json({
      success: true,
      data: {
        counts: {
          students: studentCount,
          faculty: facultyCount,
          hods: hodCount
        },
        fees: {
          collected: feeStats[0]?.totalCollected || 0,
          pending: feeStats[0]?.totalDues || 0
        },
        attendance: {
          overallPercentage: totalAttendancePct
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Get department-wise stats (Principal view)
exports.getDepartmentPerformance = async (req, res) => {
  try {
    const deptStats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          studentCount: { $sum: 1 }
        }
      }
    ])

    res.status(200).json({ success: true, data: deptStats })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Generate & save student progress report card
exports.generateStudentProgressReport = async (req, res) => {
  try {
    const { studentId } = req.body // User._id reference

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student User ID is required' })
    }

    // 1. Attendance Summary
    const totalClasses = await Attendance.countDocuments({ student: studentId })
    const presentClasses = await Attendance.countDocuments({ student: studentId, status: 'Present' })
    const attendancePct = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

    // 2. Marks Summary
    const marksRecords = await Marks.find({ student: studentId, isApproved: true })
      .populate('course', 'courseName courseCode')

    const marksSummary = marksRecords.map(m => ({
      course: m.course._id,
      courseName: m.course.courseName,
      courseCode: m.course.courseCode,
      internalMarks: m.internalMarks,
      endSemesterMarks: m.endSemesterMarks,
      totalMarks: m.totalMarks,
      grade: m.grade
    }))

    // 3. Fee Summary
    const feeRecord = await Fees.findOne({ student: studentId })
    const feeSummary = {
      totalFee: feeRecord?.totalFee || 0,
      paidAmount: feeRecord?.paidAmount || 0,
      balanceDue: feeRecord?.balanceDue || 0,
      paymentStatus: feeRecord?.paymentStatus || 'Unpaid'
    }

    // Evaluate progress status
    let progressStatus = 'Satisfactory'
    if (attendancePct < 75) progressStatus = 'Critical Attendance'
    const failedSubjects = marksSummary.filter(m => m.grade === 'RA').length
    if (failedSubjects > 0) progressStatus = `Arrears pending (${failedSubjects})`
    if (attendancePct >= 90 && failedSubjects === 0) progressStatus = 'Excellent'

    // Save report card in DB
    const reportCard = await Report.create({
      student: studentId,
      attendanceSummary: Math.round(attendancePct),
      marksSummary,
      feeSummary,
      progressStatus,
      generatedBy: req.user._id
    })

    res.status(201).json({ success: true, message: 'Progress report generated', data: reportCard })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Get student progress report history
exports.getStudentReports = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id
    const reports = await Report.find({ student: studentId })
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, data: reports })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
