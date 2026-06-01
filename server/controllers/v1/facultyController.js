const Faculty = require('../../models/Faculty')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')

exports.getAllFaculty = async (req, res) => {
  try {
    const filter = {}
    if (req.query.department) filter.department = req.query.department
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { facultyId: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const faculties = await Faculty.find(filter).populate('user', '-password').sort({ facultyId: 1 })
    res.status(200).json({ success: true, data: faculties })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate('user', '-password')
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' })
    }
    res.status(200).json({ success: true, data: faculty })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.createFaculty = async (req, res) => {
  try {
    const { facultyId, name, email, phone, department, designation, salary, joiningDate } = req.body

    if (!facultyId || !name || !email || !department || !designation || salary === undefined) {
      return res.status(400).json({ success: false, message: 'Required fields missing' })
    }

    const existsFaculty = await Faculty.findOne({ facultyId: facultyId.toUpperCase() })
    if (existsFaculty) {
      return res.status(400).json({ success: false, message: 'Faculty ID already registered' })
    }

    const existsEmail = await User.findOne({ email })
    if (existsEmail) {
      return res.status(400).json({ success: false, message: 'Email address already in use' })
    }

    // Determine role based on designation
    let role = 'staff'
    if (designation.toLowerCase().includes('hod') || designation.toLowerCase().includes('head of department')) {
      role = 'hod'
    }

    const defaultPassword = facultyId.trim().toUpperCase()
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      regnum: facultyId.trim().toUpperCase(),
      phone: phone || ''
    })

    const faculty = await Faculty.create({
      user: user._id,
      facultyId: facultyId.trim().toUpperCase(),
      name,
      email,
      phone: phone || '',
      department,
      designation,
      salary: Number(salary),
      joiningDate: joiningDate || Date.now()
    })

    res.status(201).json({ success: true, data: faculty })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.updateFaculty = async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, joiningDate } = req.body
    const faculty = await Faculty.findById(req.params.id)
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' })
    }

    const updateFacultyData = {}
    const updateUserData = {}

    if (name) {
      updateFacultyData.name = name
      updateUserData.name = name
    }

    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: faculty.user } })
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' })
      }
      updateFacultyData.email = email
      updateUserData.email = email
    }

    if (phone !== undefined) {
      updateFacultyData.phone = phone
      updateUserData.phone = phone
    }
    if (department) {
      updateFacultyData.department = department
      updateUserData.department = department
    }
    if (designation) {
      updateFacultyData.designation = designation
      if (designation.toLowerCase().includes('hod') || designation.toLowerCase().includes('head of department')) {
        updateUserData.role = 'hod'
      } else {
        updateUserData.role = 'staff'
      }
    }
    if (salary !== undefined) updateFacultyData.salary = Number(salary)
    if (joiningDate) updateFacultyData.joiningDate = joiningDate

    const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, { $set: updateFacultyData }, { new: true })
    await User.findByIdAndUpdate(faculty.user, { $set: updateUserData })

    res.status(200).json({ success: true, data: updatedFaculty })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' })
    }

    await Faculty.findByIdAndDelete(req.params.id)
    await User.findByIdAndDelete(faculty.user)

    res.status(200).json({ success: true, message: 'Faculty record and login deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
