import React from 'react';
import TaskCard from './TaskCard';

function isoDateString(date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export default function CalendarGrid({
  currentDate,
  tasks = [],
  onTaskClick,
  onDayClick,
  onWeekdayClick,
  viewMode = 'Month',
}) {
  const tasksByIso = {};
  tasks.forEach((t) => {
    if (!t?.due_date) return;
    const iso = new Date(t.due_date).toISOString().slice(0, 10);
    if (!tasksByIso[iso]) tasksByIso[iso] = [];
    tasksByIso[iso].push(t);
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  /* ---------- Month view ---------- */
  const renderMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    // prev month tail
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek; i > 0; i--) {
      const d = prevMonthLastDay - i + 1;
      const dateObj = new Date(year, month - 1, d);
      days.push({ date: dateObj, day: d, isCurrentMonth: false });
    }

    // current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      days.push({ date: dateObj, day, isCurrentMonth: true });
    }

    // next month tail
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      const dateObj = new Date(year, month + 1, nextMonthDay);
      days.push({ date: dateObj, day: nextMonthDay++, isCurrentMonth: false });
    }

    return (
      <>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((wd, idx) => (
            <div
              key={wd}
              className="text-center font-semibold text-sm py-2 cursor-pointer select-none"
              onClick={() => onWeekdayClick && onWeekdayClick(idx)}
              title={`Show week view starting on ${wd}`}
            >
              {wd}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map((dayObj, index) => {
            const iso = isoDateString(dayObj.date);
            const dayTasks = tasksByIso[iso] || [];
            const todayHighlight = isSameDay(dayObj.date, today);

            return (
              <div
                key={index}
                className={`p-2 rounded-lg min-h-[90px] border ${dayObj.isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${todayHighlight ? 'ring-2 ring-blue-200' : 'border-gray-100'} shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className="day-number cursor-pointer font-semibold text-sm"
                    onClick={() => onDayClick && onDayClick(dayObj.date)}
                  >
                    {dayObj.day}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="inline-flex items-center text-xs font-medium bg-gray-200 px-2 py-0.5 rounded-full">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-2">
                  {dayTasks.slice(0, 3).map((task, ti) => (
                    <div key={ti} onClick={() => onTaskClick && onTaskClick(task)} className="cursor-pointer">
                      <TaskCard task={task} />
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  /* ---------- Week view (table-like) ---------- */
  const renderWeekTable = () => {
    const start = startOfWeek(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    return (
      <div className="space-y-3">
        {/* header row */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((d, idx) => {
            const iso = isoDateString(d);
            const count = (tasksByIso[iso] || []).length;
            const todayHighlight = isSameDay(d, today);
            return (
              <div
                key={idx}
                onClick={() => onWeekdayClick && onWeekdayClick(idx)}
                className={`cursor-pointer rounded-lg p-3 text-center font-semibold ${todayHighlight ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-gray-50'} border border-gray-100`}
                title={`Open week containing ${d.toDateString()}`}
              >
                <div className="text-xs text-gray-700">{weekDays[d.getDay()]}</div>
                <div className="text-sm">{d.getDate()}</div>
                {count > 0 && (
                  <div className="mt-2 inline-flex items-center justify-center bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">
                    {count}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* body row */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((d, idx) => {
            const iso = isoDateString(d);
            const dayTasks = tasksByIso[iso] || [];
            const todayHighlight = isSameDay(d, today);
            return (
              <div
                key={idx}
                className={`bg-white rounded-lg p-3 min-h-[220px] border border-gray-100 shadow-sm overflow-y-auto max-h-[56vh] ${todayHighlight ? 'ring-2 ring-blue-100' : ''}`}
              >
                {dayTasks.length === 0 ? (
                  <div className="text-sm text-gray-400">No tasks</div>
                ) : (
                  <div className="space-y-3">
                    {dayTasks.map((task, ti) => (
                      <div key={ti} onClick={() => onTaskClick && onTaskClick(task)} className="cursor-pointer">
                        <TaskCard task={task} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ---------- Day view ---------- */
  const renderDay = () => {
    const iso = isoDateString(currentDate);
    const dayTasks = tasksByIso[iso] || [];
    const todayHighlight = isSameDay(currentDate, today);

    return (
      <div className="p-2">
        <div className={`py-3 px-4 rounded-lg font-semibold ${todayHighlight ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-gray-50'} border border-gray-100`}>
          {currentDate.toDateString()}
        </div>

        <div className="mt-4 space-y-3">
          {dayTasks.length === 0 && <div className="text-gray-400">No tasks for this day</div>}
          {dayTasks.map((task, ti) => (
            <div key={ti} onClick={() => onTaskClick && onTaskClick(task)} className="cursor-pointer">
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-grid">
      {viewMode === 'Month' && renderMonth()}
      {viewMode === 'Week' && renderWeekTable()}
      {viewMode === 'Day' && renderDay()}
    </div>
  );
}
