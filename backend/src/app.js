require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const tasksRoute = require('./routes/tasks');
const voiceRoute = require('./routes/voice');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(bodyParser.json());
app.use('/api/tasks', tasksRoute);
app.use('/api/voice', voiceRoute);
app.use("/api", require("./routes/sttRoutes"));


async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log('Server listening on', PORT));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
