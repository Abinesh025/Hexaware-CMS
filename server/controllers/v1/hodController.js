const Department = require('../../models/Department')
const User = require('../../models/User')

// desc    Get current HOD's department coordinators
// route   GET /api/v1/hod/coordinators
// access  Private (hod)
exports.getCoordinators = async (req, res) => {
  try {
    const dept = await Department.findOne({ hod: req.user._id })
      .populate('attendanceCoordinator', 'name email role department')
      .populate('sportsCoordinator', 'name email role department')
      .populate('disciplineCoordinator', 'name email role department')

    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'No department found for this HOD. Please contact the Principal.'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        department: dept.departmentName,
        attendanceCoordinator: dept.attendanceCoordinator || null,
        sportsCoordinator: dept.sportsCoordinator || null,
        disciplineCoordinator: dept.disciplineCoordinator || null
      }
    })
  } catch (error) {
    console.error('Get Coordinators Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// desc    Get dept staff list for HOD to assign as coordinators
// route   GET /api/v1/hod/staff
// access  Private (hod)
exports.getDeptStaff = async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(400).json({ success: false, message: 'HOD department not assigned' })
    }

    const staffList = await User.find({
      department: req.user.department,
      role: { $in: ['staff', 'hod'] },
      status: 'active'
    }).select('name email role department regnum')

    res.status(200).json({ success: true, data: staffList })
  } catch (error) {
    console.error('HOD Get Dept Staff Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// desc    HOD Assign Coordinator (attendance / sports / discipline)
// route   PUT /api/v1/hod/coordinators
// access  Private (hod)
exports.assignCoordinator = async (req, res) => {
  try {
    const { coordinatorType, staffId } = req.body

    const validTypes = ['attendance', 'sports', 'discipline']
    if (!coordinatorType || !validTypes.includes(coordinatorType)) {
      return res.status(400).json({
        success: false,
        message: `coordinatorType must be one of: ${validTypes.join(', ')}`
      })
    }

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' })
    }

    const dept = await Department.findOne({ hod: req.user._id })
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'No department found. Only an assigned HOD can manage coordinators.'
      })
    }

    // Verify staff belongs to same department
    const staff = await User.findById(staffId)
    if (!staff || staff.department !== dept.departmentName) {
      return res.status(400).json({
        success: false,
        message: `Selected staff member must belong to ${dept.departmentName}`
      })
    }

    const fieldMap = {
      attendance: 'attendanceCoordinator',
      sports: 'sportsCoordinator',
      discipline: 'disciplineCoordinator'
    }

    await Department.findByIdAndUpdate(dept._id, {
      [fieldMap[coordinatorType]]: staffId
    })

    // Notify Principal about coordinator assignment
    try {
      const Principal = require('../../models/Principal')
      const principal = await Principal.findOne({ status: 'active' })
      if (principal) {
        const Notification = require('../../models/Notification')
        const { getIo } = require('../../socket/chatSocket')
        const io = getIo()
        const notif = await Notification.create({
          sender: req.user._id,
          receiver: principal._id,
          receiverRole: 'principal',
          department: dept.departmentName,
          type: 'coordinator_assignment',
          title: 'Coordinator Assignment Update',
          message: `${req.user.name} (HOD) assigned ${staff.name} as ${coordinatorType.charAt(0).toUpperCase() + coordinatorType.slice(1)} Coordinator for ${dept.departmentName}.`,
          relatedId: dept._id,
          relatedModel: 'Department',
          isRead: false
        })
        if (io) {
          io.to(`user:${String(principal._id)}`).emit('new_notification', {
            id: notif._id,
            type: 'coordinator_assignment',
            title: notif.title,
            message: notif.message,
            createdAt: notif.createdAt
          })
        }
      }
    } catch (e) { /* Notification failure should not fail the request */ }

    const updated = await Department.findById(dept._id)
      .populate('attendanceCoordinator', 'name email role')
      .populate('sportsCoordinator', 'name email role')
      .populate('disciplineCoordinator', 'name email role')

    const coordinatorNames = {
      attendance: updated.attendanceCoordinator,
      sports: updated.sportsCoordinator,
      discipline: updated.disciplineCoordinator
    }

    res.status(200).json({
      success: true,
      message: `${staff.name} assigned as ${coordinatorType} coordinator for ${dept.departmentName}`,
      data: {
        department: dept.departmentName,
        attendanceCoordinator: updated.attendanceCoordinator,
        sportsCoordinator: updated.sportsCoordinator,
        disciplineCoordinator: updated.disciplineCoordinator
      }
    })
  } catch (error) {
    console.error('Assign Coordinator Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// desc    Remove a specific coordinator from HOD's department
// route   DELETE /api/v1/hod/coordinators/:type
// access  Private (hod)
exports.removeCoordinator = async (req, res) => {
  try {
    const { type } = req.params
    const validTypes = ['attendance', 'sports', 'discipline']
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid coordinator type. Must be one of: ${validTypes.join(', ')}` })
    }

    const dept = await Department.findOne({ hod: req.user._id })
    if (!dept) {
      return res.status(404).json({ success: false, message: 'No department found for this HOD.' })
    }

    const fieldMap = {
      attendance: 'attendanceCoordinator',
      sports: 'sportsCoordinator',
      discipline: 'disciplineCoordinator'
    }

    await Department.findByIdAndUpdate(dept._id, { [fieldMap[type]]: null })

    res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} coordinator removed from ${dept.departmentName}`
    })
  } catch (error) {
    console.error('Remove Coordinator Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
