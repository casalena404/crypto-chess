import React, { createContext, useContext, useState, useEffect } from 'react';

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playMoveSound: () => void;
  playCaptureSound: () => void;
  playCheckSound: () => void;
  playGameEndSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('sound-enabled');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('sound-enabled', JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  const toggleSound = () => {
    setIsSoundEnabled((prev: boolean) => !prev);
  };

  const playBeep = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!isSoundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Audio play failed:', err);
    }
  };

  const playMoveSound = () => {
    playBeep(800, 0.1); // High beep for move
  };

  const playCaptureSound = () => {
    playBeep(400, 0.2, 'square'); // Lower square wave for capture
  };

  const playCheckSound = () => {
    playBeep(600, 0.15, 'triangle'); // Triangle wave for check
  };

  const playGameEndSound = () => {
    // Play a sequence of beeps for game end
    setTimeout(() => playBeep(800, 0.1), 0);
    setTimeout(() => playBeep(600, 0.1), 150);
    setTimeout(() => playBeep(400, 0.2), 300);
  };

  return (
    <SoundContext.Provider value={{
      isSoundEnabled,
      toggleSound,
      playMoveSound,
      playCaptureSound,
      playCheckSound,
      playGameEndSound
    }}>
      {children}
    </SoundContext.Provider>
  );
};
