import React, { useEffect, useState } from 'react';
import Recorder from './components/Recorder';
import TaskBoard from './components/TaskBoard';
import TaskForm from './components/TaskForm';
import SortableTask from './components/SortableTask';
import { fetchTasks, createTask, updateTask, deleteTask } from './api';
import TaskModal from './components/TaskModal';

function App() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [voicePreview, setVoicePreview] = useState(null);

  async function load() {
    const t = await fetchTasks();
    setTasks(t);
  }

  useEffect(() => { load(); }, []);

  function handleNewTask(saved) {
    setTasks(prev => [saved, ...prev]);
  }

  async function handleUpdateStatus(id, status) {
    try {
      const updated = await updateTask(id, { status });
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) { console.error(err); }
  }

  function handleEdit(task) {
    setEditTask(task);
    setShowForm(true);
  }

  function onSaved(updated) {
    
    setTasks(prev => {
      const exists = prev.some(t => t._id === updated._id);
      if (exists) return prev.map(t => t._id === updated._id ? updated : t);
      return [updated, ...prev];
    });
  }

  
  function onParsedFromRecorder(res) {
    
    setVoicePreview(res);
  }

  return (
    <div style={{ padding:16 }}>
      <h2>Voice-Enabled Task Tracker</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { setEditTask(null); setShowForm(true); }}>Add Task</button>
      </div>

      <Recorder onParsed={onParsedFromRecorder} />

      <TaskBoard
        tasks={tasks}
        onUpdateStatus={handleUpdateStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && <TaskForm initial={editTask} onClose={() => setShowForm(false)} onSaved={onSaved} />}

      {voicePreview && <TaskModal data={voicePreview} onClose={() => setVoicePreview(null)} onCreated={(created) => { setTasks(p=>[created,...p]); setVoicePreview(null); }} />}
    </div>
  );
}

export default App;
