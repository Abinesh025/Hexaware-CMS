const crypto = require('crypto');

/**
 * Generate a 6-digit numeric OTP
 * @returns {string} 
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash the OTP using SHA256
 * @param {string} otp 
 * @returns {string} hashedOtp
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

module.exports = { generateOtp, hashOtp };
