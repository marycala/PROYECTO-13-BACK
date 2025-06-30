const { isAuth } = require('../../middlewares/isAuth');
const upload = require('../../middlewares/file');
const {
  createEvent,
  getEvents,
  getEventById,
  getEventByTitle,
  getEventByDate,
  updateEvent,
  deleteEvent,
} = require('../controllers/events');

const eventsRouter = require('express').Router();

eventsRouter.get('/', getEvents);
eventsRouter.get('/:id', getEventById);
eventsRouter.get('/search/title/:title', getEventByTitle);
eventsRouter.get('/search/date/:date', getEventByDate);
eventsRouter.post('/create', isAuth, upload.single('img'), createEvent);
eventsRouter.put('/:id', isAuth, upload.fields([
  { name: 'img', maxCount: 1 }
]), updateEvent);
eventsRouter.delete('/:id', isAuth, deleteEvent);

module.exports = eventsRouter;
