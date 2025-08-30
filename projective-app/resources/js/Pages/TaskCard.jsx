import React from 'react';

function TaskCard({ task }) {
  const getTaskTypeClass = (type) => {
    switch (type) {
      case 'high': return 'task-high'
      case 'medium': return 'task-medium'
      case 'low': return 'task-low'
      case 'meeting': return 'task-meeting'
      case 'milestone': return 'task-milestone'
      default: return 'task-medium'
    }
  }

  return (
    <div className={`task-card ${getTaskTypeClass(task.type)}`}>
      <div className="task-title">{task.title}</div>
      {task.subtitle && <div className="task-subtitle">{task.subtitle}</div>}
      <div className="task-priority">{task.priority}</div>
    </div>
  )
}

export default TaskCard