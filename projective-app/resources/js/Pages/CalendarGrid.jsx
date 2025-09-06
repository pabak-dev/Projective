import TaskCard from './TaskCard';
import React from 'react';

// The component now accepts 'tasks' as a prop
function CalendarGrid({ currentDate, tasks = [] }) {

  // This helper function groups tasks by their due date
  const getTasksForMonth = (tasks, date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const tasksByDay = {};

    tasks.forEach(task => {
      const dueDate = new Date(task.due_date);
      // Check if the task's due date is in the currently viewed month
      if (dueDate.getFullYear() === year && dueDate.getMonth() === month) {
        const dayOfMonth = dueDate.getDate();
        if (!tasksByDay[dayOfMonth]) {
          tasksByDay[dayOfMonth] = [];
        }
        // Add a 'type' for styling, can be customized
        tasksByDay[dayOfMonth].push({ ...task, type: 'medium' });
      }
    });

    return tasksByDay;
  };

  const tasksByDay = getTasksForMonth(tasks, currentDate);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek; i > 0; i--) {
      days.push({
        day: prevMonthLastDay - i + 1,
        isCurrentMonth: false,
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        tasks: tasksByDay[day] || []
      });
    }

    // Add next month's days to fill the grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      days.push({
        day: nextMonthDay++,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-grid">
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday-header">{day}</div>
        ))}
      </div>
      <div className="calendar-days">
        {days.map((dayObj, index) => (
          <div
            key={index}
            className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''}`}
          >
            <span className="day-number">{dayObj.day}</span>
            {dayObj.tasks && (
              <div className="day-tasks">
                {dayObj.tasks.map((task, taskIndex) => (
                  <TaskCard key={taskIndex} task={task} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarGrid;