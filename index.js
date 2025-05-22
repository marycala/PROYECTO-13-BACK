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

app.use("/api/v1", ImageRouter)
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/attendees', attendeesRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
