require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../src/models/Task');

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node backfillTasks.js <userId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    const res = await Task.updateMany({ user: { $exists: false } }, { $set: { user: userId } });
    console.log('Updated tasks:', res.nModified || res.modifiedCount);
  } catch (err) {
    console.error('Error updating tasks:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
