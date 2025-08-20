import React from 'react';
import { Piece, Square } from 'chess.js';
import { 
  Bitcoin, 
  Coins, 
  Zap, 
  Shield,
  Crown,
  Gem
} from 'lucide-react';
import './ChessSquare.css';

interface ChessSquareProps {
  square: Square;
  piece: Piece | null;
  color: 'light' | 'dark';
  isSelected: boolean;
  isHighlighted: boolean;
  isLastMove?: boolean;
  isCheck?: boolean;
  showDot?: boolean;
  onClick: () => void;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  square,
  piece,
  color,
  isSelected,
  isHighlighted,
  isLastMove = false,
  isCheck = false,
  showDot = false,
  onClick
}) => {
  const getPieceIcon = (piece: Piece) => {
    if (!piece) return null;
    
    const isWhite = piece.color === 'w';
    const iconColor = isWhite ? '#fbbf24' : '#374151';
    
    switch (piece.type) {
      case 'p': // Pawn
        return <Coins size={32} color={iconColor} />;
      case 'r': // Rook
        return <Shield size={32} color={iconColor} />;
      case 'n': // Knight
        return <Zap size={32} color={iconColor} />;
      case 'b': // Bishop
        return <Gem size={32} color={iconColor} />;
      case 'q': // Queen
        return <Crown size={32} color={iconColor} />;
      case 'k': // King
        return <Bitcoin size={32} color={iconColor} />;
      default:
        return null;
    }
  };

  const getSquareLabel = () => {
    const colIndex = square.charCodeAt(0) - 97; // a-h -> 0-7
    const rowIndexFromTop = 8 - parseInt(square[1], 10); // '8' -> 0, '1' -> 7
    
    if (rowIndexFromTop === 7) {
      return { text: String.fromCharCode(97 + colIndex), type: 'file' as const };
    }
    if (colIndex === 0) {
      return { text: (8 - rowIndexFromTop).toString(), type: 'rank' as const };
    }
    return null;
  };

  return (
    <div
      className={`chess-square ${color} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${isLastMove ? 'last-move' : ''} ${isCheck ? 'in-check' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Chess square ${square}${piece ? ` with ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
    >
      {showDot && (
        <div className={`legal-dot ${piece ? 'capture' : ''}`} />
      )}
      {piece && (
        <div className="piece">
          {getPieceIcon(piece)}
        </div>
      )}
      {(() => {
        const label = getSquareLabel();
        if (!label) return null;
        return (
          <div className={`square-label ${label.type === 'file' ? 'label-file' : 'label-rank'}`}>
            {label.text}
          </div>
        );
      })()}
    </div>
  );
};

export default ChessSquare;
