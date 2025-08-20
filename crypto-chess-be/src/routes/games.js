const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { games, matchTickets } = require('../data/inMemoryDB');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all games for a user
router.get('/', authenticateToken, (req, res) => {
  try {
    const userGames = games.filter(game => 
      game.white === req.user.userId || 
      game.black === req.user.userId
    );

    res.json({ games: userGames });
  } catch (error) {
    console.error('Fetch games error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific game
router.get('/:gameId', authenticateToken, (req, res) => {
  try {
    const { gameId } = req.params;
    const game = games.find(g => g.id === gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is part of this game
    if (game.white !== req.user.userId && game.black !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ game });
  } catch (error) {
    console.error('Fetch game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new game
router.post('/', authenticateToken, (req, res) => {
  try {
    const { opponentId, color } = req.body;
    
    if (!opponentId) {
      return res.status(400).json({ error: 'Opponent ID is required' });
    }

    const newGame = {
      id: uuidv4(),
      white: color === 'black' ? opponentId : req.user.userId,
      black: color === 'black' ? req.user.userId : opponentId,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      moves: [],
      gameOver: false,
      winner: null,
      gameResult: null
    };

    games.push(newGame);

    res.status(201).json({ game: newGame });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update game state
router.put('/:gameId', authenticateToken, (req, res) => {
  try {
    const { gameId } = req.params;
    const { fen, move, gameOver, winner, gameResult } = req.body;

    const game = games.find(g => g.id === gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is part of this game
    if (game.white !== req.user.userId && game.black !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update game state
    if (fen) game.fen = fen;
    if (move) game.moves.push(move);
    if (gameOver !== undefined) game.gameOver = gameOver;
    if (winner !== undefined) game.winner = winner;
    if (gameResult !== undefined) game.gameResult = gameResult;
    
    game.lastActivity = new Date().toISOString();

    res.json({ game });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get matchmaking tickets
router.get('/matchmaking/tickets', authenticateToken, (req, res) => {
  try {
    // Filter out expired tickets (older than 5 minutes)
    const now = new Date();
    const validTickets = matchTickets.filter(ticket => {
      const ticketTime = new Date(ticket.createdAt);
      return (now - ticketTime) < 5 * 60 * 1000; // 5 minutes
    });

    res.json({ tickets: validTickets });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create matchmaking ticket
router.post('/matchmaking/tickets', authenticateToken, (req, res) => {
  try {
    const { preferredColor } = req.body;

    // Remove any existing tickets for this user
    const existingTicketIndex = matchTickets.findIndex(t => t.userId === req.user.userId);
    if (existingTicketIndex !== -1) {
      matchTickets.splice(existingTicketIndex, 1);
    }

    const newTicket = {
      id: uuidv4(),
      userId: req.user.userId,
      preferredColor: preferredColor || 'random',
      createdAt: new Date().toISOString()
    };

    matchTickets.push(newTicket);

    res.status(201).json({ ticket: newTicket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete matchmaking ticket
router.delete('/matchmaking/tickets/:ticketId', authenticateToken, (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticketIndex = matchTickets.findIndex(t => t.id === ticketId);

    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user owns this ticket
    if (matchTickets[ticketIndex].userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    matchTickets.splice(ticketIndex, 1);
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get online players count
router.get('/matchmaking/online', (req, res) => {
  try {
    const onlineCount = matchTickets.length;
    res.json({ onlineCount });
  } catch (error) {
    console.error('Online count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint - get all games (remove in production)
router.get('/debug/all-games', (req, res) => {
  try {
    res.json({ 
      games, 
      totalGames: games.length,
      matchTickets,
      totalTickets: matchTickets.length
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
