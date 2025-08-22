const Attendee = require('../models/attendees')
const Event = require('../models/events')
const User = require('../models/users')

const getAttendees = async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const attendees = await Attendee.find({ eventId })
      .populate('userId', 'userName')

    if (!attendees.length) {
      return res.status(404).json({ message: 'No attendees found for this event.' });
    }

    return res.status(200).json(attendees);
  } catch (error) {
    return res.status(500).json({ message: 'Server error while fetching attendees.' });
  }
};

const getAttendancesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const attendances = await Attendee.find({ userId })
    res.status(200).json({ attendances });
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendances" });
  }
};

const registerAttendees = async (req, res, next) => {
  const { userId } = req.body
  const eventId = req.params.eventId

  try {
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const existingAttendee = await Attendee.findOne({ userId, eventId })
    if (existingAttendee) {
      return res
        .status(400)
        .json({ message: 'Attendee already registered for this event' })
    }

    const attendee = new Attendee({
      userId,
      eventId
    })
    await attendee.save()

    await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { attendees: userId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          events: eventId,
          attendees: attendee._id
        }
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: 'Attendee registered successfully', attendee })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'There was a problem, please try again later' })
  }
}

const deleteAttendee = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  try {
    const attendee = await Attendee.findOne({ eventId, userId });
    if (!attendee) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    await Attendee.findByIdAndDelete(attendee._id);

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { attendees: userId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          events: eventId,
          attendees: attendee._id
        }
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Attendance cancelled',
      attendees: updatedEvent.attendees
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error' });
  }
};

module.exports = {
  getAttendees,
  getAttendancesByUser,
  registerAttendees,
  deleteAttendee
}
