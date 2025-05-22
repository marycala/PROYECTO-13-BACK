const mongoose = require('mongoose')

const attendeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'events'
    }
  },
  {
    timestamps: true,
    collection: 'attendees'
  }
)

const Attendee = mongoose.model('attendees', attendeeSchema, 'attendees')
module.exports = Attendee
