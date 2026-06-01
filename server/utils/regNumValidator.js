const { DEPART_CHECKER } = require('./deptChecker')

// Regular entry dept codes (suffix R)
const STUDENT_DEPT_CODES_REGULAR = ['BSR','ITR','CSR','ADR', 'BMR','ECR','EER', 'CER','MER', 'MBAR', 'MCAR']

// Lateral entry dept codes (suffix L)
const STUDENT_DEPT_CODES_LATERAL = ['BSL','ITL','CSL','ADL', 'BML','ECL', 'EEL','CEL','MEL', 'MBAL', 'MCAL']

// All valid dept codes (regular + lateral)
const STUDENT_DEPT_CODES = [...STUDENT_DEPT_CODES_REGULAR, ...STUDENT_DEPT_CODES_LATERAL]

// Fixed valid years: 2023, 2024, 2025
const VALID_YEARS = ['23', '24', '25', '26']

/**
 * Build the student regex with a fixed year range (23 | 24 | 25).
 */
function buildStudentRegex() {
  const yearPattern = VALID_YEARS.join('|')
  const deptPattern = STUDENT_DEPT_CODES.join('|')

  // 8208E  (23|24|25|26)  (CSR|ITR|…)  \d{3}
  return new RegExp(`^8208E(${yearPattern})(${deptPattern})(\\d{3})$`)
}

// Staff: EGSP/EGSPE or HITP/HITPE followed by digits
const STAFF_REGEX = /^(EGSPE?|HITPE?)\d+$/

/**
 * Validate a registration number against the given role.
 *
 * @param {string} regnum - The registration number to validate.
 * @param {'student'|'staff'} role - The user's role.
 * @param {string} [department] - Optional department to cross-validate.
 * @returns {{ valid: boolean, message: string }}
 */
function validateRegNum(regnum, role, department) {
  if (!regnum || typeof regnum !== 'string') {
    return { valid: false, message: 'Registration number is required' }
  }

  const trimmed = regnum.trim().toUpperCase()

  if (role === 'student') {
    const regex = buildStudentRegex()
    const match = trimmed.match(regex)
    
    if (!match) {
      return {
        valid: false,
        message:
          `Invalid student registration number. ` +
          `Format: 8208E[YY][DEPT][3 digits] — ` +
          `Regular e.g. 8208E23BSR001 | Lateral e.g. 8208E23BSL001.`
      }
    }

    // Extract dept code from match (group 2)
    const extractedDeptCode = match[2]

    // Cross-validate with selected department
    if (department) {
      const allowedCodes = DEPART_CHECKER[department]
      if (!allowedCodes) {
        return { valid: false, message: 'Invalid department selected.' }
      }
      if (!allowedCodes.includes(extractedDeptCode)) {
        return { 
          valid: false, 
          message: `Department mismatch: '${extractedDeptCode}' code does not belong to '${department}'.` 
        }
      }
    }

    return { valid: true, message: 'Valid' }
  }

  if (role === 'staff') {
    if (!STAFF_REGEX.test(trimmed)) {
      return {
        valid: false,
        message:
          'Invalid staff registration number. ' +
          'Must start with HITP, HITPE, EGSP or EGSPE followed by digits — e.g. HITP001 or EGSP001.'
      }
    }
    return { valid: true, message: 'Valid' }
  }

  return { valid: false, message: 'Unknown role — cannot validate registration number' }
}

module.exports = { validateRegNum, buildStudentRegex, STAFF_REGEX, STUDENT_DEPT_CODES, STUDENT_DEPT_CODES_REGULAR, STUDENT_DEPT_CODES_LATERAL }
