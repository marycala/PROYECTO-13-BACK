const { isAuth } = require('../../middlewares/isAuth')
const {
  getUsers,
  getUserById,
  register,
  login,
  updateUser,
  getFavorites,
  toggleFavoriteEvent
} = require('../controllers/users')

const usersRouter = require('express').Router()

usersRouter.get('/', getUsers)
usersRouter.get('/favorites', isAuth, getFavorites)
usersRouter.get('/:id', getUserById)
usersRouter.post('/register', register)
usersRouter.post('/login', login)
usersRouter.put('/', isAuth, updateUser)
usersRouter.patch("/favorites/:eventId", isAuth, toggleFavoriteEvent)

module.exports = usersRouter
