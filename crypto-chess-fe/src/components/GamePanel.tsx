import React, { useState } from 'react';
import './GamePanel.css';
import GameControls from './GameControls';

interface GamePanelProps {
  onReset?: () => void;
}

const GamePanel: React.FC<GamePanelProps> = ({ onReset }) => {
  const [activeTab, setActiveTab] = useState<'moves' | 'info'>('moves');

  return (
    <div className="game-panel">
      {/* Tabs */}
      <div className="panel-tabs">
        <button 
          className={`tab-btn ${activeTab === 'moves' ? 'active' : ''}`}
          onClick={() => setActiveTab('moves')}
        >
          Moves
        </button>
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Info
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'moves' ? (
          <div className="moves-tab">
            {/* Game Title */}
            <div className="game-title">
              <h3>Scandinavian Defense: Mieses-Kotrč Variation</h3>
            </div>
            
            {/* Move History */}
            <div className="move-history-panel">
              <div className="move-list" id="move-list-root"></div>
            </div>
            
            {/* Game Navigation */}
            <div className="game-navigation">
              <button className="nav-btn">⏮️</button>
              <button className="nav-btn">◀️</button>
              <button className="nav-btn">▶️</button>
              <button className="nav-btn">⏭️</button>
            </div>
            
            {/* Game Actions */}
            <div className="game-actions">
              <button className="action-btn">1/2 Draw</button>
              <button className="action-btn">Resign</button>
              <button className="refresh-btn">🔄</button>
            </div>
          </div>
        ) : (
          <div className="info-tab">
            {/* Game Info */}
            <div className="game-info">
              <h4>NEW GAME</h4>
              <div className="player-matchup">
                <div className="player">
                  <span className="player-name">Player 1 (1200)</span>
                  <span className="vs-text">vs</span>
                  <span className="player-name">Player 2 (1180)</span>
                  <span className="time-control">(10 min)</span>
                </div>
                <div className="score-implications">
                  <span>win +8 / draw +0 / lose -8</span>
                </div>
              </div>
            </div>
            
            {/* Game Controls */}
            <div className="panel-controls">
              <GameControls onReset={onReset || (() => {})} />
            </div>
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="chat-input">
        <input 
          type="text" 
          placeholder="Send a message..." 
          className="chat-field"
        />
        <div className="chat-actions">
          <button className="emoji-btn">😊</button>
          <button className="more-btn">⋯</button>
        </div>
      </div>
      
      {/* Player 2 Info */}
      <div className="player2-info">
        <span className="player-name">Player 2 (1180)</span>
        <div className="player-pieces">
          <span className="piece-icon">♔</span>
          <span className="piece-icon">♕</span>
          <span className="piece-icon">♖</span>
          <span className="piece-icon">♗</span>
          <span className="piece-icon">♘</span>
          <span className="piece-icon">♙</span>
        </div>
        <div className="player-timer">
          <span className="timer">10:00</span>
          <span className="timer-icon">⏰</span>
        </div>
      </div>
    </div>
  );
};

export default GamePanel;
