import { ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { 
  ListBulletIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  InformationCircleIcon,
  ChartBarIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';


// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{`${p.name}: ${p.value}`}</p>
          ))}
        </div>
      );
    }
    return null;
};
  
// Active shape for Pie Chart
const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`Tasks: ${value}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(Rate: ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
};

// Your robust uiAvatar function
const uiAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&color=7F9CF5&background=EBF4FF`;

function AnalyticsView({ metrics, recentActivities, teamPerformance, taskDistribution, taskFlow, projects, currentProjectId, currentPeriod }) {
    const [filters, setFilters] = useState({
        project_id: currentProjectId || '',
        period: currentPeriod || '30',
    });

    useEffect(() => {
        setFilters({
            project_id: currentProjectId || '',
            period: currentPeriod || '30',
        });
    }, [currentProjectId, currentPeriod]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        router.get(route('analytics'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

  const metricCards = [
    {
      title: 'Total Tasks',
      value: metrics.totalTasks,
      change: `in last ${filters.period} days`,
      changeType: 'neutral',
      icon: ListBulletIcon
    },
    {
      title: 'Completed',
      value: metrics.completedTasks,
      change: `in last ${filters.period} days`,
      changeType: 'neutral',
      icon: CheckCircleIcon
    },
    {
      title: 'In Progress',
      value: metrics.inProgressTasks,
      change: `in last ${filters.period} days`,
      changeType: 'neutral',
      icon: ClockIcon
    },
    {
      title: 'Avg. Cycle Time',
      value: metrics.avgCycleTime,
      subtitle: 'days per task',
      change: '',
      changeType: 'neutral',
      icon: InformationCircleIcon
    }
  ];

  const pieChartData = Object.keys(taskDistribution).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: taskDistribution[status]
  }));

  const COLORS = {
    'Todo': '#ef4444',
    'In progress': '#f59e0b',
    'Done': '#22c55e',
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
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
          <a
            href={route('analytics.export', filters)}
            className="export-report-btn"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Report
          </a>
        </div>
      </div>

      <div className="dashboard-header">
        <h1 className="dashboard-title">Project Analytics Dashboard</h1>
        <div className="dashboard-controls">
          <select 
            className="time-period-select"
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <select 
            className="project-filter-select" 
            value={filters.project_id}
            onChange={(e) => handleFilterChange('project_id', e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        {metricCards.map((metric, index) => (
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskFlow}>
            <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
            </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="created" fill="url(#colorCreated)" name="Created" />
              <Bar dataKey="completed" fill="url(#colorCompleted)" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Task Distribution</h2>
            <ChartPieIcon className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-section">
        <div className="recent-activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-avatar">
                  <img
  src={activity.avatar ?? uiAvatar(activity.user)}
  alt={activity.user}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = uiAvatar(activity.user);
  }}
  className="w-10 h-10 rounded-full object-cover"
/>
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
                  <img
  src={member.avatar ?? uiAvatar(member.name)}
  alt={member.name}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = uiAvatar(member.name);
  }}
  className="w-10 h-10 rounded-full object-cover"
/>
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

export default AnalyticsView;