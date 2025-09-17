import { useState } from 'react';
// 1. Correct the import: Change 'X' to 'XMarkIcon'
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CalendarGrid from './CalendarGrid';
import Legend from './Legend';
import React from 'react';
import Modal from '@/Components/Modal';
import { router, usePage } from '@inertiajs/react';

function CalendarView({ tasks = [] }) {
  const { period } = usePage().props;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Month');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period || 'monthly');

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setSelectedPeriod(newPeriod);
    router.get(route('calendar'), { period: newPeriod }, {
      preserveState: true,
      replace: true,
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const openTaskModal = (task) => setSelectedTask(task);
  const closeTaskModal = () => setSelectedTask(null);

  return (
    <div className="calendar-view">
      {/* Header and Navigation */}
      <div className="calendar-header">
        <div className="calendar-title-section">
            <h1 className="calendar-title">Deadline Calendar</h1>
            <p className="calendar-subtitle">Track task deadlines and milestones</p>
        </div>
        <div className="calendar-controls">
            <select
              className="time-select"
              value={selectedPeriod}
              onChange={handlePeriodChange}
            >
              <option value="monthly">This Month</option>
              <option value="weekly">This Week</option>
              <option value="all_time">All Time</option>
            </select>
            <button className="add-task-btn"><PlusIcon className="w-4 h-4" />Add Task</button>
        </div>
      </div>
      <div className="calendar-navigation">
          <div className="calendar-nav-left">
              <button className="nav-arrow" onClick={() => navigateMonth(-1)}><ChevronLeftIcon className="w-5 h-5" /></button>
              <h2 className="current-month">{formatMonthYear(currentDate)}</h2>
              <button className="nav-arrow" onClick={() => navigateMonth(1)}><ChevronRightIcon className="w-5 h-f" /></button>
          </div>
          <div className="view-modes">
              {['Month', 'Week', 'Day'].map((mode) => (
                  <button key={mode} className={`view-mode ${viewMode === mode ? 'active' : ''}`} onClick={() => setViewMode(mode)}>
                      {mode}
                  </button>
              ))}
          </div>
      </div>

      <CalendarGrid 
        currentDate={currentDate} 
        tasks={tasks}
        onTaskClick={openTaskModal} 
      />
      <Legend />
      
      <footer className="calendar-footer">
        <p>© 2025 ProjectIve. All rights reserved.</p>
      </footer>

      <Modal show={selectedTask !== null} onClose={closeTaskModal} maxWidth="2xl">
        {selectedTask && (
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedTask.title}</h2>
                    <button onClick={closeTaskModal} className="text-gray-400 hover:text-gray-600">
                        {/* 2. Correct the usage: Change <X> to <XMarkIcon> and use className */}
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4 text-sm text-gray-700">
                    <p><strong>Status:</strong> <span className="capitalize bg-gray-100 p-1 rounded">{selectedTask.status.replace('_', ' ')}</span></p>
                    <p><strong>Priority:</strong> <span className="capitalize">{selectedTask.priority}</span></p>
                    <p><strong>Type:</strong> <span className="capitalize">{selectedTask.type}</span></p>
                    <p><strong>Due Date:</strong> {new Date(selectedTask.due_date).toLocaleDateString()}</p>
                    <div>
                        <h3 className="font-bold mb-2">Description</h3>
                        <div className="prose prose-sm max-w-none p-2 bg-gray-50 rounded">
                           <p>{selectedTask.description || "No description provided."}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
}

export default CalendarView;