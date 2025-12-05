const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const q = {};
    if (status) q.status = status;
    if (priority) q.priority = priority;
    if (search) q.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    const tasks = await Task.find(q).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/tasks (create manual or from parsed voice)
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.title) return res.status(400).json({ error: 'Title is required' });
    const task = new Task(body);
    await task.save();
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const del = await Task.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
