import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import ChessSquare from './ChessSquare';
import { useTheme } from '../contexts/ThemeContext';
import { useSound } from '../contexts/SoundContext';
import './ChessBoard.css';

interface ChessBoardProps {
  externalGame?: Chess;
  onUserMove?: (from: Square, to: Square) => void;
  playerColor?: 'white' | 'black';
  isOnline?: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ externalGame, onUserMove, playerColor }) => {
  const [game] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const { theme } = useTheme();
  const { playMoveSound, playCaptureSound } = useSound();
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const handleSquareClick = (square: Square) => {
    const gameRef = externalGame || game;
    if (selectedSquare === null) {
      const piece = gameRef.get(square);
      if (piece && piece.color === gameRef.turn()) {
        setSelectedSquare(square);
      }
    } else {
      if (selectedSquare === square) {
        setSelectedSquare(null);
      } else {
        const move = {
          from: selectedSquare,
          to: square,
          promotion: 'q' // Always promote to queen for simplicity
        };

        try {
          if (externalGame && onUserMove) {
            onUserMove(move.from, move.to);
            setSelectedSquare(null);
          } else {
            const result = gameRef.move(move);
            if (result) {
              setSelectedSquare(null);
              setLastMove({ from: result.from as Square, to: result.to as Square });
              if (result.captured) {
                playCaptureSound();
              } else {
                playMoveSound();
              }
            }
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('Invalid move:', error);
        }
      }
    }
  };

  const getSquareColor = (row: number, col: number) => {
    return (row + col) % 2 === 0 ? 'light' : 'dark';
  };

  const renderBoard = () => {
    const squares = [];
    const isBlackPlayer = playerColor === 'black';
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const gameRef = externalGame || game;
        
        // Calculate square coordinates based on player perspective
        let square: Square;
        if (isBlackPlayer) {
          // Black player sees board from their perspective (black pieces at bottom)
          const actualRow = 7 - row; // Flip rows
          const actualCol = 7 - col; // Flip columns
          square = String.fromCharCode(97 + actualCol) + (actualRow + 1) as Square;
        } else {
          // White player sees board normally (white pieces at bottom)
          square = String.fromCharCode(97 + col) + (8 - row) as Square;
        }
        
        const piece = gameRef.get(square) || null;
        const isSelected = selectedSquare === square;
        
        // Check if this square is a valid move destination for the selected piece
        let isHighlighted = false;
        let showDot = false;
        if (selectedSquare) {
          const moves = (externalGame || game).moves({ square: selectedSquare, verbose: true });
          const found = moves.find((m: any) => m.to === square);
          isHighlighted = Boolean(found);
          showDot = Boolean(found);
        }
        
        // NO coordinates to avoid duplication and messiness
        // Coordinates disabled for now to fix duplication issues
        
        squares.push(
          <ChessSquare
            key={square}
            square={square}
            piece={piece}
            color={getSquareColor(row, col)}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            isLastMove={lastMove ? lastMove.from === square || lastMove.to === square : false}
            showDot={showDot}
            onClick={() => handleSquareClick(square)}
          />
        );
      }
    }
    return squares;
  };

  return (
    <div className={`chess-board-container ${theme} ${playerColor === 'black' ? 'black-perspective' : 'white-perspective'}`}>
      <div className="chess-board">
        {renderBoard()}
      </div>
    </div>
  );
};

export default ChessBoard;
