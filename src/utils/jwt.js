const jwt = require('jsonwebtoken')

const generateSign = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: '1y' })
}

const verifySign = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY)
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

module.exports = { generateSign, verifySign }
