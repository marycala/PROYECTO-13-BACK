const { deleteFile } = require('../../utils/deleteFile')
const Event = require('../models/events')
const User = require('../models/users')

const getEvents = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      title,
      location,
      category,
      minPrice,
      maxPrice,
      minDate,
      maxDate
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;
    const query = {};

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    if (location) {
      query.location = location;
    }

    if (category) {
      query.category = category;
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
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "creator", select: "userName" })
      .populate({ path: "attendees", select: "userName" });

    res.status(200).json({ events, total, page, totalPages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
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

    // Check if event with same title already exists
    const eventDuplicated = await Event.findOne({
      title: { $regex: `^${req.body.title}$`, $options: 'i' }
    });
    if (eventDuplicated) {
      return res.status(400).json({ message: "This event already exists" });
    }

    let { title, category, date, location, description, price } = req.body;

    // Normalize category (first letter uppercase, rest lowercase)
    if (category) {
      category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    }

    const allowedCategories = [
      "Music", "Sports", "Tech", "Art", "Food", "Business",
      "Education", "Health", "Gaming", "Travel", "Fashion", "Other"
    ];

    if (!category || !allowedCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Must be one of: ${allowedCategories.join(", ")}`
      });
    }

    // Validate date
    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Validate price
    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const eventData = {
      title: title?.trim(),
      category,
      date: new Date(date),
      location: location?.trim() || "",
      description: description?.trim() || "",
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
    console.error("Error creating event:", error);
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
    const isAdmin = user.rol === "admin";
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.creator.toString() !== user._id.toString() && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this event" });
    }

    const allowedCategories = [
      "Music", "Sports", "Tech", "Art", "Food", "Business",
      "Education", "Health", "Gaming", "Travel", "Fashion", "Other"
    ];

    const updatableFields = ["title", "category", "date", "location", "description", "price"];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        if (typeof value === "string") {
          value = value.trim();
        }

        if (field === "category") {
          if (!allowedCategories.includes(value)) {
            return res.status(400).json({
              message: `Invalid category. Must be one of: ${allowedCategories.join(", ")}`,
            });
          }
        }

        event[field] = value;
      }
    });

    if (req.files && req.files.img && req.files.img.length > 0) {
      if (event.img) {
        deleteFile(event.img);
      }
      event.img = req.files.img[0].path;
    }

    await event.save();

    await event.populate({ path: "creator", select: "userName" });

    if (isAdmin) {
      await event.populate({ path: "attendees", select: "userName" });
    } else {
      event.attendees = event.attendees.length;
    }

    return res.status(200).json({
      message: "Event updated successfully",
      updatedEvent: event,
    });
  } catch (error) {
    console.error("Update Event Error:", error);
    return res.status(500).json({
      message: "There was a problem, please try again",
      error: error.message,
    });
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

const getLocations = async (req, res) => {
  try {
    const locations = await Event.distinct("location");
    res.status(200).json({ locations });
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations", error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getEventByTitle,
  getEventByDate,
  updateEvent,
  deleteEvent,
  getLocations
}
