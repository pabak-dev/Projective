import React from 'react';

function TaskCard({ task }) {
  // This function intelligently decides the style based on the task's type and priority.
  const getTaskTypeClass = (task) => {
    // Meetings and Milestones are styled by their 'type'.
    if (task.type === 'meeting' || task.type === 'milestone') {
      return `task-${task.type}`;
    }
    
    // Regular 'tasks' are styled by their 'priority'.
    switch (task.priority) {
      case 'high': return 'task-high';
      case 'medium': return 'task-medium';
      case 'low': return 'task-low';
      default: return 'task-medium'; // Default for tasks.
    }
  }

  return (
    <div className={`task-card ${getTaskTypeClass(task)}`}>
      <div className="task-title">{task.title}</div>
      {task.subtitle && <div className="task-subtitle">{task.subtitle}</div>}
      
      {/* The priority text is only shown if the item is a 'task'. */}
      {task.type === 'task' && 
        <div className="task-priority capitalize">{task.priority} Priority</div>
      }
    </div>
  )
}

export default TaskCard;