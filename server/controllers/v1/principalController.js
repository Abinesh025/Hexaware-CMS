const Principal = require('../../models/Principal')
const Department = require('../../models/Department')
const User = require('../../models/User')
const Attendance = require('../../models/Attendance')
const bcrypt = require('bcryptjs')
const generateToken = require('../../config/jwt')

// Helper to send in-app notification via socket
const sendNotification = async (io, { receiverId, receiverRole, title, message, type, relatedId, relatedModel, senderId, department }) => {
  try {
    const Notification = require('../../models/Notification')
    const notif = await Notification.create({
      sender: senderId,
      receiver: receiverId,
      receiverRole,
      department: department || 'General',
      type,
      title,
      message,
      relatedId: relatedId || null,
      relatedModel: relatedModel || null,
      isRead: false
    })
    if (io) {
      io.to(`user:${String(receiverId)}`).emit('new_notification', {
        id: notif._id,
        type,
        title,
        message,
        createdAt: notif.createdAt
      })
    }
    return notif
  } catch (err) {
    console.error('Notification send error:', err.message)
  }
}

// desc    Principal Login
// route   POST /api/v1/principal/login
// access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const principal = await Principal.findOne({ email: email.toLowerCase() })
    if (!principal) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' })
    }

    if (principal.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Principal account is inactive. Please contact the system administrator.' })
    }

    const isMatch = await bcrypt.compare(password, principal.password)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' })
    }

    const token = generateToken(principal._id, 'principal')

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: principal._id,
        name: principal.name,
        email: principal.email,
        role: 'principal',
        status: principal.status
      }
    })
  } catch (error) {
    console.error('Principal Login Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// desc    Get Principal Dashboard Stats
// route   GET /api/v1/principal/dashboard
// access  Private (principal)
exports.getDashboard = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('hod', 'name email department')
      .populate('attendanceCoordinator', 'name email')
      .populate('sportsCoordinator', 'name email')
      .populate('disciplineCoordinator', 'name email')

    const totalDepts = departments.length
    const totalHods = departments.filter(d => d.hod).length
    const deptsWithoutHod = departments.filter(d => !d.hod).length

    const totalFaculty = await User.countDocuments({ role: { $in: ['staff', 'hod', 'principal'] } })

    // Today attendance summary
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayAttendance = await Attendance.countDocuments({ date: { $gte: today } })
    const todayPresent = await Attendance.countDocuments({ date: { $gte: today }, status: 'Present' })

    // Department overview
    const departmentOverview = departments.map(dept => ({
      _id: dept._id,
      name: dept.departmentName,
      code: dept.departmentCode,
      hod: dept.hod ? { name: dept.hod.name, email: dept.hod.email } : null,
      assignedDate: dept.assignedDate,
      coordinators: {
        attendance: dept.attendanceCoordinator?.name || null,
        sports: dept.sportsCoordinator?.name || null,
        discipline: dept.disciplineCoordinator?.name || null
      }
    }))

    res.status(200).json({
      success: true,
      data: {
        totalDepts,
        totalHods,
        deptsWithoutHod,
        totalFaculty,
        attendanceSummary: {
          totalMarked: todayAttendance,
          present: todayPresent,
          absent: todayAttendance - todayPresent
        },
        departmentOverview
      }
    })
  } catch (error) {
    console.error('Principal Dashboard Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// desc    Get All Departments (Principal view, full populated)
// route   GET /api/v1/principal/departments
// access  Private (principal)
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('hod', 'name email department role')
      .populate('assignedByPrincipal', 'name email')
      .populate('attendanceCoordinator', 'name email role')
      .populate('sportsCoordinator', 'name email role')
      .populate('disciplineCoordinator', 'name email role')
      .sort({ departmentName: 1 })

    res.status(200).json({ success: true, data: departments })
  } catch (error) {
    console.error('Get Departments Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// desc    Get Eligible Staff for HOD assignment in a Department
// route   GET /api/v1/principal/departments/:departmentId/staff
// access  Private (principal)
exports.getDepartmentStaff = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.departmentId)
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' })
    }

    const staffList = await User.find({
      department: dept.departmentName,
      role: { $in: ['staff', 'hod'] },
      status: 'active'
    }).select('name email role department regnum')

    res.status(200).json({ success: true, data: staffList, department: dept.departmentName })
  } catch (error) {
    console.error('Get Dept Staff Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// desc    Assign HOD to Department
// route   PUT /api/v1/principal/departments/:departmentId/assign-hod
// access  Private (principal)
exports.assignHod = async (req, res) => {
  try {
    const { staffId } = req.body
    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' })
    }

    const dept = await Department.findById(req.params.departmentId)
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' })

    const staff = await User.findById(staffId)
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' })

    // Validate staff belongs to same department
    if (staff.department !== dept.departmentName) {
      return res.status(400).json({
        success: false,
        message: `Selected staff member must belong to ${dept.departmentName} department`
      })
    }

    const previousHodId = dept.hod

    // Demote previous HOD if exists and is different
    if (previousHodId && String(previousHodId) !== String(staffId)) {
      await User.findByIdAndUpdate(previousHodId, { role: 'staff' })
      // Send demotion notification
      try {
        const { getIo } = require('../../socket/chatSocket')
        await sendNotification(getIo(), {
          receiverId: previousHodId,
          receiverRole: 'staff',
          title: 'HOD Role Removed',
          message: `Your HOD role for ${dept.departmentName} has been transferred by the Principal.`,
          type: 'hod_demotion',
          relatedId: dept._id,
          relatedModel: 'Department',
          senderId: req.user._id,
          department: dept.departmentName
        })
      } catch (e) { /* Notification failure should not fail the request */ }
    }

    // Promote new HOD
    await User.findByIdAndUpdate(staffId, { role: 'hod', department: dept.departmentName })

    // Update Department record
    await Department.findByIdAndUpdate(req.params.departmentId, {
      hod: staffId,
      assignedByPrincipal: req.user._id,
      assignedDate: new Date()
    })

    // Send promotion notification
    try {
      const { getIo } = require('../../socket/chatSocket')
      await sendNotification(getIo(), {
        receiverId: staffId,
        receiverRole: 'hod',
        title: 'Congratulations! Promoted to HOD',
        message: `You have been appointed as Head of Department for ${dept.departmentName} by the Principal.`,
        type: 'hod_promotion',
        relatedId: dept._id,
        relatedModel: 'Department',
        senderId: req.user._id,
        department: dept.departmentName
      })
    } catch (e) { /* Notification failure should not fail the request */ }

    const updated = await Department.findById(req.params.departmentId)
      .populate('hod', 'name email department role')
      .populate('assignedByPrincipal', 'name email')

    res.status(200).json({
      success: true,
      message: `${staff.name} has been successfully appointed as HOD of ${dept.departmentName}`,
      data: updated
    })
  } catch (error) {
    console.error('Assign HOD Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// desc    Remove HOD from Department
// route   DELETE /api/v1/principal/departments/:departmentId/remove-hod
// access  Private (principal)
exports.removeHod = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.departmentId)
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' })

    if (!dept.hod) {
      return res.status(400).json({ success: false, message: 'This department has no assigned HOD' })
    }

    const hodId = dept.hod
    const hodUser = await User.findById(hodId)

    // Demote HOD to staff
    await User.findByIdAndUpdate(hodId, { role: 'staff' })

    // Clear HOD from department
    await Department.findByIdAndUpdate(req.params.departmentId, {
      hod: null,
      assignedByPrincipal: null,
      assignedDate: null
    })

    // Send demotion notification
    if (hodUser) {
      try {
        const { getIo } = require('../../socket/chatSocket')
        await sendNotification(getIo(), {
          receiverId: hodId,
          receiverRole: 'staff',
          title: 'HOD Role Removed',
          message: `Your HOD appointment for ${dept.departmentName} has been withdrawn by the Principal.`,
          type: 'hod_demotion',
          relatedId: dept._id,
          relatedModel: 'Department',
          senderId: req.user._id,
          department: dept.departmentName
        })
      } catch (e) { /* Notification failure should not fail the request */ }
    }

    res.status(200).json({
      success: true,
      message: `HOD removed from ${dept.departmentName} successfully`
    })
  } catch (error) {
    console.error('Remove HOD Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
