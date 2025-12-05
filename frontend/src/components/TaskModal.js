import React, { useState } from 'react';
import { createTask } from '../api';

export default function TaskModal({ data, onClose, onCreated }) {
  const parsed = data.parsed || {};
  const [title, setTitle] = useState(parsed.title || '');
  const [description, setDescription] = useState(parsed.description || data.transcript || '');
  const [priority, setPriority] = useState(parsed.priority || 'MEDIUM');
  const [status, setStatus] = useState(parsed.status || 'TODO');
  const [dueDate, setDueDate] = useState(parsed.dueDate ? parsed.dueDate.slice(0,16) : '');

  async function save() {
    const payload = {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      source: 'VOICE',
      transcript: data.transcript
    };
    try {
      const created = await createTask(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    }
  }

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, top: 0, bottom: 0,
      background: 'rgba(0,0,0,0.3)', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', padding: 20, width: 520, borderRadius: 6 }}>
        <h3>Review parsed task</h3>
        <div style={{ marginBottom: 8 }}><b>Transcript:</b> {data.transcript}</div>
        <div style={{ marginBottom: 8 }}>
          <label>Title<br/>
            <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width:'100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Description<br/>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} style={{ width:'100%' }} rows={3}/>
          </label>
        </div>
        <div style={{ display:'flex', gap: 8, marginBottom: 8 }}>
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
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={save}>Create Task</button>
        </div>
      </div>
    </div>
  );
}
