import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function DroppableColumn({ id, children }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} id={id} style={{ minHeight: 200, padding: 8, backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
      {children}
    </div>
  );
}
