const jwt = require('jsonwebtoken')

exports.verifyAdminToken = (req, res, next) => {
  const token = req.headers['x-admin-token']

  if (!token) {
    return res.status(401).json({ message: 'Admin access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.type !== 'admin-access') {
      return res.status(401).json({ message: 'Invalid admin token type' })
    }

    // Attach a synthetic admin user to req
    req.user = { _id: '000000000000000000000000', role: 'admin' }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Admin session expired. Please re-enter password.' })
    }
    return res.status(401).json({ message: 'Invalid admin token' })
  }
}
