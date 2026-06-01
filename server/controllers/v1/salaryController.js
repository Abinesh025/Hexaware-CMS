const Faculty = require('../../models/Faculty')

exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Faculty.find()
      .populate('user', 'name email regnum role')
      .select('facultyId name designation department salary joiningDate')
      .sort({ salary: -1 })

    res.status(200).json({ success: true, data: salaries })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.updateSalary = async (req, res) => {
  try {
    const { salary } = req.body
    if (salary === undefined || salary < 0) {
      return res.status(400).json({ success: false, message: 'Valid salary amount is required' })
    }

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { $set: { salary: Number(salary) } },
      { new: true }
    ).populate('user', '-password')

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty record not found' })
    }

    res.status(200).json({ success: true, message: 'Salary updated successfully', data: faculty })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.getMySalary = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user._id })
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' })
    }
    res.status(200).json({
      success: true,
      data: {
        facultyId: faculty.facultyId,
        name: faculty.name,
        designation: faculty.designation,
        department: faculty.department,
        salary: faculty.salary,
        joiningDate: faculty.joiningDate
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
