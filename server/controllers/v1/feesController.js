const Fees = require('../../models/Fees')
const User = require('../../models/User')

exports.getAllFees = async (req, res) => {
  try {
    const filter = {}
    if (req.query.studentId) {
      const studentUser = await User.findOne({ regnum: req.query.studentId.toUpperCase(), role: 'student' })
      if (studentUser) {
        filter.student = studentUser._id
      } else {
        return res.status(200).json({ success: true, data: [] })
      }
    }

    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus

    const records = await Fees.find(filter)
      .populate('student', 'name email regnum department phone')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, data: records })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.createFeeRecord = async (req, res) => {
  try {
    const { student, totalFee, paidAmount, paymentMode } = req.body

    if (!student || totalFee === undefined) {
      return res.status(400).json({ success: false, message: 'Student and Total Fee are required' })
    }

    // Check if record exists
    let fee = await Fees.findOne({ student })
    if (fee) {
      return res.status(400).json({ success: false, message: 'Fee record already exists for this student. Update it instead.' })
    }

    const receiptNumber = 'REC-' + Date.now().toString().slice(-8)

    fee = await Fees.create({
      student,
      totalFee: Number(totalFee),
      paidAmount: Number(paidAmount || 0),
      paymentMode: paymentMode || 'Cash',
      receiptNumber,
      paymentDate: paidAmount > 0 ? new Date() : null
    })

    res.status(201).json({ success: true, data: fee })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.payFees = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, paymentMode } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' })
    }

    const fee = await Fees.findById(id)
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' })
    }

    if (fee.balanceDue < amount) {
      return res.status(400).json({ success: false, message: `Payment exceeds balance due of ${fee.balanceDue}` })
    }

    fee.paidAmount += Number(amount)
    fee.paymentMode = paymentMode || 'Cash'
    fee.paymentDate = new Date()
    fee.receiptNumber = 'REC-' + Date.now().toString().slice(-8)
    await fee.save()

    res.status(200).json({ success: true, message: 'Payment recorded successfully', data: fee })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.getMyFees = async (req, res) => {
  try {
    const fee = await Fees.findOne({ student: req.user._id }).populate('student', 'name email regnum')
    if (!fee) {
      return res.status(404).json({ success: false, message: 'No fee record found for you' })
    }
    res.status(200).json({ success: true, data: fee })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.getFeeDuesReport = async (req, res) => {
  try {
    const dues = await Fees.find({ balanceDue: { $gt: 0 } })
      .populate('student', 'name email regnum department phone')
      .sort({ balanceDue: -1 })

    res.status(200).json({ success: true, data: dues })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
