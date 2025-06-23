require('dotenv').config();
const express = require('express');
const { connectDB } = require('./src/config/db');
const cors = require('cors');
const eventsRouter = require('./src/api/routes/events');
const usersRouter = require('./src/api/routes/users');
const attendeesRouter = require('./src/api/routes/attendees');
const ImageRouter = require('./src/api/routes/imageRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/", ImageRouter)
app.use('/events', eventsRouter);
app.use('/users', usersRouter);
app.use('/attendees', attendeesRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
