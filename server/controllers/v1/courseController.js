const Course = require('../../models/Course')

exports.getAllCourses = async (req, res) => {
  try {
    const filter = {}
    if (req.query.department) filter.department = req.query.department
    if (req.query.semester) filter.semester = Number(req.query.semester)

    const courses = await Course.find(filter).populate('facultyAssigned', 'name email').sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: courses })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('facultyAssigned', 'name email')
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    res.status(200).json({ success: true, data: course })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseCode, department, semester, credits, facultyAssigned, description } = req.body

    if (!courseName || !courseCode || !department || !semester || !credits) {
      return res.status(400).json({ success: false, message: 'Required fields missing' })
    }

    const codeExists = await Course.findOne({ courseCode: courseCode.toUpperCase() })
    if (codeExists) {
      return res.status(400).json({ success: false, message: 'Course code already exists' })
    }

    const course = await Course.create({
      courseName,
      courseCode: courseCode.toUpperCase(),
      department,
      semester: Number(semester),
      credits: Number(credits),
      facultyAssigned: facultyAssigned || null,
      description: description || ''
    })

    res.status(201).json({ success: true, data: course })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.updateCourse = async (req, res) => {
  try {
    const { courseName, courseCode, department, semester, credits, facultyAssigned, description } = req.body
    const updateData = {}

    if (courseName) updateData.courseName = courseName
    if (courseCode) {
      const exists = await Course.findOne({ courseCode: courseCode.toUpperCase(), _id: { $ne: req.params.id } })
      if (exists) return res.status(400).json({ success: false, message: 'Course code already in use' })
      updateData.courseCode = courseCode.toUpperCase()
    }
    if (department) updateData.department = department
    if (semester) updateData.semester = Number(semester)
    if (credits) updateData.credits = Number(credits)
    if (description !== undefined) updateData.description = description
    if (facultyAssigned !== undefined) updateData.facultyAssigned = facultyAssigned || null

    const course = await Course.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true })
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

    res.status(200).json({ success: true, data: course })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
    res.status(200).json({ success: true, message: 'Course deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
