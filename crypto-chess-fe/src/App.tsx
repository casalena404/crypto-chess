import React from 'react';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { SoundProvider } from './contexts/SoundContext';
import Sidebar from './components/Sidebar';
import GamePanel from './components/GamePanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import OnlineGame from './components/OnlineGame';
import OnlinePlay from './components/OnlinePlay';

function AppContent() {
  const [showAuth, setShowAuth] = React.useState(false);
  const [onlineGameId, setOnlineGameId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user, logout } = useAuth();

  // Debug: Log environment variables
  React.useEffect(() => {
    console.log('App loaded!');
    console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Clear game state when user changes
  React.useEffect(() => {
    setOnlineGameId(null);
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      setOnlineGameId(null); // Exit online game when logging out
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout failed:', error);
    }
  };

  const handlePlayOnline = () => {
    // For now, create a simple game ID
    // In a real app, this would open a modal to enter/join game codes
    const gameId = `game_${Date.now()}`;
    setOnlineGameId(gameId);
  };

  const handleExitOnlineGame = () => {
    setOnlineGameId(null);
  };

  return (
    <div className="App">
      {/* Debug info */}
      <div style={{ position: 'fixed', top: 0, left: 0, background: 'red', color: 'white', padding: '5px', fontSize: '12px', zIndex: 9999 }}>
        Debug: API_URL={process.env.REACT_APP_API_URL || 'NOT_SET'} | Loading={isLoading.toString()}
      </div>

      {/* Floating particles for cool effect */}
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
          Loading Crypto Chess... ⚡
        </div>
      ) : (
        <div className="app-layout">
        {/* Left Sidebar */}
        <Sidebar onPlayOnline={handlePlayOnline} />
        
        {/* Main Content Area */}
        <div className="main-content">
          {/* Top Bar */}
          <div className="top-bar">
            <div className="player-info">
              {user ? (
                <>
                  <span className="player-name">{user.displayName || user.email} (1200)</span>
                  <div className="player-pieces">
                    <span className="piece-icon">♔</span>
                    <span className="piece-icon">♕</span>
                    <span className="piece-icon">♖</span>
                    <span className="piece-icon">♗</span>
                    <span className="piece-icon">♘</span>
                    <span className="piece-icon">♙</span>
                  </div>
                </>
              ) : (
                <span className="player-name">Guest Player</span>
              )}
            </div>
            
            <div className="game-controls">
              {onlineGameId && (
                <button className="control-btn" onClick={handleExitOnlineGame}>
                  Exit Online Game
                </button>
              )}
              <button className="control-btn">New Game</button>
              <button className="control-btn">Games</button>
              <button className="control-btn">Players</button>
            </div>
            
            <div className="auth-section">
              {user ? (
                <div className="user-info">
                  <span className="user-email">{user.email}</span>
                  <button className="auth-btn logout-btn" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <button className="auth-btn login-btn" onClick={() => setShowAuth(true)}>
                  Sign In
                </button>
              )}
            </div>
          </div>
          
          {/* Chess Board */}
          <div className="board-container">
            {!user ? (
              <div className="login-required">
                <div className="login-required-content">
                  <h2>♔ Welcome to Crypto Chess</h2>
                  <p>Please sign in to start playing chess</p>
                  <button className="login-btn-large" onClick={() => setShowAuth(true)}>
                    Sign In to Play
                  </button>
                </div>
              </div>
                               ) : onlineGameId ? (
                     <OnlineGame key={user?.id} gameId={onlineGameId} />
                   ) : (
              <OnlinePlay />
            )}
          </div>
        </div>
        
        {/* Right Panel */}
        <GamePanel />
      </div>
      )}
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
