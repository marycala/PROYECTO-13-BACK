const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Music', 'Sports', 'Tech', 'Art', 'Food', 'Business', 'Education', 'Health', 'Gaming',"Travel", "Fashion", 'Other'], 
      required: true 
    },
    img: { type: String, required: false },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'attendees'
      }
    ]
  },
  {
    timestamps: true,
    collection: 'events'
  }
)

const Event = mongoose.model('events', eventSchema, 'events')
module.exports = Event
