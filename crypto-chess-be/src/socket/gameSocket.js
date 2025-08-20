const jwt = require('jsonwebtoken');
const { findUserById, findGameById, games, matchTickets } = require('../data/inMemoryDB');

const setupSocketHandlers = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userEmail} (${socket.userId})`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining a game room
    socket.on('join-game', (gameId) => {
      const game = findGameById(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Check if user is part of this game
      if (game.white !== socket.userId && game.black !== socket.userId) {
        socket.emit('error', { message: 'Access denied to this game' });
        return;
      }

      // Leave any previous game rooms
      socket.rooms.forEach(room => {
        if (room.startsWith('game:')) {
          socket.leave(room);
        }
      });

      // Join the game room
      socket.join(`game:${gameId}`);
      socket.currentGameId = gameId;
      
      console.log(`🎮 User ${socket.userEmail} joined game ${gameId}`);
      
      // Emit current game state to the user
      socket.emit('game-joined', { gameId, game });
      
      // Notify other players in the game
      socket.to(`game:${gameId}`).emit('player-joined', {
        userId: socket.userId,
        userEmail: socket.userEmail
      });
    });

    // Handle chess moves
    socket.on('make-move', (data) => {
      const { gameId, move, fen } = data;
      
      if (!socket.currentGameId || socket.currentGameId !== gameId) {
        socket.emit('error', { message: 'Not in this game' });
        return;
      }

      const game = findGameById(gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Update game state
      game.fen = fen;
      game.moves.push(move);
      game.lastActivity = new Date().toISOString();

      // Broadcast move to all players in the game
      io.to(`game:${gameId}`).emit('move-made', {
        gameId,
        move,
        fen,
        userId: socket.userId
      });

      console.log(`♟️ Move made in game ${gameId} by ${socket.userEmail}`);
    });

    // Handle game over
    socket.on('game-over', (data) => {
      const { gameId, gameResult, winner } = data;
      
      const game = findGameById(gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Update game state
      game.gameOver = true;
      game.gameResult = gameResult;
      game.winner = winner;
      game.lastActivity = new Date().toISOString();

      // Broadcast game over to all players
      io.to(`game:${gameId}`).emit('game-ended', {
        gameId,
        gameResult,
        winner
      });

      console.log(`🏁 Game ${gameId} ended: ${gameResult} (Winner: ${winner})`);
    });

    // Handle matchmaking
    socket.on('find-match', (data) => {
      const { preferredColor } = data;
      
      // Remove any existing tickets for this user
      const existingTicketIndex = matchTickets.findIndex(t => t.userId === socket.userId);
      if (existingTicketIndex !== -1) {
        matchTickets.splice(existingTicketIndex, 1);
      }

      // Create new matchmaking ticket
      const newTicket = {
        id: `ticket-${Date.now()}-${socket.userId}`,
        userId: socket.userId,
        userEmail: socket.userEmail,
        preferredColor: preferredColor || 'random',
        createdAt: new Date().toISOString()
      };

      matchTickets.push(newTicket);
      
      // Join matchmaking room
      socket.join('matchmaking');
      
      console.log(`🔍 User ${socket.userEmail} looking for match (${preferredColor})`);
      
      // Try to find a match immediately
      findMatch(socket);
    });

    // Handle canceling matchmaking
    socket.on('cancel-match', () => {
      // Remove ticket
      const ticketIndex = matchTickets.findIndex(t => t.userId === socket.userId);
      if (ticketIndex !== -1) {
        matchTickets.splice(ticketIndex, 1);
      }
      
      // Leave matchmaking room
      socket.leave('matchmaking');
      
      console.log(`❌ User ${socket.userEmail} canceled matchmaking`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userEmail} (${socket.userId})`);
      
      // Remove matchmaking ticket
      const ticketIndex = matchTickets.findIndex(t => t.userId === socket.userId);
      if (ticketIndex !== -1) {
        matchTickets.splice(ticketIndex, 1);
      }
      
      // Notify other players if they were in a game
      if (socket.currentGameId) {
        socket.to(`game:${socket.currentGameId}`).emit('player-disconnected', {
          userId: socket.userId,
          userEmail: socket.userEmail
        });
      }
    });
  });

  // Function to find matches for a user
  const findMatch = (socket) => {
    const userTicket = matchTickets.find(t => t.userId === socket.userId);
    if (!userTicket) return;

    // Look for compatible opponents
    const compatibleTickets = matchTickets.filter(t => 
      t.userId !== socket.userId && 
      (t.preferredColor === 'random' || 
       userTicket.preferredColor === 'random' || 
       t.preferredColor !== userTicket.preferredColor)
    );

    if (compatibleTickets.length > 0) {
      // Pick the first compatible opponent
      const opponentTicket = compatibleTickets[0];
      
      // Remove both tickets
      const userTicketIndex = matchTickets.findIndex(t => t.userId === socket.userId);
      const opponentTicketIndex = matchTickets.findIndex(t => t.userId === opponentTicket.userId);
      
      if (userTicketIndex !== -1) matchTickets.splice(userTicketIndex, 1);
      if (opponentTicketIndex !== -1) matchTickets.splice(opponentTicketIndex, 1);

      // Determine colors
      let white, black;
      if (userTicket.preferredColor === 'white' || opponentTicket.preferredColor === 'black') {
        white = socket.userId;
        black = opponentTicket.userId;
      } else if (userTicket.preferredColor === 'black' || opponentTicket.preferredColor === 'white') {
        white = opponentTicket.userId;
        black = socket.userId;
      } else {
        // Random assignment
        white = Math.random() < 0.5 ? socket.userId : opponentTicket.userId;
        black = white === socket.userId ? opponentTicket.userId : socket.userId;
      }

      // Create new game
      const newGame = {
        id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        white,
        black,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        moves: [],
        gameOver: false,
        winner: null,
        gameResult: null
      };

      games.push(newGame);

      // Debug logging
      console.log(`🔍 Debug: Added game to array. Total games now: ${games.length}`);
      console.log(`🔍 Debug: Game details:`, newGame);

      // Notify both users about the match
      io.to(`user:${white}`).emit('match-found', {
        gameId: newGame.id,
        color: 'white',
        opponent: findUserById(black)?.displayName || 'Opponent'
      });

      io.to(`user:${black}`).emit('match-found', {
        gameId: newGame.id,
        color: 'black',
        opponent: findUserById(white)?.displayName || 'Opponent'
      });

      console.log(`🎯 Match found! Game ${newGame.id} between ${findUserById(white)?.displayName} (white) and ${findUserById(black)?.displayName} (black)`);
    }
  };

  // Periodically try to match users
  setInterval(() => {
    const matchmakingSockets = Array.from(io.sockets.sockets.values())
      .filter(socket => socket.rooms.has('matchmaking'));

    matchmakingSockets.forEach(socket => {
      findMatch(socket);
    });
  }, 2000); // Check every 2 seconds
};

module.exports = { setupSocketHandlers };
