import React from 'react';

export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div style={{
      padding: 10, marginBottom: 8, borderRadius: 8, background:'#fff', boxShadow:'0 1px 2px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <div style={{ fontWeight:700 }}>{task.title}</div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => onEdit(task)} style={{ fontSize:12 }}>Edit</button>
          <button onClick={() => {
            if (window.confirm('Delete task?')) onDelete(task._id);
          }} style={{ fontSize:12, color:'red' }}>Delete</button>
        </div>
      </div>
      <div style={{ fontSize:12, color:'#666', marginTop:6 }}>
        {task.priority} • {task.dueDate ? new Date(task.dueDate).toLocaleString() : ''}
      </div>
    </div>
  );
}
