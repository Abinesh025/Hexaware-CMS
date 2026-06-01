const User = require('../../models/User')
const bcrypt = require('bcryptjs')

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {}
    if (req.query.role) {
      filter.role = req.query.role
    } else if (req.query.roles) {
      filter.role = { $in: req.query.roles.split(',') }
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, regnum, status } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Required fields missing' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ success: false, message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      regnum: regnum ? regnum.trim().toUpperCase() : '',
      status: status || 'active'
    })

    const result = user.toObject()
    delete result.password

    res.status(201).json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, regnum, status, password } = req.body
    const updateData = {}

    if (name) updateData.name = name
    if (email) {
      const exists = await User.findOne({ email, _id: { $ne: req.params.id } })
      if (exists) {
        return res.status(400).json({ success: false, message: 'Email already in use' })
      }
      updateData.email = email
    }
    if (role) updateData.role = role
    if (department !== undefined) updateData.department = department
    if (regnum !== undefined) updateData.regnum = regnum.trim().toUpperCase()
    if (status) updateData.status = status

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
