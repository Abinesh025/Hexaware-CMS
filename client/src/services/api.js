import axios from 'axios'

// Create Axios instance
// In production: VITE_API_URL is '' (empty) → all /api/... paths are relative to same domain
// In dev: VITE_API_URL is not set → baseURL is '' → Vite dev proxy handles /api → localhost:5000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 0, // No timeout — needed for large video/file uploads
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  const adminToken = sessionStorage.getItem('adminToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (adminToken) {
    config.headers['x-admin-token'] = adminToken
  }

  return config
}, error => Promise.reject(error))

// Response interceptor to handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/verify-password')) {
      const url = err.config?.url || ''
      // Don't auto-redirect for HOD management API calls — let the UI handle errors
      if (url.includes('/hod-management')) {
        return Promise.reject(err)
      }
      if (window.location.pathname.startsWith('/admin') || sessionStorage.getItem('adminToken')) {
        sessionStorage.removeItem('adminToken')
        window.location.href = '/admin-login'
      } else if (window.location.pathname.startsWith('/principal')) {
        localStorage.removeItem('token')
        window.location.href = '/principal-login'
      } else if (window.location.pathname.startsWith('/student')) {
        localStorage.removeItem('token')
        window.location.href = '/student-login'
      } else {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// ------------------- SERVICES -------------------

// Auth
export const authService = {
  login: (data) => api.post('/api/v1/auth/login', data),
  register: (data) => api.post('/api/v1/auth/register', data),
  me: () => api.get('/api/v1/auth/me'),
  updateProfile: (formData) => api.put('/api/v1/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Staff (Preserved)
export const staffService = {
  getAll: () => api.get('/api/staff'),
  getById: (id) => api.get(`/api/staff/${id}`),
  update: (id, data) => api.put(`/api/staff/${id}`, data),
  delete: (id) => api.delete(`/api/staff/delete/${id}`),
  getStudents: () => api.get('/api/staff/students'),
}

// Student portal (v1 + legacy test detail)
export const studentService = {
  getProfile: () => api.get('/api/student/profile'),
  updateProfile: (data) => api.put('/api/student/profile', data),
  getMaterials: (params) => api.get('/api/v1/student/materials', { params }),
  getTests: (params) => api.get('/api/v1/student/tests', { params }),
  getTest: (id) => api.get(`/api/student/tests/${id}`),
  getResults: () => api.get('/api/v1/student/results'),
  getAttendance: () => api.get('/api/v1/student/attendance'),
  getMarks: () => api.get('/api/v1/student/marks'),
  getFees: () => api.get('/api/v1/student/fees'),
  getNotifications: () => api.get('/api/v1/student/notifications'),
}

// Materials (Preserved)
export const materialService = {
  getAll: (params) => api.get('/api/materials', { params }),
  getById: (id) => api.get(`/api/materials/${id}`),
  upload: (formData, config = {}) => api.post('/api/materials/upload', formData, config),
  update: (id, data) => api.put(`/api/materials/${id}`, data),
  delete: (id) => api.delete(`/api/materials/${id}`),
}

// Tests (Preserved)
export const testService = {
  getAll: () => api.get('/api/tests/all'),
  getById: (id) => api.get(`/api/tests/${id}`),
  create: (data) => api.post('/api/tests', data),
  update: (id, data) => api.put(`/api/tests/${id}`, data),
  delete: (id) => api.delete(`/api/staff/tests/${id}`),
  submit: (id, answers) => api.post(`/api/tests/${id}/submit`, { answers }),
  getResults: (id) => api.get(`/api/staff/results/${id}`),
}

// Chat (Preserved)
export const chatService = {
  getMessages: (roomId) => api.get(`/api/chat/room/${roomId}`),
  getRooms: () => api.get('/api/chat/rooms'),
  uploadVoice: (formData) => api.post('/api/chat/upload-voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// v1 Departments
export const departmentService = {
  getAll: (params) => api.get('/api/v1/departments', { params }),
  getById: (id) => api.get(`/api/v1/departments/${id}`),
  create: (data) => api.post('/api/v1/departments', data),
  update: (id, data) => api.put(`/api/v1/departments/${id}`, data),
  delete: (id) => api.delete(`/api/v1/departments/${id}`),
}

// v1 Courses
export const courseService = {
  getAll: (params) => api.get('/api/v1/courses', { params }),
  getById: (id) => api.get(`/api/v1/courses/${id}`),
  create: (data) => api.post('/api/v1/courses', data),
  update: (id, data) => api.put(`/api/v1/courses/${id}`, data),
  delete: (id) => api.delete(`/api/v1/courses/${id}`),
}

// v1 Students (Admission)
export const studentAdmissionService = {
  getAll: (params) => api.get('/api/v1/students', { params }),
  getById: (id) => api.get(`/api/v1/students/${id}`),
  create: (data) => api.post('/api/v1/students', data),
  update: (id, data) => api.put(`/api/v1/students/${id}`, data),
  delete: (id) => api.delete(`/api/v1/students/${id}`),
}

// v1 Faculty
export const facultyService = {
  getAll: (params) => api.get('/api/v1/faculty', { params }),
  getById: (id) => api.get(`/api/v1/faculty/${id}`),
  create: (data) => api.post('/api/v1/faculty', data),
  update: (id, data) => api.put(`/api/v1/faculty/${id}`, data),
  delete: (id) => api.delete(`/api/v1/faculty/${id}`),
}

// v1 Attendance
export const attendanceService = {
  save: (data) => api.post('/api/v1/attendance', data),
  getAll: (params) => api.get('/api/v1/attendance', { params }),
  getStats: (studentId) => api.get(`/api/v1/attendance/stats${studentId ? `/${studentId}` : ''}`),
}

// v1 Marks
export const marksService = {
  save: (data) => api.post('/api/v1/marks', data),
  getAll: (params) => api.get('/api/v1/marks', { params }),
  approve: (id) => api.patch(`/api/v1/marks/approve/${id}`),
  getMyMarks: () => api.get('/api/v1/marks/my'),
}

// v1 Fees
export const feesService = {
  getAll: (params) => api.get('/api/v1/fees', { params }),
  create: (data) => api.post('/api/v1/fees', data),
  pay: (id, amount, paymentMode) => api.put(`/api/v1/fees/pay/${id}`, { amount, paymentMode }),
  getMyFees: () => api.get('/api/v1/fees/my'),
  getDues: () => api.get('/api/v1/fees/dues'),
}

// v1 Salary
export const salaryService = {
  getAll: () => api.get('/api/v1/salary'),
  update: (id, salary) => api.put(`/api/v1/salary/${id}`, { salary }),
  getMySalary: () => api.get('/api/v1/salary/my'),
}

// v1 Labs
export const labsService = {
  getAll: (params) => api.get('/api/v1/labs', { params }),
  create: (data) => api.post('/api/v1/labs', data),
  update: (id, data) => api.put(`/api/v1/labs/${id}`, data),
  delete: (id) => api.delete(`/api/v1/labs/${id}`),
}

// v1 Reports
export const reportsService = {
  getSummary: () => api.get('/api/v1/reports/summary'),
  getPerformance: () => api.get('/api/v1/reports/performance'),
  generateReport: (studentId) => api.post('/api/v1/reports/generate', { studentId }),
  getStudentReports: (studentId) => api.get(`/api/v1/reports/student${studentId ? `/${studentId}` : ''}`),
}

// v1 Office Staff Auth
export const officeStaffService = {
  login: (data) => api.post('/api/v1/office-staff/login', data),
  logout: () => api.post('/api/v1/office-staff/logout'),
  profile: () => api.get('/api/v1/office-staff/profile'),
}

// v1 Office Admissions
export const officeAdmissionsService = {
  getAll: (params) => api.get('/api/v1/office/admissions', { params }),
  getById: (id) => api.get(`/api/v1/office/admissions/${id}`),
  create: (data) => api.post('/api/v1/office/admissions', data),
  update: (id, data) => api.put(`/api/v1/office/admissions/${id}`, data),
  delete: (id) => api.delete(`/api/v1/office/admissions/${id}`),
}

// v1 Office Faculty
export const officeFacultyService = {
  getAll: (params) => api.get('/api/v1/office/faculty', { params }),
  getById: (id) => api.get(`/api/v1/office/faculty/${id}`),
  create: (data) => api.post('/api/v1/office/faculty', data),
  update: (id, data) => api.put(`/api/v1/office/faculty/${id}`, data),
  delete: (id) => api.delete(`/api/v1/office/faculty/${id}`),
}

// v1 Office Faculty Salary
export const officeSalaryService = {
  getAll: (params) => api.get('/api/v1/office/faculty-salary', { params }),
  getById: (id) => api.get(`/api/v1/office/faculty-salary/${id}`),
  create: (data) => api.post('/api/v1/office/faculty-salary', data),
  update: (id, data) => api.put(`/api/v1/office/faculty-salary/${id}`, data),
  delete: (id) => api.delete(`/api/v1/office/faculty-salary/${id}`),
}

// v1 Principal
export const principalService = {
  login: (data) => api.post('/api/v1/principal/login', data),
  getDashboard: () => api.get('/api/v1/principal/dashboard'),
  getDepartments: () => api.get('/api/v1/principal/departments'),
  getDepartmentStaff: (deptId) => api.get(`/api/v1/principal/departments/${deptId}/staff`),
  assignHod: (deptId, staffId) => api.put(`/api/v1/principal/departments/${deptId}/assign-hod`, { staffId }),
  removeHod: (deptId) => api.delete(`/api/v1/principal/departments/${deptId}/remove-hod`),
}

// v1 HOD Coordinator Management
export const hodService = {
  getCoordinators: () => api.get('/api/v1/hod/coordinators'),
  getDeptStaff: () => api.get('/api/v1/hod/staff'),
  assignCoordinator: (coordinatorType, staffId) => api.put('/api/v1/hod/coordinators', { coordinatorType, staffId }),
  removeCoordinator: (type) => api.delete(`/api/v1/hod/coordinators/${type}`),
}

// v1 Shared HOD Assignment Management (admin + principal)
export const hodManagementService = {
  getDepartments: () => api.get('/api/v1/hod-management/departments'),
  getDepartmentStaff: (deptId) => api.get(`/api/v1/hod-management/departments/${deptId}/staff`),
  getStaffByDeptQuery: (deptId) => api.get('/api/v1/hod-management/staff', { params: { departmentId: deptId } }),
  assignHod: (deptId, staffId, remarks) => api.post(`/api/v1/hod-management/departments/${deptId}/assign-hod`, { staffId, remarks }),
  removeHod: (deptId, remarks) => api.delete(`/api/v1/hod-management/departments/${deptId}/remove-hod`, { data: { remarks } }),
  getAuditLogs: (params) => api.get('/api/v1/hod-management/logs', { params }),
}
