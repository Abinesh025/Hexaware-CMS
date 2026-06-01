require('dotenv').config()
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const User = require('../models/User')

beforeAll(async () => {
  // Connect to the test DB if MONGO_URI is not set, or let Mongoose connect
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-test')
  }
})

afterAll(async () => {
  // Cleanup test users
  await User.deleteMany({ email: /test.*@example\.com/ })
  await mongoose.connection.close()
})

describe('Authentication API v1', () => {
  const testUser = {
    name: 'Test Student',
    email: 'teststudent@example.com',
    password: 'Password@123',
    confirmPassword: 'Password@123',
    role: 'student',
    regnum: '8208E23CSR001',
    department: 'Computer Science and Engineering'
  }

  it('should successfully register a new student', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe(testUser.email)
  })

  it('should return specific message for duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('User is already registered. Please login to the application.')
  })

  it('should successfully login the registered student', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe(testUser.email)
  })
})
