import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import SortableTask from './SortableTask'; 
import DroppableColumn from './DroppableColumn'; 

export default function TaskBoard({ tasks, onUpdateStatus, onEdit, onDelete }) {
  // Group tasks by status
  const columns = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter(t => t.status === 'DONE')
  };

  const sensors = useSensors(useSensor(PointerSensor));

  // A simple dnd handling: when drag ends, detect destination column by element id
  function handleDragEnd(event) {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id; // task id
  let overId = over.id;

  // CASE 1: dropped onto a column
  if (overId.startsWith("column-")) {
    const status = overId.replace("column-", "");
    onUpdateStatus(activeId, status);
    return;
  }

  // CASE 2: dropped on another task → detect its column
  const overElement = document.getElementById(overId);

  if (overElement) {
    const columnDiv = overElement.closest("[id^='column-']");
    if (columnDiv) {
      const status = columnDiv.id.replace("column-", "");
      onUpdateStatus(activeId, status);
    }
  }
}


  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        {Object.keys(columns).map(col => (
          <div key={col} style={{ width:'33%', background:'transparent' }}>
            <h4>{col.replace('_',' ')}</h4>
            <DroppableColumn id={`column-${col}`}>
              <SortableContext items={columns[col].map(t => t._id)} strategy={verticalListSortingStrategy}>
                {columns[col].map(task => (
                  <SortableTask key={task._id} id={task._id}>
                    {({ attributes, listeners }) => (
                      <div style={{ marginBottom:8, background:'#fff', border:'1px solid #ccc', borderRadius:4, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding:0 }}>
                          <div
                            {...attributes}
                            {...listeners}
                            style={{
                              cursor: 'grab',
                              background: '#eee',
                              padding: '4px 8px',
                              borderRadius: 4
                            }}
                          >
                            <strong>{task.title}</strong>
                          </div>

                          <div style={{ padding:8 }}>
                            <div style={{ fontSize:12, color:'#666' }}>
                              {task.priority} • {task.dueDate ? new Date(task.dueDate).toLocaleString() : ''}
                            </div>

                            <div style={{ marginTop:6 }}>
                              <button onClick={() => onEdit(task)} style={{ fontSize:12 }}>
                                Edit
                              </button>

                              <button
                                onClick={() => { if(window.confirm('Delete?')) onDelete(task._id) }}
                                style={{ fontSize:12, color:'red', marginLeft:6 }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </SortableTask>

                ))}
              </SortableContext>
            </DroppableColumn>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
