import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { router, usePage, Link } from '@inertiajs/react'; // <-- Added Link

// Add default values to the props here
export default function LeaderboardView({
    topPerformers = [],
    pointSystem = { taskCompletion: [], bonusPoints: [] },
    achievements = [],
    userStats = { totalPoints: 0, rank: '#-', tasksCompleted: 0, avgPointsPerTask: 0 }
}) {
  const { period } = usePage().props;
  const [selectedPeriod, setSelectedPeriod] = useState(period || 'monthly');

  // Function runs when the dropdown value changes
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setSelectedPeriod(newPeriod);

    // Make a new request to the same page with a 'period' query parameter
    router.get(route('leaderboard'), { period: newPeriod }, {
      preserveState: true,
      replace: true,
    });
  };

  return (
    <div className="leaderboard-view">
      {/* ---------- HEADER ---------- */}
      <div className="leaderboard-header">
        <div className="leaderboard-title-section">
          <h1 className="leaderboard-title">Team Leaderboard</h1>
          <p className="leaderboard-subtitle">
            Track performance and earn points for completing tasks
          </p>
        </div>
        <div className="leaderboard-controls">
          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="time-select"
          >
            <option value="monthly">This Month</option>
            <option value="weekly">This Week</option>
            <option value="all">All Time</option>
          </select>
          <button className="export-btn">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="leaderboard-content">
        {/* ---------- LEFT SIDE ---------- */}
        <div className="leaderboard-left">
          {/* Top Performers */}
          <div className="top-performers-section">
            <h2 className="section-title">Top Performers</h2>
            <div className="performers-list">
              {topPerformers.map((performer) => (
                <div
                  key={performer.id}
                  className={`performer-item ${performer.isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className="performer-rank">{performer.rank}</div>
                  <div className="performer-avatar">
                    <img
                      src={
                        performer.avatar
                          ? `/storage/${performer.avatar}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              performer.name
                            )}`
                      }
                      alt={performer.name}
                    />
                  </div>
                  <div className="performer-info">
                    {/* Make the name a Link */}
                    <Link href={route('users.show', { user: performer.id })} className="performer-name font-semibold text-gray-800 hover:underline">
                                            {performer.name}
                                        </Link>
                    <div className="performer-role">{performer.role}</div>
                  </div>
                  <div className="performer-points">
                    <div className="points-value">
                      {performer.points.toLocaleString()} pts
                    </div>
                    <div
                      className={`points-change ${
                        performer.weeklyChange.includes('-')
                          ? 'negative'
                          : 'positive'
                      }`}
                    >
                      {performer.weeklyChange}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Point System */}
          <div className="point-system-section">
            <h2 className="section-title">Point System</h2>
            <div className="point-system-grid">
              <div className="point-category">
                <h3 className="category-title">Task Completion</h3>
                <div className="point-items">
                  {pointSystem.taskCompletion.map((item, index) => (
                    <div key={index} className="point-item">
                      <span className="point-task">{item.task}</span>
                      <span className="point-value">{item.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="point-category">
                <h3 className="category-title">Bonus Points</h3>
                <div className="point-items">
                  {pointSystem.bonusPoints.map((item, index) => (
                    <div key={index} className="point-item">
                      <span className="point-task">{item.task}</span>
                      <span
                        className={`point-value ${
                          item.points.includes('-') ? 'negative' : 'positive'
                        }`}
                      >
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT SIDE ---------- */}
        <div className="leaderboard-right">
          {/* Your Stats */}
          <div className="your-stats-section">
            <h2 className="section-title">Your Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Points</span>
                <span className="stat-value">
                  {userStats.totalPoints.toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rank</span>
                <span className="stat-value">{userStats.rank}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tasks Completed</span>
                <span className="stat-value">{userStats.tasksCompleted}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Points/Task</span>
                <span className="stat-value">{userStats.avgPointsPerTask}</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="achievements-section">
            <h2 className="section-title">Achievements</h2>
            <div className="achievements-list">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`achievement-item ${
                    achievement.earned ? 'earned' : 'locked'
                  }`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <div className="achievement-title">{achievement.title}</div>
                    <div className="achievement-description">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
