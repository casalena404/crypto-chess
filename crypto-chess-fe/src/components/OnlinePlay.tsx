import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { socketClient, apiClient } from '../services/api';
import OnlineGame from './OnlineGame';

const OnlinePlay: React.FC = () => {
  const { user } = useAuth();
  const [searching, setSearching] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [onlineCount, setOnlineCount] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const gameSocket = socketClient.connect();
      setSocket(gameSocket);

      // Listen for match found
      gameSocket.on('match-found', ({ gameId: newGameId, color, opponent }) => {
        console.log('Match found!', { gameId: newGameId, color, opponent });
        setGameId(newGameId);
        setSearching(false);
      });

      // Get online count
      const fetchOnlineCount = async () => {
        try {
          const response = await apiClient.getOnlineCount() as any;
          setOnlineCount(response.onlineCount);
        } catch (error) {
          console.error('Failed to get online count:', error);
        }
      };

      fetchOnlineCount();
      const interval = setInterval(fetchOnlineCount, 10000); // Update every 10 seconds

      return () => {
        clearInterval(interval);
        gameSocket.disconnect();
      };
    }
  }, [user]);

  // Clear game state when user changes
  useEffect(() => {
    setGameId(null);
    setSearching(false);
  }, [user?.id]);

  const startSearch = async (preferredColor: 'white' | 'black' | 'random' = 'random') => {
    if (!user || !socket) return;
    try {
      setSearching(true);
      await apiClient.createMatchmakingTicket(preferredColor);
      socket.emit('find-match', { preferredColor });
      console.log(`Started searching for match with ${preferredColor} preference...`);
    } catch (error) {
      console.error('Failed to start matchmaking:', error);
      setSearching(false);
    }
  };

  const cancelSearch = async () => {
    if (!user || !socket) return;
    try {
      setSearching(false);
      // Get current ticket and delete it
      const tickets = await apiClient.getMatchmakingTickets() as any;
      const userTicket = tickets.tickets.find((t: any) => t.userId === user.id);
      
      if (userTicket) {
        await apiClient.deleteMatchmakingTicket(userTicket.id);
      }
      socket.emit('cancel-match');
      console.log('Canceled matchmaking');
    } catch (error) {
      console.error('Failed to cancel matchmaking:', error);
    }
  };

  if (!user) {
    return <div className="online-game-container">Please sign in to play online.</div>;
  }

  // Show game if we have a gameId
  if (gameId) {
    return <OnlineGame gameId={gameId} />;
  }

  return (
    <div className="online-game-container">
      <div className="matchmaking-card">
        {/* Animated Background Elements */}
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="matchmaking-header">
          <div className="matchmaking-icon">
            <div className="chess-pieces-animation">
              <span className="piece piece-king">♔</span>
              <span className="piece piece-queen">♕</span>
              <span className="piece piece-rook">♖</span>
            </div>
          </div>
          
          <h2 className="matchmaking-title">
            {searching ? 'Finding Your Opponent...' : 'Ready to Play?'}
          </h2>
          
          <p className="matchmaking-subtitle">
            {searching 
              ? 'Searching for skilled players around the world' 
              : 'Challenge players from around the globe'
            }
          </p>
        </div>

        <div className="matchmaking-status">
          {searching ? (
            <div className="searching-indicator">
              <div className="searching-spinner-container">
                <div className="searching-spinner"></div>
                <div className="spinner-glow"></div>
              </div>
              
              <div className="searching-text">
                <span className="searching-primary">Searching...</span>
                <span className="searching-secondary">This may take a few moments</span>
              </div>
              
              <button 
                className="cancel-search-btn" 
                onClick={cancelSearch}
              >
                Cancel Search
              </button>
            </div>
          ) : (
            <div className="matchmaking-actions">
              <div className="color-preference">
                <h3>Find Opponent</h3>
                <div className="color-buttons">
                  <button className="color-btn random-btn primary-btn" onClick={() => startSearch('random')}>
                    🎲 Find Match (Random Color)
                  </button>
                  <div className="color-options">
                    <span className="option-label">Or choose specific color:</span>
                    <button className="color-btn white-btn" onClick={() => startSearch('white')}>
                      ♔ Play as White
                    </button>
                    <button className="color-btn black-btn" onClick={() => startSearch('black')}>
                      ♔ Play as Black
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="matchmaking-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span className="avatar-text">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="user-details">
              <span className="user-name">{user.displayName || user.email}</span>
              <span className="user-rating">Rating: {user.rating}</span>
            </div>
          </div>
          
          <div className="connection-status">
            <span className="connection-dot online"></span>
            <span className="connection-text">Online</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-number">{onlineCount}</span>
            <span className="stat-label">Players Online</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5s</span>
            <span className="stat-label">Avg. Wait Time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlinePlay;


