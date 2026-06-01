const FacultySalary = require('../../models/FacultySalary')
const User = require('../../models/User')

// desc    Record Faculty Salary Details
// route   POST /api/v1/office/faculty-salary
// access  Private (Office Staff only)
exports.createSalary = async (req, res) => {
  try {
    const {
      facultyId,
      basicSalary,
      allowances,
      deductions,
      salaryMonth,
      paymentStatus,
      paymentDate,
      paymentMode
    } = req.body

    if (!facultyId || basicSalary === undefined || !salaryMonth || !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID, basic salary, salary month, and payment status are required'
      })
    }

    // Verify staff user exists
    const facultyExists = await User.findById(facultyId)
    if (!facultyExists) {
      return res.status(404).json({
        success: false,
        message: 'Assigned staff member details not found'
      })
    }

    const salary = await FacultySalary.create({
      facultyId,
      basicSalary: Number(basicSalary),
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      salaryMonth,
      paymentStatus,
      paymentDate: paymentStatus === 'paid' ? (paymentDate || new Date()) : null,
      paymentMode: paymentStatus === 'paid' ? paymentMode : null,
      createdBy: req.user._id
    })

    // Populate and send
    const populated = await FacultySalary.findById(salary._id)
      .populate('facultyId', 'name email department role')
      .populate('createdBy', 'name email')

    res.status(201).json({
      success: true,
      message: 'Faculty salary record created successfully',
      data: populated
    })
  } catch (error) {
    console.error('Create Salary Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Get All Salary Records
// route   GET /api/v1/office/faculty-salary
// access  Private (Office Staff only)
exports.getAllSalaries = async (req, res) => {
  try {
    const { search, paymentStatus, page = 1, limit = 10 } = req.query
    const query = {}

    if (paymentStatus) query.paymentStatus = paymentStatus

    // If search is provided, we can look up matched staff first
    if (search) {
      const matchedStaff = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ]
      }).select('_id')
      
      const ids = matchedStaff.map(s => s._id)
      query.facultyId = { $in: ids }
    }

    const skipIndex = (Number(page) - 1) * Number(limit)
    const totalRecords = await FacultySalary.countDocuments(query)

    const salaries = await FacultySalary.find(query)
      .populate('facultyId', 'name email department role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit))

    res.status(200).json({
      success: true,
      data: salaries,
      pagination: {
        total: totalRecords,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalRecords / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get All Salaries Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Get Salary Details By ID
// route   GET /api/v1/office/faculty-salary/:id
// access  Private (Office Staff only)
exports.getSalaryById = async (req, res) => {
  try {
    const salary = await FacultySalary.findById(req.params.id)
      .populate('facultyId', 'name email department role')
      .populate('createdBy', 'name email')

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      })
    }

    res.status(200).json({
      success: true,
      data: salary
    })
  } catch (error) {
    console.error('Get Salary By ID Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Update Salary Details
// route   PUT /api/v1/office/faculty-salary/:id
// access  Private (Office Staff only)
exports.updateSalary = async (req, res) => {
  try {
    const {
      basicSalary,
      allowances,
      deductions,
      salaryMonth,
      paymentStatus,
      paymentDate,
      paymentMode
    } = req.body

    const salary = await FacultySalary.findById(req.params.id)
    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      })
    }

    if (basicSalary !== undefined) salary.basicSalary = Number(basicSalary)
    if (allowances !== undefined) salary.allowances = Number(allowances)
    if (deductions !== undefined) salary.deductions = Number(deductions)
    if (salaryMonth) salary.salaryMonth = salaryMonth
    if (paymentStatus) {
      salary.paymentStatus = paymentStatus
      if (paymentStatus === 'paid') {
        salary.paymentDate = paymentDate || new Date()
        salary.paymentMode = paymentMode || 'bank'
      } else {
        salary.paymentDate = null
        salary.paymentMode = null
      }
    }

    await salary.save()

    const populated = await FacultySalary.findById(salary._id)
      .populate('facultyId', 'name email department role')
      .populate('createdBy', 'name email')

    res.status(200).json({
      success: true,
      message: 'Faculty salary record updated successfully',
      data: populated
    })
  } catch (error) {
    console.error('Update Salary Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}

// desc    Delete Salary Record
// route   DELETE /api/v1/office/faculty-salary/:id
// access  Private (Office Staff only)
exports.deleteSalary = async (req, res) => {
  try {
    const salary = await FacultySalary.findByIdAndDelete(req.params.id)
    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Faculty salary record deleted successfully'
    })
  } catch (error) {
    console.error('Delete Salary Error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please try again.'
    })
  }
}
