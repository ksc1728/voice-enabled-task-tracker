require('dotenv').config({ path: './.env' }); 
const mongoose = require('mongoose');
const Task = require('../src/models/Task');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Task.deleteMany({});
  await Task.create([
    { title: 'Review authentication PR', priority: 'HIGH', status: 'TODO', dueDate: new Date(Date.now()+24*3600*1000) , source:'MANUAL' },
    { title: 'Write unit tests', priority: 'MEDIUM', status: 'IN_PROGRESS', source:'MANUAL' },
    { title: 'Plan team meeting', priority: 'LOW', status: 'TODO', dueDate: nextMonday() }
  ]);
  console.log('Seeded');
  process.exit(0);
}

function nextMonday(){
  const d = new Date();
  d.setDate(d.getDate() + (8 - d.getDay()) % 7);
  d.setHours(18,0,0,0);
  return d;
}

seed();
