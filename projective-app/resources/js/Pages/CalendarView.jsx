import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline'
import CalendarGrid from './CalendarGrid'
import Legend from './Legend'
import React from 'react';

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // January 2025
  const [viewMode, setViewMode] = useState('Month')

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-title-section">
          <h1 className="calendar-title">Deadline Calendar</h1>
          <p className="calendar-subtitle">Track task deadlines and milestones</p>
        </div>
        <div className="calendar-controls">
          <button className="filter-btn">
            <FunnelIcon className="w-4 h-4" />
            Filter
          </button>
          <select className="project-select">
            <option>All Projects</option>
            <option>Web Development</option>
            <option>Mobile App</option>
          </select>
          <button className="add-task-btn">
            <PlusIcon className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="calendar-navigation">
        <div className="calendar-nav-left">
          <button className="nav-arrow" onClick={() => navigateMonth(-1)}>
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="current-month">{formatMonthYear(currentDate)}</h2>
          <button className="nav-arrow" onClick={() => navigateMonth(1)}>
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="view-modes">
          {['Month', 'Week', 'Day'].map((mode) => (
            <button
              key={mode}
              className={`view-mode ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <CalendarGrid currentDate={currentDate} />
      <Legend />
      
      <footer className="calendar-footer">
        <p>© 2025 ProjectIve. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default CalendarView