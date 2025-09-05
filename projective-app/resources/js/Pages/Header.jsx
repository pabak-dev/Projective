import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline'

function Header({ currentView, setCurrentView }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <span>P</span>
            </div>
            <span className="logo-text">ProjectIve</span>
          </div>
          <nav className="nav">
            <a href="#" className="nav-item">Boards</a>
            <a 
              href="#" 
              className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentView('analytics'); }}
            >
              Analytics
            </a>
            <a 
              href="#" 
              className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentView('calendar'); }}
            >
              Calendar
            </a>
            <a 
              href="#" 
              className={`nav-item ${currentView === 'leaderboard' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentView('leaderboard'); }}
            >
              Leaderboard
            </a>
            <a href="#" className="nav-item">Pricing</a>
          </nav>
        </div>
        <div className="header-right">
          <div className="points-display">
            <span className="points-icon">🏆</span>
            <span className="points-text">1,247 pts</span>
          </div>
          <button className="notification-btn">
            <BellIcon className="w-5 h-5" />
          </button>
          <div className="user-avatar">
            <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400" alt="User" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header