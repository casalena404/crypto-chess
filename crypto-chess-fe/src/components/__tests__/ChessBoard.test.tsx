import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChessBoard from '../ChessBoard';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { SoundProvider } from '../../contexts/SoundContext';

// Mock the contexts
const MockThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const MockSoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SoundProvider>{children}</SoundProvider>
);

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MockThemeProvider>
      <MockSoundProvider>
        {component}
      </MockSoundProvider>
    </MockThemeProvider>
  );
};

describe('ChessBoard', () => {
  test('renders chess board', () => {
    renderWithProviders(<ChessBoard />);
    
    // Check if the board is rendered
    const board = screen.getByRole('grid');
    expect(board).toBeInTheDocument();
    
    // Check if game status is displayed
    expect(screen.getByText(/White to move/)).toBeInTheDocument();
  });

  test('renders game controls', () => {
    renderWithProviders(<ChessBoard />);
    
    // Check if control buttons are rendered
    expect(screen.getByTitle(/Switch to dark mode/)).toBeInTheDocument();
    expect(screen.getByTitle(/Enable sound/)).toBeInTheDocument();
    expect(screen.getByTitle(/Reset game/)).toBeInTheDocument();
  });

  test('renders move history section', () => {
    renderWithProviders(<ChessBoard />);
    
    // Check if move history is displayed
    expect(screen.getByText('Move History')).toBeInTheDocument();
  });
});
