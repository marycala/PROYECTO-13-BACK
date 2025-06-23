const { generateSign } = require('../../utils/jwt')
const User = require('../models/users')
const bcrypt = require('bcrypt')

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate({
        path: 'favorites',
        select: 'title date image location',
      }).populate({
        path: 'attendees',
        populate: {
          path: 'eventId',
          select: 'title date'
        }
      })
    return res.status(200).json(users)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error })
  }
}

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).populate({
      path: 'favorites',
      select: 'title date image location',
    }).populate({
      path: 'attendees',
      populate: {
        path: 'eventId',
        select: 'title date'
      }
    })
    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error })
  }
}

const register = async (req, res, next) => {
  console.log('Register endpoint hit', req.body);
  const { email, password, userName } = req.body

  try {
    const emailDuplicated = await User.findOne({ email })
    if (emailDuplicated) {
      return res.status(400).json({ message: 'The user already exists' })
    }

    const newUser = new User({ userName, email, password })
    await newUser.save()

    const userToReturn = newUser.toObject()
    delete userToReturn.password

    const token = generateSign(newUser._id)

    return res.status(201).json({
      message: 'User created successfully',
      user: userToReturn,
      token,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect email or password' });
    }

    const token = generateSign(user._id);
    const userToReturn = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      rol: user.rol,
      favorites: user.favorites || [],
    };

    return res.status(200).json({ token, user: userToReturn });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params

    if (req.user._id.toString() !== id) {
      return res.status(400).json('You are not authorized')
    }

    const { email } = req.body
    if (!email) {
      return res.status(400).json('Email is required')
    }

    const userUpdated = await User.findByIdAndUpdate(
      id,
      { email },
      { new: true }
    )

    if (!userUpdated) {
      return res.status(404).json('User not found')
    }

    return res.status(200).json(userUpdated)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error })
  }
}

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

const toggleFavoriteEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const eventId = req.params.eventId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorite = user.favorites.includes(eventId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(favId => favId.toString() !== eventId);
    } else {
      user.favorites.push(eventId);
    }

    await user.save();
    await user.populate('favorites');

    return res.status(200).json({
      message: isFavorite ? 'Event removed from favorites' : 'Event added to favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  getUsers,
  getUserById,
  register,
  login,
  updateUser,
  getFavorites,
  toggleFavoriteEvent
}
