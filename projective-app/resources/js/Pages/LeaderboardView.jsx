import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import React from 'react';

export default function LeaderboardView() {
  const topPerformers = [
    {
      rank: 1,
      name: 'Sarah Chen',
      role: 'Frontend Developer',
      points: 2847,
      weeklyChange: '+247 this week',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      rank: 2,
      name: 'Marcus Rodriguez',
      role: 'Backend Developer',
      points: 2431,
      weeklyChange: '+189 this week',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      rank: 3,
      name: 'Emily Watson',
      role: 'UX Designer',
      points: 2156,
      weeklyChange: '+156 this week',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      rank: 4,
      name: 'You',
      role: 'Full Stack Developer',
      points: 1247,
      weeklyChange: '-23 this week',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      isCurrentUser: true
    },
    {
      rank: 5,
      name: 'David Kim',
      role: 'Product Manager',
      points: 987,
      weeklyChange: '+67 this week',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ]

  const pointSystem = {
    taskCompletion: [
      { task: 'Story Point (Small)', points: 10 },
      { task: 'Story Point (Medium)', points: 25 },
      { task: 'Story Point (Large)', points: 50 },
      { task: 'Bug Fix', points: 15 }
    ],
    bonusPoints: [
      { task: 'Early Completion', points: '+5 pts' },
      { task: 'Code Review', points: '+3 pts' },
      { task: 'Documentation', points: '+8 pts' },
      { task: 'Late Penalty', points: '-10 pts' }
    ]
  }

  const achievements = [
    {
      icon: '⚡',
      title: 'Speed Demon',
      description: 'Complete 5 tasks early',
      earned: true
    },
    {
      icon: '👨‍💻',
      title: 'Code Reviewer',
      description: 'Review 10 pull requests',
      earned: true
    },
    {
      icon: '🤝',
      title: 'Team Player',
      description: 'Help 5 teammates',
      earned: false
    }
  ]

  return (
    <div className="leaderboard-view">
      <div className="leaderboard-header">
        <div className="leaderboard-title-section">
          <h1 className="leaderboard-title">Team Leaderboard</h1>
          <p className="leaderboard-subtitle">Track performance and earn points for completing tasks</p>
        </div>
        <div className="leaderboard-controls">
          <select className="time-select">
            <option>This Month</option>
            <option>This Week</option>
            <option>All Time</option>
          </select>
          <button className="export-btn">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="leaderboard-content">
        <div className="leaderboard-left">
          <div className="top-performers-section">
            <h2 className="section-title">Top Performers</h2>
            <div className="performers-list">
              {topPerformers.map((performer) => (
                <div key={performer.rank} className={`performer-item ${performer.isCurrentUser ? 'current-user' : ''}`}>
                  <div className="performer-rank">{performer.rank}</div>
                  <div className="performer-avatar">
                    <img src={performer.avatar} alt={performer.name} />
                  </div>
                  <div className="performer-info">
                    <div className="performer-name">{performer.name}</div>
                    <div className="performer-role">{performer.role}</div>
                  </div>
                  <div className="performer-points">
                    <div className="points-value">{performer.points.toLocaleString()} pts</div>
                    <div className={`points-change ${performer.weeklyChange.includes('-') ? 'negative' : 'positive'}`}>
                      {performer.weeklyChange}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                      <span className={`point-value ${item.points.includes('-') ? 'negative' : 'positive'}`}>
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="leaderboard-right">
          <div className="your-stats-section">
            <h2 className="section-title">Your Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Points</span>
                <span className="stat-value">1,247</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rank</span>
                <span className="stat-value">#4</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tasks Completed</span>
                <span className="stat-value">23</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Points/Task</span>
                <span className="stat-value">54</span>
              </div>
            </div>
          </div>

          <div className="achievements-section">
            <h2 className="section-title">Achievements</h2>
            <div className="achievements-list">
              {achievements.map((achievement, index) => (
                <div key={index} className={`achievement-item ${achievement.earned ? 'earned' : 'locked'}`}>
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <div className="achievement-title">{achievement.title}</div>
                    <div className="achievement-description">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="weekly-challenge-section">
            <h2 className="section-title">Weekly Challenge</h2>
            <div className="challenge-card">
              <div className="challenge-icon">
                <span>🏃</span>
              </div>
              <div className="challenge-info">
                <div className="challenge-title">Sprint Master</div>
                <div className="challenge-description">Complete 8 tasks this week</div>
                <div className="challenge-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '62.5%' }}></div>
                  </div>
                  <div className="progress-text">5/8 tasks completed</div>
                  <div className="progress-reward">Reward: 100 bonus points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="leaderboard-footer">
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
