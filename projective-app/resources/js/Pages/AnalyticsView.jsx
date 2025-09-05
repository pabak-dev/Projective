import { ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { 
  ListBulletIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  InformationCircleIcon,
  ChartBarIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'
import React from 'react';

function AnalyticsView() {
  const metrics = [
    {
      title: 'Total Tasks',
      value: '247',
      change: '+12% from last month',
      changeType: 'positive',
      icon: ListBulletIcon
    },
    {
      title: 'Completed',
      value: '189',
      change: '+8% from last month',
      changeType: 'positive',
      icon: CheckCircleIcon
    },
    {
      title: 'In Progress',
      value: '34',
      change: 'Same as last month',
      changeType: 'neutral',
      icon: ClockIcon
    },
    {
      title: 'Avg. Cycle Time',
      value: '4.2',
      subtitle: 'days per task',
      change: '',
      changeType: 'neutral',
      icon: InformationCircleIcon
    }
  ]

  const recentActivities = [
    {
      user: 'Sarah',
      action: 'moved "API Integration" from In Progress to Done',
      time: '2 hours ago',
      status: 'Completed',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      user: 'Mike',
      action: 'created new task "Database Optimization"',
      time: '4 hours ago',
      status: 'Created',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      user: 'Emma',
      action: 'assigned "UI Review" to John',
      time: '6 hours ago',
      status: 'Assigned',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ]

  const teamPerformance = [
    {
      name: 'Sarah Chen',
      role: 'Frontend Dev',
      tasksCompleted: 23,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Mike Johnson',
      role: 'Backend Dev',
      tasksCompleted: 19,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Emma Davis',
      role: 'Designer',
      tasksCompleted: 16,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ]

  return (
    <div className="analytics-view">
      <div className="analytics-header">
        <div className="analytics-title-section">
          <div className="kanban-flow-header">
            <div className="kanban-icon">
              <div className="kanban-squares">
                <div className="kanban-square"></div>
                <div className="kanban-square"></div>
                <div className="kanban-square"></div>
                <div className="kanban-square"></div>
              </div>
            </div>
            <span className="kanban-title">KanbanFlow Analytics</span>
          </div>
          <button className="export-report-btn">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="dashboard-header">
        <h1 className="dashboard-title">Project Analytics Dashboard</h1>
        <div className="dashboard-controls">
          <select className="time-period-select">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
          <select className="project-filter-select">
            <option>All Projects</option>
            <option>Web Development</option>
            <option>Mobile App</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <div className="metric-info">
                <h3 className="metric-title">{metric.title}</h3>
                <div className="metric-value-container">
                  <span className="metric-value">{metric.value}</span>
                  {metric.subtitle && <span className="metric-subtitle">{metric.subtitle}</span>}
                </div>
              </div>
              <div className="metric-icon">
                <metric.icon className="w-5 h-5" />
              </div>
            </div>
            {metric.change && (
              <div className={`metric-change ${metric.changeType}`}>
                {metric.changeType === 'positive' && '↗ '}
                {metric.change}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Task Flow</h2>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="chart-placeholder">
            <div className="chart-placeholder-content">
              <ChartBarIcon className="w-12 h-12 text-gray-300" />
              <span className="chart-placeholder-text">Burndown Chart Visualization</span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Task Distribution</h2>
            <ChartPieIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="chart-placeholder">
            <div className="chart-placeholder-content">
              <ChartPieIcon className="w-12 h-12 text-gray-300" />
              <span className="chart-placeholder-text">Pie Chart - Tasks by Status</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-section">
        <div className="recent-activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-avatar">
                  <img src={activity.avatar} alt={activity.user} />
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <span className="activity-user">{activity.user}</span> {activity.action}
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
                <div className={`activity-status ${activity.status.toLowerCase()}`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="team-performance-section">
          <h2 className="section-title">Team Performance</h2>
          <div className="performance-list">
            {teamPerformance.map((member, index) => (
              <div key={index} className="performance-item">
                <div className="performance-avatar">
                  <img src={member.avatar} alt={member.name} />
                </div>
                <div className="performance-info">
                  <div className="performance-name">{member.name}</div>
                  <div className="performance-role">{member.role}</div>
                </div>
                <div className="performance-stats">
                  <div className="performance-number">{member.tasksCompleted}</div>
                  <div className="performance-label">tasks done</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="analytics-footer">
        <p>© 2025 ProjectIve. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Help</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  )
}

export default AnalyticsView