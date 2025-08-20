// In-memory database for development
// In production, you would use a real database like PostgreSQL, MongoDB, etc.

// Users storage
const users = [
  // Sample user for testing
  {
    id: 'test-user-1',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    displayName: 'Test User',
    rating: 1200,
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  },
  // Add the users that were trying to login
  {
    id: 'player1-id',
    email: 'player1@gmail.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    displayName: 'Player 1',
    rating: 1200,
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  },
  {
    id: 'player2-id',
    email: 'player2@gmail.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    displayName: 'Player 2',
    rating: 1200,
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  }
];

// Games storage
const games = [
  // Sample game for testing
  {
    id: 'test-game-1',
    white: 'test-user-1',
    black: 'test-user-2',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    moves: [],
    gameOver: false,
    winner: null,
    gameResult: null
  }
];

// Matchmaking tickets storage
const matchTickets = [];

// Helper functions for data management
const findUserById = (id) => users.find(u => u.id === id);
const findUserByEmail = (email) => users.find(u => u.email === email);
const findGameById = (id) => games.find(g => g.id === id);
const findTicketByUserId = (userId) => matchTickets.find(t => t.userId === userId);

// Clean up expired data periodically
// setInterval(() => {
//   const now = new Date();
  
//   // Clean up expired matchmaking tickets (older than 5 minutes)
//   const validTickets = matchTickets.filter(ticket => {
//     const ticketTime = new Date(ticket.createdAt);
//     return (now - ticketTime) < 5 * 60 * 1000; // 5 minutes
//   });
  
//   // Replace the array with valid tickets only
//   matchTickets.length = 0;
//   matchTickets.push(...validTickets);
  
//   console.log(`🧹 Cleaned up expired data. Active tickets: ${matchTickets.length}`);
// }, 60000); // Run every minute

module.exports = {
  users,
  games,
  matchTickets,
  findUserById,
  findUserByEmail,
  findGameById,
  findTicketByUserId
};
