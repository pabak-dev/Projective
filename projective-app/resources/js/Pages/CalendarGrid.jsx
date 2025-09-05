import { useState } from 'react'
import TaskCard from './TaskCard'
import React from 'react';

function CalendarGrid({ currentDate }) {
  // Sample tasks data matching the Figma design
  const tasks = {
    1: [
      { title: 'API Integration', priority: 'High Priority', type: 'high' }
    ],
    3: [
      { title: 'Design Review', priority: 'Medium', type: 'medium' }
    ],
    6: [
      { title: 'Sprint Planning', subtitle: 'Team Meeting', type: 'meeting' }
    ],
    8: [
      { title: 'Testing Phase', priority: 'Low Priority', type: 'low' },
      { title: 'Bug Fixes', priority: 'Critical', type: 'high' }
    ],
    15: [
      { title: 'Client Demo', priority: 'Milestone', type: 'milestone' }
    ],
    22: [
      { title: 'Documentation', priority: 'In Progress', type: 'medium' }
    ]
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add previous month's days
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isPrevMonth: true
      })
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        tasks: tasks[day] || []
      })
    }

    // Add next month's days to fill the grid
    const totalCells = Math.ceil(days.length / 7) * 7
    let nextMonthDay = 1
    while (days.length < totalCells) {
      days.push({
        day: nextMonthDay++,
        isCurrentMonth: false,
        isNextMonth: true
      })
    }

    return days
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  )
}

export default CalendarGrid