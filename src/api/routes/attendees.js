const { isAuth } = require('../../middlewares/isAuth')
const {
  getAttendees,
  getAttendancesByUser,
  registerAttendees,
  deleteAttendee
} = require('../controllers/attendees')

const attendeesRouter = require('express').Router()

attendeesRouter.get("/:eventId", getAttendees)
attendeesRouter.get("/user/:userId", getAttendancesByUser)
attendeesRouter.post('/:eventId', registerAttendees)
attendeesRouter.delete('/event/:eventId', isAuth, deleteAttendee)

module.exports = attendeesRouter
