const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const OfficeStaff = require('../models/OfficeStaff')
const Principal = require('../models/Principal')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    
    // Seed default Office Staff if it doesn't exist
    const officeExists = await OfficeStaff.findOne({ email: 'office@hit.edu.in' })
    if (!officeExists) {
      const hashedPassword = await bcrypt.hash('hitspec@2026', 10)
      await OfficeStaff.create({
        name: 'Default Office Staff',
        email: 'office@hit.edu.in',
        password: hashedPassword,
        role: 'office_staff',
        status: 'active'
      })
      console.log('✅ Default Office Staff seeded successfully!')
    }

    // Seed default Principal if it doesn't exist
    const principalEmail = process.env.PRINCIPAL_EMAIL || 'principal@college.edu'
    const principalPassword = process.env.PRINCIPAL_PASSWORD || 'hitspec@2026'
    const principalExists = await Principal.findOne({ email: principalEmail })
    if (!principalExists) {
      const hashedPrincipalPassword = await bcrypt.hash(principalPassword, 10)
      await Principal.create({
        name: 'College Principal',
        email: principalEmail,
        password: hashedPrincipalPassword,
        role: 'principal',
        status: 'active'
      })
      console.log(`✅ Default Principal account seeded → ${principalEmail}`)
    }

    // Seed / ensure all departments exist (upsert by departmentCode)
    const Department = require('../models/Department')
    const allDepts = [
      { departmentName: 'Computer Science and Engineering',          departmentCode: 'CSE',   description: 'Department of Computer Science and Engineering' },
      { departmentName: 'Electronics and Communication Engineering', departmentCode: 'ECE',   description: 'Department of Electronics and Communication Engineering' },
      { departmentName: 'Mechanical Engineering',                    departmentCode: 'MECH',  description: 'Department of Mechanical Engineering' },
      { departmentName: 'Civil Engineering',                         departmentCode: 'CIVIL', description: 'Department of Civil Engineering' },
      { departmentName: 'Electrical and Electronics Engineering',    departmentCode: 'EEE',   description: 'Department of Electrical and Electronics Engineering' },
      { departmentName: 'Information Technology',                    departmentCode: 'IT',    description: 'Department of Information Technology' },
      { departmentName: 'Artificial Intelligence and Data Science',  departmentCode: 'AIDS',  description: 'Department of Artificial Intelligence and Data Science' },
      { departmentName: 'Computer Science and Business Systems',     departmentCode: 'CSBS',  description: 'Department of Computer Science and Business Systems' },
    ]
    let newDeptCount = 0
    for (const dept of allDepts) {
      const exists = await Department.findOne({ departmentCode: dept.departmentCode })
      if (!exists) {
        await Department.create(dept)
        newDeptCount++
      }
    }
    if (newDeptCount > 0) {
      console.log(`✅ ${newDeptCount} new department(s) added successfully!`)
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB