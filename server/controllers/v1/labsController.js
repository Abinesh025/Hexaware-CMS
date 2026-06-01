const LabInfrastructure = require('../../models/LabInfrastructure')

exports.getAllLabs = async (req, res) => {
  try {
    const filter = {}
    if (req.query.department) filter.department = req.query.department
    if (req.query.condition) filter.condition = req.query.condition

    const labs = await LabInfrastructure.find(filter).sort({ labName: 1 })
    res.status(200).json({ success: true, data: labs })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.createLabEquipment = async (req, res) => {
  try {
    const { labName, department, equipmentName, quantity, condition, purchaseDate, remarks } = req.body

    if (!labName || !department || !equipmentName || !quantity) {
      return res.status(400).json({ success: false, message: 'Required fields missing' })
    }

    const item = await LabInfrastructure.create({
      labName,
      department,
      equipmentName,
      quantity: Number(quantity),
      condition: condition || 'Working',
      purchaseDate: purchaseDate || null,
      remarks: remarks || ''
    })

    res.status(201).json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.updateLabEquipment = async (req, res) => {
  try {
    const { labName, department, equipmentName, quantity, condition, purchaseDate, remarks } = req.body
    const updateData = {}

    if (labName) updateData.labName = labName
    if (department) updateData.department = department
    if (equipmentName) updateData.equipmentName = equipmentName
    if (quantity) updateData.quantity = Number(quantity)
    if (condition) updateData.condition = condition
    if (purchaseDate) updateData.purchaseDate = purchaseDate
    if (remarks !== undefined) updateData.remarks = remarks

    const item = await LabInfrastructure.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true })
    if (!item) return res.status(404).json({ success: false, message: 'Lab item not found' })

    res.status(200).json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}

exports.deleteLabEquipment = async (req, res) => {
  try {
    const item = await LabInfrastructure.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ success: false, message: 'Lab item not found' })
    res.status(200).json({ success: true, message: 'Lab equipment record deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process your request. Please try again.' })
  }
}
