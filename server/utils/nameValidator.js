
/**
 * Validate a name based on common criteria.
 * - Minimum 3 characters
 * - Only letters (A-Z, a-z) and spaces
 * * @param {string} name 
 * @returns {{ valid: boolean, message: string }}
 */
function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Name is required' }
  }

  const trimmed = name.trim()
  const nameRegexd = /^[A-Za-z\s]+$/;
  
  if (trimmed.length < 3 || !nameRegexd.test(trimmed)) {
    return { 
      valid: false, 
      message: 'Name must contain at least 3 characters and only contains letters (A-Za-z)' 
    }
  }

  // Check for letters and spaces only
  const nameRegex = /^[A-Za-z\s]+$/
  if (!nameRegex.test(trimmed)) {
    return { 
      valid: false, 
      message: 'Name must contain only letters (A-Za-z)' 
    }
  }

  return { valid: true }
}

module.exports = { validateName }
