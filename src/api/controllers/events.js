const { deleteFile } = require('../../utils/deleteFile')
const Event = require('../models/events')
const User = require('../models/users')

const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 })
      .populate({
        path: 'creator',
        select: 'userName'
      })
      .populate({
        path: 'attendees',
        populate: {
          path: 'userId',
          select: 'userName'
        }
      })

    return res.status(200).json(events)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error })
  }
}

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params
    const event = await Event.findById(id)
      .populate({
        path: 'creator',
        select: 'userName'
      })
      .populate({
        path: 'attendees',
        populate: {
          path: 'userId',
          select: 'userName'
        }
      })
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    return res.status(200).json(event)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error })
  }
}

const getEventByTitle = async (req, res, next) => {
  try {
    const { title } = req.params

    if (!title) {
      return res.status(400).json({ message: 'Search term is required' })
    }

    const events = await Event.find({ title: new RegExp(title, 'i') })
      .populate({
        path: 'creator',
        select: 'userName'
      })
      .populate({
        path: 'attendees',
        populate: {
          path: 'userId',
          select: 'userName'
        }
      })

    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found' })
    }

    return res.status(200).json(events)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error })
  }
}

const getEventByDate = async (req, res, next) => {
  try {
    const { date } = req.params
    const event = await Event.find({ date })
      .populate({
        path: 'creator',
        select: 'userName'
      })
      .populate({
        path: 'attendees',
        populate: {
          path: 'userId',
          select: 'userName'
        }
      })
    if (!date) {
      return res.status(400).json({ message: 'Event not found' })
    }
    return res.status(200).json(event)
  } catch (error) {
    return res.status(500).json({ error: 'Server error', error })
  }
}

const createEvent = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const eventDuplicated = await Event.findOne({ title: req.body.title });
    if (eventDuplicated) {
      return res.status(400).json({ message: "This event already exists" });
    }

    const { title, category, date, location, description, price } = req.body;

    const allowedCategories = [
      "Music", "Sports", "Tech", "Art", "Food", "Business", "Education", "Health", "Gaming", "Travel", "Fashion", "Other"
    ];

    if (!category || !allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const eventData = {
      title,
      category,
      date,
      location,
      description,
      price,
      creator: userId,
      img: req.file?.path || req.body.img || null,
    };

    const event = new Event(eventData);
    await event.save();

    const newEvent = await Event.findById(event._id).populate({
      path: "creator",
      select: "userName",
    });

    return res.status(201).json({
      message: "Event created successfully",
      newEvent,
    });
  } catch (error) {
    return res.status(500).json({
      message: "There was a problem, please try again",
      error: error.message,
    });
  }
};

const updateEvent = async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  try {
    const isAdmin = user.roles.includes('admin');
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== user._id.toString() && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this event' });
    }

    if (req.file) {
      deleteFile(event.img);
      req.body.img = req.file.path;
    }

    let updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    ).populate({
      path: 'creator',
      select: 'userName'
    });

    if (!updatedEvent) {
      return res.status(400).json({ message: 'Event update failed' });
    }

    if (isAdmin) {
      updatedEvent = await updatedEvent.populate({
        path: 'attendees',
        select: 'userName'
      });
    } else {
      updatedEvent.attendees = updatedEvent.attendees.length;
    }

    return res.status(200).json({
      message: 'Event updated successfully',
      updatedEvent
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'There was a problem, please try again' });
  }
};

const deleteEvent = async (req, res, next) => {
  const { user } = req
  const { id } = req.params
  try {
    const event = await Event.findById(id)

    if (!event) return res.status(404).json({ message: 'Event not found' })

    if (event.creator.toString() !== user._id.toString() && !user.roles.includes('admin')) {
      return res.status(403).json({ message: 'You are not authorized to delete this event' })
    }

    await Event.findByIdAndDelete(id)

    return res.status(200).json({ message: 'Event deleted successfully' })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'There was a problem, please try again' })
  }
}

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getEventByTitle,
  getEventByDate,
  updateEvent,
  deleteEvent
}
