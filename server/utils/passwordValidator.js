
/**
 * Validate a password based on strict criteria.
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character (@$!%*?&)
 * - Minimum 8 characters
 * * @param {string} password 
 * @returns {{ valid: boolean, message: string }}
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' }
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\-_^()]).{8,}$/

  if (!passwordRegex.test(password)) {
    return { 
      valid: false, 
      message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character' 
    }
  }

  return { valid: true }
}

module.exports = { validatePassword }
