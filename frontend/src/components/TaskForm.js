import React, { useState, useEffect } from 'react';
import { createTask, updateTask } from '../api';

export default function TaskForm({ initial = null, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setDescription(initial.description || '');
      setPriority(initial.priority || 'MEDIUM');
      setStatus(initial.status || 'TODO');
      setDueDate(initial.dueDate ? initial.dueDate.slice(0,16) : '');
    }
  }, [initial]);

  async function save() {
    const payload = {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      source: initial ? initial.source || 'MANUAL' : 'MANUAL'
    };

    try {
      const saved = initial ? await updateTask(initial._id, payload) : await createTask(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  }

  return (
    <div style={{
      position:'fixed', left:0,right:0,top:0,bottom:0, background:'rgba(0,0,0,0.25)',
      display:'flex', alignItems:'center', justifyContent:'center'
    }}>
      <div style={{ background:'#fff', padding:20, width:520, borderRadius:8 }}>
        <h3>{initial ? 'Edit Task' : 'Create Task'}</h3>
        <div>
          <label>Title<br/>
            <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width:'100%' }}/>
          </label>
        </div>
        <div>
          <label>Description<br/>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} style={{ width:'100%' }} />
          </label>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:10 }}>
          <label>
            Priority<br/>
            <select value={priority} onChange={e=>setPriority(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </label>
          <label>
            Status<br/>
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>
          <label>
            Due Date<br/>
            <input type="datetime-local" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
          </label>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={save}>{initial ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}
