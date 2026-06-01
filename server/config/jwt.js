const jwt = require('jsonwebtoken')

const generateToken = (userID, role) => {
  return jwt.sign(
    { userID, role }, // include role (VERY IMPORTANT for your project)
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  )
}

module.exports = generateToken