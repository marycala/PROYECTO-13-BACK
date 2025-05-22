const Attendee = require('../api/models/attendees')
const Event = require('../api/models/events')

const confirmedEvent = async (req, res, next) => {
  const { id } = req.params

  try {
    const event = await Event.findById(id)
    if (!event) return res.status(404).json({ message: 'Event not found' })

    const existingAttendee = await Attendee.findOne({
      eventId: id,
      userId: id
    })
    if (existingAttendee) {
      return res
        .status(409)
        .json({ message: 'You have already confirmed this event' })
    }

    next()
  } catch (error) {
    console.error('Error in confirmedEvent middleware:', error)
    return res.status(500).json({ message: 'Server error', error })
  }
}

module.exports = { confirmedEvent }
