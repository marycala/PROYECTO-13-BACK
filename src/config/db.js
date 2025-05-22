const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)
    console.log('Connect to DB✅')
  } catch (error) {
    console.log('Not connected to DB💥')
  }
}

module.exports = { connectDB }
