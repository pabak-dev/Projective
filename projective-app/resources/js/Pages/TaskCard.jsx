import React from 'react';

function TaskCard({ task }) {
  const priority = (task.priority ?? '').toString().toLowerCase();
  const type = (task.type ?? '').toString().toLowerCase();

  const getTaskTypeClass = (task) => {
    if (task.type === 'meeting' || task.type === 'milestone') {
      return `task-${task.type}`;
    }
    switch (task.priority) {
      case 'high': return 'task-high';
      case 'medium': return 'task-medium';
      case 'low': return 'task-low';
      default: return 'task-medium';
    }
  };

  // compute friendly subtitle
  let displaySubtitle = task.subtitle ?? '';
  if (!displaySubtitle) {
    if (type === 'task' && priority) {
      displaySubtitle = `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`;
    } else if (type) {
      displaySubtitle = type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  // border color classes - you can keep your existing CSS hooks (task-high / task-meeting etc.)
  const borderClass =
    priority === 'high'
      ? 'border-red-500'
      : priority === 'medium'
      ? 'border-yellow-400'
      : priority === 'low'
      ? 'border-green-500'
      : type === 'meeting'
      ? 'border-indigo-500'
      : type === 'milestone'
      ? 'border-purple-500'
      : 'border-gray-300';

  return (
    <div
      className={`task-card ${getTaskTypeClass(task)} rounded-md p-2 shadow-sm border-l-4 ${borderClass} text-xs bg-white/95 overflow-hidden min-w-0`}
      title={`${task.title ?? 'Untitled'}${displaySubtitle ? ' — ' + displaySubtitle : ''}`}
      style={{ lineHeight: 1 }}
    >
      {/* Title: single-line, truncated */}
      <div className="task-title truncate font-medium text-sm leading-tight" style={{ minWidth: 0 }}>
        {task.title}
      </div>

      {/* Subtitle: smaller, tight leading, truncated */}
      {displaySubtitle && (
        <div className="task-subtitle text-[11px] text-gray-600 mt-1 truncate leading-none" style={{ minWidth: 0 }}>
          {displaySubtitle}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
