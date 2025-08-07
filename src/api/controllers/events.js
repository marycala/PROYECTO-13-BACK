const { deleteFile } = require('../../utils/deleteFile')
const Event = require('../models/events')
const User = require('../models/users')

const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      title,
      location,
      minPrice,
      maxPrice,
      minDate,
      maxDate
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    if (location) {
      query.location = location;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minDate || maxDate) {
      query.date = {};
      if (minDate) query.date.$gte = new Date(minDate);
      if (maxDate) query.date.$lte = new Date(maxDate);
    }

    const total = await Event.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({ path: 'creator', select: 'userName' })
      .populate({ path: 'attendees', select: 'userName' });

    res.status(200).json({ events, total, page, totalPages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

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
        select: 'userName',
      });
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
        select: 'userName',
      });

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
        select: 'userName',
      });
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
    const isAdmin = user.rol === 'admin';
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== user._id.toString() && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this event' });
    }

    const updatableFields = ['title', 'category', 'date', 'location', 'description', 'price'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    if (req.files && req.files.img && req.files.img.length > 0) {
      deleteFile(event.img);
      event.img = req.files.img[0].path;
    }    

    await event.save();

    await event.populate({ path: 'creator', select: 'userName' });

    if (isAdmin) {
      await event.populate({ path: 'attendees', select: 'userName' });
    } else {
      event.attendees = event.attendees.length;
    }

    return res.status(200).json({
      message: 'Event updated successfully',
      updatedEvent: event
    });
  } catch (error) {
    console.error('Update Event Error:', error);
    return res.status(500).json({ message: 'There was a problem, please try again', error: error.message });
  }
};

const deleteEvent = async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isCreator = event.creator?.toString() === user._id?.toString();
    const isAdmin = user.rol === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'There was a problem, please try again' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getEventByTitle,
  getEventByDate,
  updateEvent,
  deleteEvent
}
