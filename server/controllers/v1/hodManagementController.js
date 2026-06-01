const Department = require('../../models/Department')
const User = require('../../models/User')
const HodAssignmentLog = require('../../models/HodAssignmentLog')

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
    console.error('Notification send error in HOD management:', err.message)
  }
}


// ─────────────────────────────────────────────────────────────
// GET  /api/v1/hod-management/departments
// Access: admin | principal
// ─────────────────────────────────────────────────────────────
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('hod', 'name email department regnum')
      .populate('hodAssignedBy', 'name email role')
      .sort({ departmentName: 1 })

    const data = departments.map(d => ({
      _id: d._id,
      departmentName: d.departmentName,
      departmentCode: d.departmentCode,
      description: d.description,
      hod: d.hod
        ? {
            _id: d.hod._id,
            name: d.hod.name,
            email: d.hod.email,
            regnum: d.hod.regnum
          }
        : null,
      hodAssignedBy: d.hodAssignedBy
        ? { name: d.hodAssignedBy.name, role: d.hodAssignedBy.role }
        : null,
      hodAssignedByRole: d.hodAssignedByRole,
      hodAssignedAt: d.hodAssignedAt
    }))

    res.status(200).json({ success: true, count: data.length, data })
  } catch (error) {
    console.error('HOD Mgmt getDepartments Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET  /api/v1/hod-management/departments/:departmentId/staff
// Access: admin | principal
// ─────────────────────────────────────────────────────────────
exports.getDepartmentStaff = async (req, res) => {
  try {
    const deptId = req.params.departmentId || req.query.departmentId
    if (!deptId) {
      return res.status(400).json({ success: false, message: 'Department ID is required' })
    }

    const dept = await Department.findById(deptId)
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' })
    }

    const staffList = await User.find({
      department: dept.departmentName,
      role: { $in: ['staff', 'hod'] },
      status: 'active'
    })
      .select('name email role regnum department')
      .sort({ name: 1 })

    res.status(200).json({
      success: true,
      department: {
        _id: dept._id,
        name: dept.departmentName,
        code: dept.departmentCode,
        hasHod: !!dept.hod,
        hodId: dept.hod || null
      },
      data: staffList
    })
  } catch (error) {
    console.error('HOD Mgmt getDepartmentStaff Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────
// POST  /api/v1/hod-management/departments/:departmentId/assign-hod
// Body: { staffId }
// Access: admin | principal
// ─────────────────────────────────────────────────────────────
exports.assignHod = async (req, res) => {
  try {
    const { staffId, remarks } = req.body

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' })
    }

    const dept = await Department.findById(req.params.departmentId)
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' })
    }

    // Block if HOD already exists (must remove first)
    if (dept.hod) {
      return res.status(409).json({
        success: false,
        message: 'This department already has an HOD. Remove the existing HOD before assigning a new one.',
        currentHodId: dept.hod
      })
    }

    const staff = await User.findById(staffId)
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Selected staff member not found' })
    }

    // Validate staff belongs to this department
    if (staff.department !== dept.departmentName) {
      return res.status(400).json({
        success: false,
        message: `Selected staff does not belong to this department. Expected: ${dept.departmentName}, Found: ${staff.department}`
      })
    }

    // Promote staff to HOD role and add to additionalRoles
    await User.findByIdAndUpdate(staffId, {
      role: 'hod',
      $addToSet: { additionalRoles: 'hod' }
    })

    // Update Department
    const now = new Date()
    await Department.findByIdAndUpdate(req.params.departmentId, {
      hod: staffId,
      hodAssignedBy: req.user._id,
      hodAssignedByRole: req.user.role,
      hodAssignedAt: now,
      assignedByPrincipal: req.user.role === 'principal' ? req.user._id : null,
      assignedDate: now
    })

    // Audit log
    await HodAssignmentLog.create({
      department: dept._id,
      previousHod: null,
      newHod: staffId,
      action: 'assigned',
      performedBy: req.user._id,
      performedByRole: req.user.role,
      remarks: remarks || `${staff.name} assigned as HOD for ${dept.departmentName}`
    })

    // Send promotion notification
    try {
      const { getIo } = require('../../socket/chatSocket')
      await sendNotification(getIo(), {
        receiverId: staffId,
        receiverRole: 'hod',
        title: 'Congratulations! Promoted to HOD',
        message: `You have been appointed as Head of Department for ${dept.departmentName} by the ${req.user.role === 'principal' ? 'Principal' : 'Administrator'}.`,
        type: 'hod_promotion',
        relatedId: dept._id,
        relatedModel: 'Department',
        senderId: req.user._id,
        department: dept.departmentName
      })
    } catch (e) { /* Notification failure should not fail the request */ }

    res.status(200).json({
      success: true,
      message: `HOD assigned successfully. ${staff.name} is now the Head of ${dept.departmentName}.`,
      data: {
        departmentId: dept._id,
        departmentName: dept.departmentName,
        hod: { _id: staff._id, name: staff.name, email: staff.email },
        assignedAt: now,
        assignedBy: { name: req.user.name, role: req.user.role }
      }
    })
  } catch (error) {
    console.error('HOD Mgmt assignHod Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE  /api/v1/hod-management/departments/:departmentId/remove-hod
// Access: admin | principal
// ─────────────────────────────────────────────────────────────
exports.removeHod = async (req, res) => {
  try {
    const { remarks } = req.body || {}

    const dept = await Department.findById(req.params.departmentId)
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' })
    }

    if (!dept.hod) {
      return res.status(400).json({
        success: false,
        message: 'No HOD is currently assigned for this department.'
      })
    }

    const previousHodId = dept.hod
    const hodUser = await User.findById(previousHodId)

    // Demote HOD back to staff and remove from additionalRoles
    await User.findByIdAndUpdate(previousHodId, {
      role: 'staff',
      $pull: { additionalRoles: 'hod' }
    })

    // Clear HOD from department
    await Department.findByIdAndUpdate(req.params.departmentId, {
      hod: null,
      hodAssignedBy: null,
      hodAssignedByRole: null,
      hodAssignedAt: null,
      assignedByPrincipal: null,
      assignedDate: null
    })

    // Audit log
    await HodAssignmentLog.create({
      department: dept._id,
      previousHod: previousHodId,
      newHod: null,
      action: 'removed',
      performedBy: req.user._id,
      performedByRole: req.user.role,
      remarks: remarks || `HOD ${hodUser?.name || previousHodId} removed from ${dept.departmentName}`
    })

    // Send demotion notification
    if (hodUser) {
      try {
        const { getIo } = require('../../socket/chatSocket')
        await sendNotification(getIo(), {
          receiverId: previousHodId,
          receiverRole: 'staff',
          title: 'HOD Role Removed',
          message: `Your HOD role for ${dept.departmentName} has been removed by the ${req.user.role === 'principal' ? 'Principal' : 'Administrator'}.`,
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
      message: `Existing HOD removed successfully. You can now assign a new HOD for ${dept.departmentName}.`,
      removedHod: hodUser
        ? { _id: hodUser._id, name: hodUser.name, email: hodUser.email }
        : { _id: previousHodId }
    })
  } catch (error) {
    console.error('HOD Mgmt removeHod Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET  /api/v1/hod-management/logs
// Access: admin | principal
// ─────────────────────────────────────────────────────────────
exports.getAuditLogs = async (req, res) => {
  try {
    const { departmentId, limit = 50 } = req.query

    const filter = {}
    if (departmentId) filter.department = departmentId

    const logs = await HodAssignmentLog.find(filter)
      .populate('department', 'departmentName departmentCode')
      .populate('previousHod', 'name email')
      .populate('newHod', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    res.status(200).json({ success: true, count: logs.length, data: logs })
  } catch (error) {
    console.error('HOD Mgmt getAuditLogs Error:', error)
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
