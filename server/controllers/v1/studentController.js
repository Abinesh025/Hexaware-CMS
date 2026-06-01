const Student = require('../../models/Student')
const User = require('../../models/User')
const Fees = require('../../models/Fees')
const bcrypt = require('bcryptjs')

exports.getAllStudents = async (req, res) => {
  try {
    const filter = {}
    if (req.query.department) filter.department = req.query.department
    if (req.query.semester) filter.semester = Number(req.query.semester)
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const students = await Student.find(filter).populate('user', '-password').sort({ studentId: 1 })
    res.status(200).json({ success: true, data: students })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('user', '-password').populate('course')
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' })
    }
    res.status(200).json({ success: true, data: student })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.createStudent = async (req, res) => {
  try {
    const { studentId, name, email, phone, parentName, parentPhone, department, course, semester, admissionYear, address, status } = req.body

    if (!studentId || !name || !email || !department || !semester || !admissionYear) {
      return res.status(400).json({ success: false, message: 'Required fields missing' })
    }

    const existsStudent = await Student.findOne({ studentId: studentId.toUpperCase() })
    if (existsStudent) {
      return res.status(400).json({ success: false, message: 'Student ID already registered' })
    }

    const existsEmail = await User.findOne({ email })
    if (existsEmail) {
      return res.status(400).json({ success: false, message: 'Email address already in use' })
    }

    // Create User credentials
    const defaultPassword = studentId.trim().toUpperCase() // set default password to their studentId / Registration number
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      regnum: studentId.trim().toUpperCase(),
      department,
      phone: phone || ''
    })

    const student = await Student.create({
      user: user._id,
      studentId: studentId.trim().toUpperCase(),
      name,
      email,
      phone: phone || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      department,
      course: course || null,
      semester: Number(semester),
      admissionYear: Number(admissionYear),
      address: address || '',
      status: status || 'Active'
    })

    // Automatically create Fees record based on department
    const isComputing = [
      'Computer Science and Engineering',
      'Computer Science and Business Systems',
      'Artificial Intelligence and Data Science',
      'Information Technology'
    ].includes(department);
    const calculatedFee = isComputing ? 50000 : 30000;

    await Fees.create({
      student: user._id,
      totalFee: calculatedFee,
      paidAmount: 0,
      paymentMode: 'Cash',
      receiptNumber: 'REC-' + Date.now().toString().slice(-8),
      paymentDate: null
    });

    res.status(201).json({ success: true, data: student })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.updateStudent = async (req, res) => {
  try {
    const { name, email, phone, parentName, parentPhone, department, course, semester, admissionYear, address, status } = req.body
    const student = await Student.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    const updateStudentData = {}
    const updateUserData = {}

    if (name) {
      updateStudentData.name = name
      updateUserData.name = name
    }

    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: student.user } })
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' })
      }
      updateStudentData.email = email
      updateUserData.email = email
    }

    if (phone !== undefined) {
      updateStudentData.phone = phone
      updateUserData.phone = phone
    }
    if (parentName !== undefined) updateStudentData.parentName = parentName
    if (parentPhone !== undefined) updateStudentData.parentPhone = parentPhone
    if (department) {
      updateStudentData.department = department
      updateUserData.department = department
    }
    if (course !== undefined) updateStudentData.course = course || null
    if (semester) updateStudentData.semester = Number(semester)
    if (admissionYear) updateStudentData.admissionYear = Number(admissionYear)
    if (address !== undefined) updateStudentData.address = address
    if (status) {
      updateStudentData.status = status
      updateUserData.isActive = status === 'Active'
    }

    // Update Student document
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, { $set: updateStudentData }, { new: true })
    // Update User document
    await User.findByIdAndUpdate(student.user, { $set: updateUserData })

    res.status(200).json({ success: true, data: updatedStudent })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    // Delete student record
    await Student.findByIdAndDelete(req.params.id)
    // Delete corresponding user credentials
    await User.findByIdAndDelete(student.user)

    res.status(200).json({ success: true, message: 'Student record and login deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
