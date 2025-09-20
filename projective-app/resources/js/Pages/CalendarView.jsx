import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CalendarGrid from './CalendarGrid';
import Legend from './Legend';
import Modal from '@/Components/Modal';
import { router, usePage } from '@inertiajs/react';

function isoDateString(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0,0,0,0);
  return d;
}

export default function CalendarView({ tasks = [] }) {
  const { period: initialPeriod, date: initialDate, project: initialProject } = usePage().props;
  const [currentDate, setCurrentDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const [viewMode, setViewMode] = useState(initialPeriod === 'daily' ? 'Day' : (initialPeriod === 'weekly' ? 'Week' : 'Month'));
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod || 'monthly');
  const [selectedProject, setSelectedProject] = useState(initialProject ?? 'all');

  const formatHeader = (date) => {
    if (viewMode === 'Week') {
      const start = startOfWeek(date);
      const end = addDays(start, 6);
      return `${start.toLocaleDateString()} — ${end.toLocaleDateString()}`;
    } else if (viewMode === 'Day') {
      return date.toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigate = (direction) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      if (viewMode === 'Month') {
        next.setMonth(prev.getMonth() + direction);
      } else if (viewMode === 'Week') {
        next.setDate(prev.getDate() + (direction * 7));
      } else {
        next.setDate(prev.getDate() + direction);
      }
      const iso = isoDateString(next);
      const period = viewMode === 'Day' ? 'daily' : (viewMode === 'Week' ? 'weekly' : 'monthly');
      const params = { period, date: iso };
      if (selectedProject && selectedProject !== 'all') params.project = selectedProject;
      router.get(route('calendar'), params, { preserveState: true, replace: true });
      return next;
    });
  };

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setSelectedPeriod(newPeriod);
    const vm = newPeriod === 'daily' ? 'Day' : (newPeriod === 'weekly' ? 'Week' : 'Month');
    setViewMode(vm);
    const iso = isoDateString(currentDate);
    const params = { period: newPeriod, date: iso };
    if (selectedProject && selectedProject !== 'all') params.project = selectedProject;
    router.get(route('calendar'), params, { preserveState: true, replace: true });
  };

  const openTaskModal = (task) => setSelectedTask(task);
  const closeTaskModal = () => setSelectedTask(null);

  const handleDayClick = (date) => {
    setCurrentDate(date);
    setViewMode('Day');
    setSelectedPeriod('daily');
    const iso = isoDateString(date);
    const params = { period: 'daily', date: iso };
    if (selectedProject && selectedProject !== 'all') params.project = selectedProject;
    router.get(route('calendar'), params, { preserveState: true, replace: true });
  };

  const handleWeekdayClick = (weekdayIndex) => {
    const start = startOfWeek(currentDate);
    const selectedDate = addDays(start, weekdayIndex);
    setCurrentDate(selectedDate);
    setViewMode('Week');
    setSelectedPeriod('weekly');
    const iso = isoDateString(selectedDate);
    const params = { period: 'weekly', date: iso };
    if (selectedProject && selectedProject !== 'all') params.project = selectedProject;
    router.get(route('calendar'), params, { preserveState: true, replace: true });
  };

  const handlePriorityChange = (e) => {
    const newPriority = e.target.value;
    if (selectedTask) {
      const updatedTask = { ...selectedTask, priority: newPriority };
      setSelectedTask(updatedTask);
      router.put(route('tasks.update', selectedTask.id), { priority: newPriority }, {
        preserveState: true,
        replace: true,
      });
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    if (selectedTask) {
      const updatedTask = { ...selectedTask, type: newType };
      setSelectedTask(updatedTask);
      router.put(route('tasks.update', selectedTask.id), { type: newType }, {
        preserveState: true,
        replace: true,
      });
    }
  };

  // ------------------- Project list extraction (more robust) -------------------
  const projects = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      const proj = t.project ?? null;

      // Common candidate fields that might contain the user-friendly project name
      const nameCandidates = [
        proj?.name,
        proj?.title,
        proj?.project_name,
        proj?.display_name,
        proj?.label,
        t.project_name,
        t.project_title,
        proj?.title_name
      ];

      const name = nameCandidates.find(v => v !== undefined && v !== null && String(v).trim() !== '') ?? null;
      // Prefer a numeric/unique id if present; otherwise fallback to name (so we still have a stable key)
      const idCandidate = proj?.id ?? t.project_id ?? null;
      const id = idCandidate != null ? String(idCandidate) : (name ? String(name) : null);

      if (id != null) {
        const key = id;
        if (!map[key]) {
          map[key] = { id: key, name: String(name ?? key) };
        }
      }
    });

    return Object.values(map);
  }, [tasks]);

  // helper: get project key from a task (try the same fields)
  function getTaskProjectKey(t) {
    const proj = t.project ?? null;
    const nameCandidates = [
      proj?.name,
      proj?.title,
      proj?.project_name,
      proj?.display_name,
      proj?.label,
      t.project_name,
      t.project_title,
      proj?.title_name
    ];
    const name = nameCandidates.find(v => v !== undefined && v !== null && String(v).trim() !== '') ?? null;
    const idCandidate = proj?.id ?? t.project_id ?? null;
    const id = idCandidate != null ? String(idCandidate) : (name ? String(name) : null);
    return id;
  }

  const filteredTasks = useMemo(() => {
    if (!selectedProject || selectedProject === 'all') return tasks;
    return tasks.filter(t => getTaskProjectKey(t) === selectedProject);
  }, [tasks, selectedProject]);

  const handleProjectChange = (e) => {
    const proj = e.target.value;
    setSelectedProject(proj);

    const iso = isoDateString(currentDate);
    const params = { period: selectedPeriod, date: iso };
    if (proj && proj !== 'all') params.project = proj;
    router.get(route('calendar'), params, { preserveState: true, replace: true });
  };

  // friendly tooltip for the select
  const selectedProjectName = selectedProject === 'all' ? 'All Projects' : (projects.find(p => p.id === selectedProject)?.name ?? selectedProject);

  return (
    <div className="calendar-view space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold">Deadline Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Track task deadlines and milestones</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="border border-gray-200 rounded-md px-3 py-1 text-sm bg-white min-w-[180px] max-w-[280px] truncate"
            value={selectedPeriod}
            onChange={handlePeriodChange}
            title="Selected period"
          >
            <option value="monthly">This Month</option>
            <option value="weekly">This Week</option>
            <option value="daily">This Day</option>
            <option value="all_time">All Time</option>
          </select>

          {/* PROJECT FILTER: wider + truncation + tooltip */}
          <select
            className="border border-gray-200 rounded-md px-3 py-1 text-sm bg-white min-w-[220px] max-w-[360px] truncate"
            value={selectedProject}
            onChange={handleProjectChange}
            title={selectedProjectName}
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-md border border-gray-100 hover:bg-gray-50"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>

          <h2 className="text-sm font-semibold">{formatHeader(currentDate)}</h2>

          <button
            onClick={() => navigate(1)}
            className="p-2 bg-white rounded-md border border-gray-100 hover:bg-gray-50"
            aria-label="Next"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {['Month', 'Week', 'Day'].map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode);
                const period = mode === 'Day' ? 'daily' : (mode === 'Week' ? 'weekly' : 'monthly');
                setSelectedPeriod(period);
                const iso = isoDateString(currentDate);
                const params = { period, date: iso };
                if (selectedProject && selectedProject !== 'all') params.project = selectedProject;
                router.get(route('calendar'), params, { preserveState: true, replace: true });
              }}
              className={`px-3 py-1 rounded-md text-sm font-medium border ${viewMode === mode ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-100'} hover:bg-gray-50`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <CalendarGrid
        currentDate={currentDate}
        tasks={filteredTasks}
        onTaskClick={openTaskModal}
        onDayClick={handleDayClick}
        onWeekdayClick={handleWeekdayClick}
        viewMode={viewMode}
      />

      <Legend />

      <footer className="text-xs text-gray-400 mt-4">© 2025 ProjectIve. All rights reserved.</footer>

      <Modal show={selectedTask !== null} onClose={closeTaskModal} maxWidth="2xl">
        {selectedTask && (
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold">{selectedTask.title}</h2>
              <button onClick={closeTaskModal} className="text-gray-500">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p>
                <strong>Status:</strong>
                <span
                  className="ml-2 inline-block px-2 py-0.5 bg-gray-100 rounded max-w-[220px] truncate align-middle"
                  title={selectedTask.status?.replace('_', ' ')}
                >
                  {selectedTask.status?.replace('_', ' ')}
                </span>
              </p>

              {/* Type row: label + select (flex) */}
              <div className="flex items-center gap-3">
                <strong>Type:</strong>
                <select
                  value={selectedTask.type}
                  onChange={handleTypeChange}
                  className="ml-2 border border-gray-200 rounded-md px-3 py-1 text-sm bg-white min-w-[160px] max-w-[420px] truncate"
                  title={selectedTask.type}
                >
                  <option value="task">Task</option>
                  <option value="meeting">Meeting</option>
                  <option value="milestone">Milestone</option>
                  {/* If you have longer custom types, they will now be truncated visually but shown on hover */}
                </select>
              </div>

              {/* Priority row: only shown for tasks */}
              {selectedTask.type === 'task' && (
                <div className="flex items-center gap-3">
                  <strong>Priority:</strong>
                  <select
                    value={selectedTask.priority}
                    onChange={handlePriorityChange}
                    className="ml-2 border border-gray-200 rounded-md px-3 py-1 text-sm bg-white min-w-[140px] max-w-[360px] truncate"
                    title={selectedTask.priority}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    {/* If your priorities can be longer strings, they'll be truncated but readable via tooltip */}
                  </select>
                </div>
              )}

              <p><strong>Due Date:</strong> <span className="ml-2">{new Date(selectedTask.due_date).toLocaleDateString()}</span></p>
              <div>
                <h3 className="font-semibold">Description</h3>
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <p className="text-gray-600">{selectedTask.description || "No description provided."}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
