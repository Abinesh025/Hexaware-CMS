const StudentAdmission = require('../../models/StudentAdmission')

// desc    Create Student Admission
// route   POST /api/v1/office/admissions
// access  Private (Office Staff only)
exports.createAdmission = async (req, res) => {
  try {
    const {
      studentName,
      email,
      phone,
      dateOfBirth,
      gender,
      department,
      course,
      semester,
      admissionYear,
      parentName,
      parentPhone,
      address,
      admissionStatus
    } = req.body

    if (!studentName || !email || !phone || !department || !course || !admissionYear) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, department, course, and admission year are required'
      })
    }

    const emailExists = await StudentAdmission.findOne({ email: email.toLowerCase() })
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'A student admission record with this email already exists'
      })
    }

    const admission = await StudentAdmission.create({
      studentName,
      email: email.toLowerCase(),
      phone,
      dateOfBirth,
      gender,
      department,
      course,
      semester: Number(semester || 1),
      admissionYear: Number(admissionYear),
      parentName,
      parentPhone,
      address,
      admissionStatus: admissionStatus || 'pending',
      createdBy: req.user._id
    })

    res.status(201).json({
      success: true,
      message: 'Student admission record created successfully',
      data: admission
    })
  } catch (error) {
    console.error('Create Admission Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Get All Student Admissions
// route   GET /api/v1/office/admissions
// access  Private (Office Staff only)
exports.getAllAdmissions = async (req, res) => {
  try {
    const { search, department, admissionStatus, page = 1, limit = 10 } = req.query
    const query = {}

    if (department) query.department = department
    if (admissionStatus) query.admissionStatus = admissionStatus

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    const skipIndex = (Number(page) - 1) * Number(limit)
    const totalRecords = await StudentAdmission.countDocuments(query)

    const admissions = await StudentAdmission.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit))

    res.status(200).json({
      success: true,
      data: admissions,
      pagination: {
        total: totalRecords,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalRecords / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get All Admissions Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Get Student Admission By ID
// route   GET /api/v1/office/admissions/:id
// access  Private (Office Staff only)
exports.getAdmissionById = async (req, res) => {
  try {
    const admission = await StudentAdmission.findById(req.params.id).populate('createdBy', 'name email')
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission record not found'
      })
    }

    res.status(200).json({
      success: true,
      data: admission
    })
  } catch (error) {
    console.error('Get Admission By ID Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Update Student Admission
// route   PUT /api/v1/office/admissions/:id
// access  Private (Office Staff only)
exports.updateAdmission = async (req, res) => {
  try {
    const {
      studentName,
      email,
      phone,
      dateOfBirth,
      gender,
      department,
      course,
      semester,
      admissionYear,
      parentName,
      parentPhone,
      address,
      admissionStatus
    } = req.body

    const admission = await StudentAdmission.findById(req.params.id)
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission record not found'
      })
    }

    if (email && email.toLowerCase() !== admission.email) {
      const emailExists = await StudentAdmission.findOne({ email: email.toLowerCase() })
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Another student record already uses this email'
        })
      }
      admission.email = email.toLowerCase()
    }

    if (studentName) admission.studentName = studentName
    if (phone) admission.phone = phone
    if (dateOfBirth !== undefined) admission.dateOfBirth = dateOfBirth
    if (gender) admission.gender = gender
    if (department) admission.department = department
    if (course) admission.course = course
    if (semester !== undefined) admission.semester = Number(semester)
    if (admissionYear !== undefined) admission.admissionYear = Number(admissionYear)
    if (parentName !== undefined) admission.parentName = parentName
    if (parentPhone !== undefined) admission.parentPhone = parentPhone
    if (address !== undefined) admission.address = address
    if (admissionStatus) admission.admissionStatus = admissionStatus

    await admission.save()

    res.status(200).json({
      success: true,
      message: 'Student admission record updated successfully',
      data: admission
    })
  } catch (error) {
    console.error('Update Admission Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Delete Student Admission
// route   DELETE /api/v1/office/admissions/:id
// access  Private (Office Staff only)
exports.deleteAdmission = async (req, res) => {
  try {
    const admission = await StudentAdmission.findByIdAndDelete(req.params.id)
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission record not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Student admission record deleted successfully'
    })
  } catch (error) {
    console.error('Delete Admission Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}
