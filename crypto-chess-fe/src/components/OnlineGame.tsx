import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Chess, Square } from 'chess.js';
import ChessBoard from './ChessBoard';
import { socketClient, apiClient, Game } from '../services/api';
import './OnlineGame.css';

interface OnlineGameProps {
  gameId: string;
}

const OnlineGame: React.FC<OnlineGameProps> = ({ gameId }) => {
  const { user } = useAuth();
  const [game, setGame] = useState(() => new Chess());
  const [role, setRole] = useState<'white' | 'black' | 'spectator'>('spectator');
  const [isLoading, setIsLoading] = useState(true);
  const [gameResult, setGameResult] = useState<'white-wins' | 'black-wins' | 'draw' | 'abandoned' | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);
  const [socket, setSocket] = useState<any>(null);

  // Clear game state when user changes
  useEffect(() => {
    // Only clear state if user actually changes, not on every render
    if (user?.id && !gameData) {
      console.log('🔍 Debug: User changed and no game data, clearing game state');
      setGame(new Chess());
      setRole('spectator');
      setIsLoading(true); // Set loading to true when user changes
    }
  }, [user?.id, gameData]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setGame(new Chess());
      setRole('spectator');
      if (socket) {
        socket.emit('leave-game');
      }
    };
  }, [socket]);

  // Initialize game and socket connection
  useEffect(() => {
    if (!user || !gameId) return;

    // Debug logging
    console.log('🔍 Debug User Object:', {
      user,
      userId: user?.id,
      userEmail: user?.email,
      gameId
    });

    const initializeGame = async () => {
      try {
        setIsLoading(true);
        
        // Get game data from API
        const response = await apiClient.getGame(gameId) as any;
        const gameDoc = response.game;
        
        // Debug logging
        console.log('🔍 Debug Game Access Check:', {
          gameId,
          userId: user.id,
          gameWhite: gameDoc.white,
          gameBlack: gameDoc.black,
          isWhiteMatch: gameDoc.white === user.id,
          isBlackMatch: gameDoc.black === user.id
        });
        
        // Check if this user is part of this game
        const isUserInGame = (gameDoc.white === user.id) || (gameDoc.black === user.id);
        
        if (!isUserInGame) {
          console.error('User not in game, showing access denied');
          setGame(new Chess());
          setRole('spectator');
          setIsLoading(false);
          return;
        }

        // Set game state first
        setGameData(gameDoc);
        if (gameDoc.fen) {
          setGame(new Chess(gameDoc.fen));
        }

        // Set role immediately based on user
        if (gameDoc.white === user.id) {
          setRole('white');
          console.log('🔍 Debug: User role set to WHITE immediately');
        } else if (gameDoc.black === user.id) {
          setRole('black');
          console.log('🔍 Debug: User role set to BLACK immediately');
        } else {
          setRole('spectator');
          console.log('🔍 Debug: User role set to SPECTATOR immediately');
        }

        // Handle game over state
        if (gameDoc.gameOver && gameDoc.gameResult) {
          setGameResult(gameDoc.gameResult);
          if (gameDoc.winner) {
            setWinner(gameDoc.winner);
          }
        }

        // Set up socket connection
        const gameSocket = socketClient.connect();
        setSocket(gameSocket);
        
        // Join the game
        gameSocket.emit('join-game', gameId);
        
        // Listen for game events
        gameSocket.on('game-joined', ({ gameId: joinedGameId, game: joinedGame }) => {
          console.log('🔍 Debug: Game joined successfully:', joinedGameId);
        });
        
        gameSocket.on('move-made', ({ gameId: moveGameId, move, fen, userId }) => {
          if (moveGameId === gameId) {
            setGame(new Chess(fen));
          }
        });
        
        gameSocket.on('game-ended', ({ gameId: endGameId, gameResult: endResult, winner: endWinner }) => {
          if (endGameId === gameId) {
            setGameResult(endResult);
            setWinner(endWinner || undefined);
          }
        });
        
        gameSocket.on('player-disconnected', ({ userId: disconnectedUserId }) => {
          if (disconnectedUserId !== user.id) {
            console.log('Opponent disconnected');
          }
        });

        console.log('🔍 Debug: Game setup complete, setting isLoading to false');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setIsLoading(false);
      }
    };

    initializeGame();
  }, [user, gameId]);

  // Handle making moves
  const handleMove = (from: Square, to: Square) => {
    if (!socket || !gameData || !gameId) return;

    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({ from, to });
      
      if (move) {
        setGame(newGame);
        
        // Emit move to server
        socket.emit('make-move', {
          gameId,
          move: { from, to, piece: move.piece, color: move.color },
          fen: newGame.fen()
        });

        // Update game state via API
        apiClient.updateGame(gameId, {
          fen: newGame.fen(),
          move: { from, to, piece: move.piece, color: move.color }
        });

        // Check for game over
        if (newGame.isGameOver()) {
          let gameResult: 'white-wins' | 'black-wins' | 'draw' | 'abandoned';
          let winner: string | null = null;

          if (newGame.isCheckmate()) {
            gameResult = newGame.turn() === 'w' ? 'black-wins' : 'white-wins';
            winner = newGame.turn() === 'w' ? gameData.black! : gameData.white!;
          } else if (newGame.isDraw()) {
            gameResult = 'draw';
          } else if (newGame.isStalemate()) {
            gameResult = 'draw';
          } else {
            gameResult = 'abandoned';
          }

          setGameResult(gameResult);
          setWinner(winner);

          // Emit game over
          socket.emit('game-over', {
            gameId,
            gameResult,
            winner: winner || undefined
          });

          // Update game state via API
          apiClient.updateGame(gameId, {
            gameOver: true,
            gameResult,
            winner: winner || undefined
          });
        }
      }
    } catch (error) {
      console.error('Move failed:', error);
    }
  };

  if (isLoading) {
    console.log('🔍 Debug Render: Showing loading state');
    return (
      <div className="online-game">
        <div className="game-loading">
          <div className="loading-spinner"></div>
          <p>Loading game...</p>
          <p className="loading-details">Game ID: {gameId}</p>
          <p className="loading-details">User: {user?.displayName || user?.email}</p>
        </div>
      </div>
    );
  }

  if (role === 'spectator') {
    // Double-check if we actually have game data and user should be in the game
    if (gameData && user) {
      const isUserInGame = (gameData.white === user.id) || (gameData.black === user.id);
      if (isUserInGame) {
        console.log('🔍 Debug: Role is spectator but user should be in game, correcting role');
        // Correct the role immediately
        if (gameData.white === user.id) {
          setRole('white');
        } else if (gameData.black === user.id) {
          setRole('black');
        }
        // Continue to render the game board
      } else {
        console.log('🔍 Debug Render: Showing Access Denied - role is spectator and user not in game');
        console.log('🔍 Debug Render: Current state:', { role, gameId, user: user?.id, gameData });
        return (
          <div className="online-game">
            <div className="game-error">
              <h3>Access Denied</h3>
              <p>You are not a participant in this game.</p>
              <p>Debug: Role = {role}, User ID = {user?.id}</p>
              <p>Debug: Game Data = {JSON.stringify(gameData)}</p>
            </div>
          </div>
        );
      }
    } else {
      console.log('🔍 Debug Render: Showing Access Denied - role is spectator and no game data');
      return (
        <div className="online-game">
          <div className="game-error">
            <h3>Access Denied</h3>
            <p>You are not a participant in this game.</p>
            <p>Debug: Role = {role}, User ID = {user?.id}</p>
            <p>Debug: Game Data = {JSON.stringify(gameData)}</p>
          </div>
        </div>
      );
    }
  }

  if (gameResult) {
    console.log('🔍 Debug Render: Showing game over state');
    return (
      <div className="online-game">
        <div className="game-over">
          <h3>Game Over</h3>
          <p>
            {gameResult === 'white-wins' && 'White wins!'}
            {gameResult === 'black-wins' && 'Black wins!'}
            {gameResult === 'draw' && 'Game ended in a draw!'}
            {gameResult === 'abandoned' && 'Game abandoned!'}
          </p>
          {winner && <p>Winner: {winner}</p>}
        </div>
      </div>
    );
  }

  console.log('🔍 Debug Render: Showing game board - role:', role);
  return (
    <div className="online-game">
      <div className="game-info">
        <h3>Online Game</h3>
        <p>You are playing as: <strong>{role === 'white' ? 'White' : 'Black'}</strong></p>
        <p>Game ID: {gameId}</p>
      </div>
      
      <ChessBoard 
        externalGame={game} 
        onUserMove={handleMove}
        playerColor={role === 'spectator' ? undefined : role}
        isOnline={true}
      />
    </div>
  );
};

export default OnlineGame;


