const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const cookieParser = require('cookie-parser')

// Route files
const authRoutes = require('./routes/authRoutes')
const staffRoutes = require('./routes/staffRoutes')
const studentRoutes = require('./routes/studentRoutes')
const materialRoutes = require('./routes/materialRoutes')
const testRoutes = require('./routes/testRoutes')
const chatRoutes = require('./routes/chatRoutes')
const adminRoutes = require('./routes/adminRoutes')
const notificationRoutes = require('./routes/notificationRoutes')

// v1 Route files
const v1AuthRoutes = require('./routes/v1/authRoutes')
const v1UserRoutes = require('./routes/v1/userRoutes')
const v1DeptRoutes = require('./routes/v1/departmentRoutes')
const v1CourseRoutes = require('./routes/v1/courseRoutes')
const v1StudentRoutes = require('./routes/v1/studentRoutes')
const v1StudentPortalRoutes = require('./routes/v1/studentPortalRoutes')
const v1FacultyRoutes = require('./routes/v1/facultyRoutes')
const v1AttendanceRoutes = require('./routes/v1/attendanceRoutes')
const v1MarksRoutes = require('./routes/v1/marksRoutes')
const v1FeesRoutes = require('./routes/v1/feesRoutes')
const v1SalaryRoutes = require('./routes/v1/salaryRoutes')
const v1LabsRoutes = require('./routes/v1/labsRoutes')
const v1ReportsRoutes = require('./routes/v1/reportsRoutes')
const v1NotificationRoutes = require('./routes/v1/notificationRoutes')
const v1OfficeStaffAuthRoutes = require('./routes/v1/officeStaffAuthRoutes')
const v1OfficeAdmissionsRoutes = require('./routes/v1/officeAdmissionsRoutes')
const v1OfficeFacultyRoutes = require('./routes/v1/officeFacultyRoutes')
const v1OfficeFacultySalaryRoutes = require('./routes/v1/officeFacultySalaryRoutes')
const v1PrincipalRoutes = require('./routes/v1/principalRoutes')
const v1HodRoutes = require('./routes/v1/hodRoutes')
const v1HodManagementRoutes = require('./routes/v1/hodManagementRoutes')

const { swaggerUi, specs } = require('./config/swagger')

const app = express()

// CORS
app.use(
  cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:5000', 'https://127.0.0.1:5000',"https://egs-lms.vercel.app",],
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

// Swagger API Documentation Route
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(specs))

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV || 'development' })
})

// Static Upload Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/materials', materialRoutes)
app.use('/api/tests', testRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)

// v1 API Routes
app.use('/api/v1/auth', v1AuthRoutes)
app.use('/api/v1/users', v1UserRoutes)
app.use('/api/v1/departments', v1DeptRoutes)
app.use('/api/v1/courses', v1CourseRoutes)
app.use('/api/v1/students', v1StudentRoutes)
app.use('/api/v1/student', v1StudentPortalRoutes)
app.use('/api/v1/faculty', v1FacultyRoutes)
app.use('/api/v1/attendance', v1AttendanceRoutes)
app.use('/api/v1/marks', v1MarksRoutes)
app.use('/api/v1/fees', v1FeesRoutes)
app.use('/api/v1/salary', v1SalaryRoutes)
app.use('/api/v1/labs', v1LabsRoutes)
app.use('/api/v1/reports', v1ReportsRoutes)
app.use('/api/v1/notifications', v1NotificationRoutes)
app.use('/api/v1/office-staff', v1OfficeStaffAuthRoutes)
app.use('/api/v1/office/admissions', v1OfficeAdmissionsRoutes)
app.use('/api/v1/office/faculty', v1OfficeFacultyRoutes)
app.use('/api/v1/office/faculty-salary', v1OfficeFacultySalaryRoutes)
app.use('/api/v1/principal', v1PrincipalRoutes)
app.use('/api/v1/hod', v1HodRoutes)
app.use('/api/v1/hod-management', v1HodManagementRoutes)

// Root
app.get('/', (req, res) => {
  res.send('E.G.S Learning Platform API is running...')
})

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Server Error', error: err.message })
})

module.exports = app