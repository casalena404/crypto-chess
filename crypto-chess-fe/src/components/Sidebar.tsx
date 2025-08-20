import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  onPlayOnline?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onPlayOnline }) => {
  const { user } = useAuth();

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h2>♔ Crypto Chess</h2>
        <div className="notification-dot"></div>
      </div>
      
      {/* Navigation */}
      <nav className="sidebar-nav">
        <a href="#play" className="nav-item active">
          <span className="nav-icon">♟️</span>
          <span className="nav-text">Play</span>
        </a>
        
        {user && (
          <button 
            className="nav-item online-play-btn"
            onClick={onPlayOnline}
          >
            <span className="nav-icon">🌐</span>
            <span className="nav-text">Play Online</span>
          </button>
        )}
        
        <a href="#puzzles" className="nav-item">
          <span className="nav-icon">🧩</span>
          <span className="nav-text">Puzzles</span>
        </a>
        <a href="#learn" className="nav-item">
          <span className="nav-icon">📚</span>
          <span className="nav-text">Learn</span>
        </a>
        <a href="#watch" className="nav-item">
          <span className="nav-icon">👁️</span>
          <span className="nav-text">Watch</span>
        </a>
        <a href="#news" className="nav-item">
          <span className="nav-icon">📰</span>
          <span className="nav-text">News</span>
        </a>
        <a href="#social" className="nav-item">
          <span className="nav-icon">👥</span>
          <span className="nav-text">Social</span>
        </a>
        <a href="#more" className="nav-item">
          <span className="nav-icon">⋯</span>
          <span className="nav-text">More</span>
        </a>
      </nav>
      
      {/* Search */}
      <div className="sidebar-search">
        <input type="text" placeholder="Search..." className="search-input" />
        <span className="search-icon">🔍</span>
      </div>
      
      {/* Bottom Actions */}
      <div className="sidebar-bottom">
        <button className="sidebar-btn">
          <span className="btn-icon">☀️</span>
          <span className="btn-text">Light UI</span>
        </button>
        <button className="sidebar-btn">
          <span className="btn-icon">◀️</span>
          <span className="btn-text">Collapse</span>
        </button>
        <button className="sidebar-btn">
          <span className="btn-icon">⚙️</span>
          <span className="btn-text">Settings</span>
        </button>
        <button className="sidebar-btn">
          <span className="btn-icon">❓</span>
          <span className="btn-text">Support</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
