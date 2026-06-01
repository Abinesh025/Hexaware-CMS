const https = require('https')
const querystring = require('querystring')

/**
 * Sends an SMS to a student phone number.
 * Supports Twilio, Fast2SMS, MSG91 based on env configuration.
 * Falls back to console log mock if credentials are not set.
 * * @param {string} phone - The recipient's phone number
 * @param {string} message - The message content
 * @returns {Promise<{success: boolean, provider: string, response?: any, error?: string}>}
 */
const sendSms = async (phone, message) => {
  const provider = (process.env.SMS_PROVIDER || 'mock').toLowerCase()
  console.log(`[SMS UTILITY] Initiating SMS transfer via provider: ${provider}`)

  if (!phone) {
    return { success: false, provider, error: 'Phone number is required' }
  }

  // Basic sanitization
  const cleanedPhone = phone.trim()

  try {
    let responseData
    switch (provider) {
      case 'twilio':
        responseData = await sendTwilio(cleanedPhone, message)
        break
      case 'fast2sms':
        responseData = await sendFast2Sms(cleanedPhone, message)
        break
      case 'msg91':
        responseData = await sendMsg91(cleanedPhone, message)
        break
      case 'mock':
      default:
        // Mock fallback for local development/testing
        console.log(`\n==================================================`)
        console.log(`[SMS MOCK NOTIFICATION]`)
        console.log(`To: ${cleanedPhone}`)
        console.log(`Message: ${message}`)
        console.log(`==================================================\n`)
        return { success: true, provider: 'mock', response: 'Mock delivery successful' }
    }
    return { success: true, provider, response: responseData }
  } catch (error) {
    console.error(`[SMS UTILITY ERROR] Failed to send SMS via ${provider}:`, error.message)
    return { success: false, provider, error: error.message }
  }
}

// ── TWILIO HTTPS HANDLER ──────────────────────────────────────────────
const sendTwilio = (phone, message) => {
  return new Promise((resolve, reject) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      return reject(new Error('Twilio environment credentials missing (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)'))
    }

    // Format phone to E.164 (+91...)
    let formattedPhone = phone.trim()
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone
      } else {
        formattedPhone = '+' + formattedPhone
      }
    }

    const postData = querystring.stringify({
      To: formattedPhone,
      From: fromNumber,
      Body: message
    })

    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed)
          } else {
            reject(new Error(parsed.message || `Twilio HTTP Error ${res.statusCode}: ${body}`))
          }
        } catch (err) {
          reject(new Error(`Failed to parse Twilio response: ${body}`))
        }
      })
    })

    req.on('error', (e) => reject(e))
    req.write(postData)
    req.end()
  })
}

// ── FAST2SMS HTTPS HANDLER ────────────────────────────────────────────
const sendFast2Sms = (phone, message) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.FAST2SMS_API_KEY
    if (!apiKey) {
      return reject(new Error('Fast2SMS environment credentials missing (FAST2SMS_API_KEY)'))
    }

    // Format phone to 10-digit number for Fast2SMS (Indian mobiles)
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.length === 12 && formattedPhone.startsWith('91')) {
      formattedPhone = formattedPhone.slice(2)
    }

    const postData = JSON.stringify({
      route: 'q',
      message: message,
      language: 'english',
      numbers: formattedPhone
    })

    const options = {
      hostname: 'www.fast2sms.com',
      port: 443,
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'authorization': apiKey
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          // Fast2SMS returns 200 even for failed deliveries, check "return" value
          if (res.statusCode >= 200 && res.statusCode < 300 && parsed.return === true) {
            resolve(parsed)
          } else {
            reject(new Error(parsed.message || `Fast2SMS Error: ${body}`))
          }
        } catch (err) {
          reject(new Error(`Failed to parse Fast2SMS response: ${body}`))
        }
      })
    })

    req.on('error', (e) => reject(e))
    req.write(postData)
    req.end()
  })
}

// ── MSG91 HTTPS HANDLER ───────────────────────────────────────────────
const sendMsg91 = (phone, message) => {
  return new Promise((resolve, reject) => {
    const authKey = process.env.MSG91_AUTH_KEY
    if (!authKey) {
      return reject(new Error('MSG91 environment credentials missing (MSG91_AUTH_KEY)'))
    }

    // Format phone: strip digits and prepend 91 if it's 10 digits
    let formattedPhone = phone.replace(/\D/g, '')
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone
    }

    const postData = JSON.stringify({
      flow_id: process.env.MSG91_FLOW_ID || '',
      sender: process.env.MSG91_SENDER_ID || 'EGSHUB',
      mobiles: formattedPhone,
      sms: [{ message: message, to: [formattedPhone] }]
    })

    const options = {
      hostname: 'api.msg91.com',
      port: 443,
      path: '/api/v5/sms/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'authkey': authKey
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          // MSG91 returns type="success" or similar, check type is not error
          if (res.statusCode >= 200 && res.statusCode < 300 && parsed.type !== 'error') {
            resolve(parsed)
          } else {
            reject(new Error(parsed.message || `MSG91 Error: ${body}`))
          }
        } catch (err) {
          reject(new Error(`Failed to parse MSG91 response: ${body}`))
        }
      })
    })

    req.on('error', (e) => reject(e))
    req.write(postData)
    req.end()
  })
}

module.exports = sendSms
