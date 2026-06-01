import { DEPART_CHECKER } from './deptChecker'
/**
 * Client-side Registration Number Validator
 * ──────────────────────────────────────────
 * Student : 8208E[YY][DEPT][3 digits]
 *  Valid year range : 23 → current year (dynamic)
 *  Valid dept codes (Regular)  : CSR | ITR | MER | ADR | BSR | BER | EER | ECR | CER
 *  Valid dept codes (Lateral)  : CSL | ITL | MEL | ADL | BSL | BEL | EEL | ECL | CEL
 *  Example (Regular)  : 8208E23BSR001
 *  Example (Lateral)  : 8208E23BSL001
 *
 * Staff :
 *  EGSP<digits>   → e.g. EGSP001
 *  EGSPE<digits>  → e.g. EGSPE001
 */

// Regular entry dept codes (suffix R)
export const STUDENT_DEPT_CODES_REGULAR = ['BSR','ITR','CSR','ADR', 'BMR','ECR','EER', 'CER','MER', 'MBAR', 'MCAR']

// Lateral entry dept codes (suffix L)
export const STUDENT_DEPT_CODES_LATERAL = ['BSL','ITL','CSL','ADL', 'BML','ECL', 'EEL','CEL','MEL', 'MBAL', 'MCAL']

// All valid dept codes (regular + lateral)
export const STUDENT_DEPT_CODES = [...STUDENT_DEPT_CODES_REGULAR, ...STUDENT_DEPT_CODES_LATERAL]

/** Fixed valid years: 2023, 2024, 2025 */
const VALID_YEARS = ['23', '24', '25', '26']

/** Build a fixed student regex that accepts years 23, 24, 25 only */
export function buildStudentRegex() {
  const yearPattern = VALID_YEARS.join('|')
  const deptPattern = STUDENT_DEPT_CODES.join('|')
  return new RegExp(`^8208E(${yearPattern})(${deptPattern})(\\d{3})$`)
}

/** Staff: EGSP/EGSPE or HITP/HITPE followed by digits */
export const STAFF_REGEX = /^(EGSPE?|HITPE?)\d+$/

/**
 * Validate a registration number for the given role.
 *
 * @param {string} regnum
 * @param {'student'|'staff'} role
 * @param {string} [department]
 * @returns {{ valid: boolean, message: string }}
 */
export function validateRegNum(regnum, role, department) {
  if (!regnum || !regnum.trim()) {
    return { valid: false, message: 'Registration number is required' }
  }

  const val = regnum.trim().toUpperCase()

  if (role === 'student') {
    const regex = buildStudentRegex()
    const match = val.match(regex)

    if (!match) {
      return {
        valid: false,
        message:
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
        return { valid: false, message: 'Invalid department selected' }
      }
      if (!allowedCodes.includes(extractedDeptCode)) {
        return { 
          valid: false, 
          message: `Department mismatch: '${extractedDeptCode}' code does not belong to '${department}'.` 
        }
      }
    }

    return { valid: true, message: 'Looks good!' }
  }

  if (role === 'staff') {
    if (!STAFF_REGEX.test(val)) {
      return {
        valid: false,
        message: 'Staff reg number must start with HITP, HITPE, EGSP or EGSPE followed by digits — e.g. HITP001 or EGSP001'
      }
    }
    return { valid: true, message: 'Looks good!' }
  }

  return { valid: false, message: 'Unknown role' }
}

/**
 * Get a placeholder hint for the reg-num field based on role.
 * @param {'student'|'staff'} role
 * @returns {string}
 */
export function regNumPlaceholder(role) {
  if (role === 'student') return '8208E23BSRXXX  or  8208E23BSLXXX'
  if (role === 'staff')   return 'HITPXXX  or  HITPEXXX'
  return 'Registration number'
}
