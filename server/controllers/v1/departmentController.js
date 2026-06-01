const Department = require('../../models/Department')
const User = require('../../models/User')

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('hod', 'name email').sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: departments })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('hod', 'name email')
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' })
    }
    res.status(200).json({ success: true, data: department })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.createDepartment = async (req, res) => {
  try {
    const { departmentName, departmentCode, hod, description } = req.body

    if (!departmentName || !departmentCode) {
      return res.status(400).json({ success: false, message: 'Name and Code are required' })
    }

    const nameExists = await Department.findOne({ departmentName })
    if (nameExists) return res.status(400).json({ success: false, message: 'Department name already exists' })

    const codeExists = await Department.findOne({ departmentCode: departmentCode.toUpperCase() })
    if (codeExists) return res.status(400).json({ success: false, message: 'Department code already exists' })

    // If hod is provided, verify HOD role
    if (hod) {
      const user = await User.findById(hod)
      if (!user || (user.role !== 'hod' && user.role !== 'staff' && user.role !== 'admin')) {
        return res.status(400).json({ success: false, message: 'Assigned HOD must be a valid staff/HOD user' })
      }
    }

    const dept = await Department.create({
      departmentName,
      departmentCode: departmentCode.toUpperCase(),
      hod: hod || null,
      description: description || ''
    })

    // If HOD was set, update the user's role to 'hod' and set department
    if (hod) {
      await User.findByIdAndUpdate(hod, { role: 'hod', department: departmentName })
    }

    res.status(201).json({ success: true, data: dept })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.updateDepartment = async (req, res) => {
  try {
    const { departmentName, departmentCode, hod, description } = req.body
    const updateData = {}

    if (departmentName) {
      const exists = await Department.findOne({ departmentName, _id: { $ne: req.params.id } })
      if (exists) return res.status(400).json({ success: false, message: 'Department name already in use' })
      updateData.departmentName = departmentName
    }

    if (departmentCode) {
      const exists = await Department.findOne({ departmentCode: departmentCode.toUpperCase(), _id: { $ne: req.params.id } })
      if (exists) return res.status(400).json({ success: false, message: 'Department code already in use' })
      updateData.departmentCode = departmentCode.toUpperCase()
    }

    if (description !== undefined) updateData.description = description

    if (hod !== undefined) {
      if (hod) {
        const user = await User.findById(hod)
        if (!user) {
          return res.status(400).json({ success: false, message: 'HOD user not found' })
        }
      }
      updateData.hod = hod || null
    }

    const oldDept = await Department.findById(req.params.id)
    if (!oldDept) return res.status(404).json({ success: false, message: 'Department not found' })

    const dept = await Department.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true })

    // Handle HOD promotion/change
    if (hod && hod !== String(oldDept.hod)) {
      await User.findByIdAndUpdate(hod, { role: 'hod', department: dept.departmentName })
      // Downgrade old HOD to staff if they are no longer HOD of any department
      if (oldDept.hod) {
        const otherDepts = await Department.findOne({ hod: oldDept.hod, _id: { $ne: dept._id } })
        if (!otherDepts) {
          await User.findByIdAndUpdate(oldDept.hod, { role: 'staff' })
        }
      }
    }

    res.status(200).json({ success: true, data: dept })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id)
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' })

    if (dept.hod) {
      // Downgrade old HOD
      await User.findByIdAndUpdate(dept.hod, { role: 'staff' })
    }

    await Department.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: 'Department deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
