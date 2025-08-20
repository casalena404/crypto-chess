import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSound } from '../contexts/SoundContext';
import { Sun, Moon, Volume2, VolumeX, RotateCcw, Play } from 'lucide-react';
import './GameControls.css';

interface GameControlsProps {
  onReset: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onReset }) => {
  const { theme, toggleTheme } = useTheme();
  const { isSoundEnabled, toggleSound, playMoveSound } = useSound();

  const testSound = () => {
    playMoveSound();
  };

  return (
    <div className="game-controls">
      <div className="control-group">
        <button 
          className="control-btn theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <button 
          className="control-btn sound-toggle"
          onClick={toggleSound}
          title={`${isSoundEnabled ? 'Disable' : 'Enable'} sound`}
        >
          {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        
        <button 
          className="control-btn test-sound-btn"
          onClick={testSound}
          title="Test sound"
        >
          <Play size={20} />
        </button>
        
        <button 
          className="control-btn reset-btn"
          onClick={onReset}
          title="Reset game"
        >
          <RotateCcw size={20} />
        </button>
      </div>
      
      <div className="control-info">
        <p><strong>Theme:</strong> {theme}</p>
        <p><strong>Sound:</strong> {isSoundEnabled ? 'On' : 'Off'}</p>
      </div>
    </div>
  );
};

export default GameControls;
