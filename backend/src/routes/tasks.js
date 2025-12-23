const express = require('express');
const Task = require('../models/Task');
const router = express.Router();
const auth = require("../middleware/authMiddleware");

// GET /api/tasks
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const q = {};
    if (status) q.status = status;
    if (priority) q.priority = priority;
    if (search) q.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    // only return tasks that belong to the authenticated user
    q.user = req.userId;
    const tasks = await Task.find(q).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tasks/:id
router.get('/:id',auth, async (req, res) => {
  try {
    // ensure user can only access their own task
    const t = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/tasks (create manual or from parsed voice)
router.post('/', auth, async (req, res) => {
  try {
    const body = req.body;
    if (!body.title) return res.status(400).json({ error: 'Title is required' });
    // attach the authenticated user to the task
    const task = new Task({ ...body, user: req.userId });
    await task.save();
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/tasks/:id
router.put('/:id',auth, async (req, res) => {
  try {
    // only allow owner to update
    const updated = await Task.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    // only allow owner to delete
    const del = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!del) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
