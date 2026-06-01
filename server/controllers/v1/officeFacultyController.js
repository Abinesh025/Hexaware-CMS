const OfficeFaculty = require('../../models/OfficeFaculty')

// desc    Register Faculty Details
// route   POST /api/v1/office/faculty
// access  Private (Office Staff only)
exports.createFaculty = async (req, res) => {
  try {
    const {
      facultyName,
      email,
      phone,
      department,
      designation,
      qualification,
      experience,
      joiningDate,
      employmentStatus
    } = req.body

    if (!facultyName || !email || !phone || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, department, and designation are required'
      })
    }

    const emailExists = await OfficeFaculty.findOne({ email: email.toLowerCase() })
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'A faculty member with this email already exists'
      })
    }

    const faculty = await OfficeFaculty.create({
      facultyName,
      email: email.toLowerCase(),
      phone,
      department,
      designation,
      qualification,
      experience: Number(experience || 0),
      joiningDate,
      employmentStatus: employmentStatus || 'active',
      createdBy: req.user._id
    })

    res.status(201).json({
      success: true,
      message: 'Faculty details registered successfully',
      data: faculty
    })
  } catch (error) {
    console.error('Create Office Faculty Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Get All Faculty Details
// route   GET /api/v1/office/faculty
// access  Private (Office Staff only)
exports.getAllFaculty = async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query
    const query = {}

    if (department) query.department = department

    if (search) {
      query.$or = [
        { facultyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ]
    }

    const skipIndex = (Number(page) - 1) * Number(limit)
    const totalRecords = await OfficeFaculty.countDocuments(query)

    const faculties = await OfficeFaculty.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit))

    res.status(200).json({
      success: true,
      data: faculties,
      pagination: {
        total: totalRecords,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalRecords / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get All Office Faculty Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Get Faculty Details By ID
// route   GET /api/v1/office/faculty/:id
// access  Private (Office Staff only)
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await OfficeFaculty.findById(req.params.id).populate('createdBy', 'name email')
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty details not found'
      })
    }

    res.status(200).json({
      success: true,
      data: faculty
    })
  } catch (error) {
    console.error('Get Office Faculty By ID Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Update Faculty Details
// route   PUT /api/v1/office/faculty/:id
// access  Private (Office Staff only)
exports.updateFaculty = async (req, res) => {
  try {
    const {
      facultyName,
      email,
      phone,
      department,
      designation,
      qualification,
      experience,
      joiningDate,
      employmentStatus
    } = req.body

    const faculty = await OfficeFaculty.findById(req.params.id)
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty details not found'
      })
    }

    if (email && email.toLowerCase() !== faculty.email) {
      const emailExists = await OfficeFaculty.findOne({ email: email.toLowerCase() })
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Another faculty details record already uses this email'
        })
      }
      faculty.email = email.toLowerCase()
    }

    if (facultyName) faculty.facultyName = facultyName
    if (phone) faculty.phone = phone
    if (department) faculty.department = department
    if (designation) faculty.designation = designation
    if (qualification !== undefined) faculty.qualification = qualification
    if (experience !== undefined) faculty.experience = Number(experience)
    if (joiningDate) faculty.joiningDate = joiningDate
    if (employmentStatus) faculty.employmentStatus = employmentStatus

    await faculty.save()

    res.status(200).json({
      success: true,
      message: 'Faculty details updated successfully',
      data: faculty
    })
  } catch (error) {
    console.error('Update Office Faculty Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Delete Faculty Details
// route   DELETE /api/v1/office/faculty/:id
// access  Private (Office Staff only)
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await OfficeFaculty.findByIdAndDelete(req.params.id)
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty details not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Faculty details record deleted successfully'
    })
  } catch (error) {
    console.error('Delete Office Faculty Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}
