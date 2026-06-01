require('dotenv').config()
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../app')
const User = require('../models/User')

describe('protectAny Authentication Middleware', () => {
  let adminToken
  let studentToken
  let testStudent

  beforeAll(async () => {
    // Connect to test DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-test')
    }

    // Generate valid admin token
    adminToken = jwt.sign(
      { type: 'admin-access' },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    )

    // Create a test student and generate a valid Bearer token
    testStudent = await User.create({
      name: 'ProtectAny Test Student',
      email: 'protectanytest@example.com',
      password: 'Password@123',
      role: 'student',
      regnum: '8208E23CSR999',
      department: 'Computer Science and Engineering'
    })

    studentToken = jwt.sign(
      { userID: testStudent._id },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    )
  })

  afterAll(async () => {
    // Clean up
    await User.deleteMany({ email: 'protectanytest@example.com' })
    await mongoose.connection.close()
  })

  it('should return 401 Unauthorized when no token is provided', async () => {
    const res = await request(app).get('/api/v1/departments')
    expect(res.status).toBe(401)
  })

  it('should return 401 Unauthorized when an invalid token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/departments')
      .set('Authorization', 'Bearer invalidtokenhere')
    expect(res.status).toBe(401)
  })

  it('should authorize the request and return 200/success when a valid x-admin-token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/departments')
      .set('x-admin-token', adminToken)

    // Even if there are no departments in the DB, it should successfully pass auth and return 200 with an empty list or success status
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
  })

  it('should authorize the request when a valid student Bearer token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/departments')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).not.toBe(401)
  })
})
