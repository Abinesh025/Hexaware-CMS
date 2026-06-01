exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {

    // Check if user exists
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    // Check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role (${req.user.role}) not allowed`
      })
    }

    next()
  }
}