# Crypto Chess Backend

A Node.js backend for the Crypto Chess game using Express.js and Socket.IO.

## Features

- 🔐 JWT-based authentication
- ♟️ Real-time chess game management
- 🎯 Intelligent matchmaking system
- 📡 WebSocket communication for live gameplay
- 🧹 Automatic cleanup of expired data

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

4. For production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Games
- `GET /api/games` - Get user's games
- `GET /api/games/:gameId` - Get specific game
- `POST /api/games` - Create new game
- `PUT /api/games/:gameId` - Update game state

### Matchmaking
- `GET /api/games/matchmaking/tickets` - Get matchmaking tickets
- `POST /api/games/matchmaking/tickets` - Create matchmaking ticket
- `DELETE /api/games/matchmaking/tickets/:ticketId` - Delete ticket
- `GET /api/games/matchmaking/online` - Get online players count

## Socket.IO Events

### Client to Server
- `join-game` - Join a game room
- `make-move` - Make a chess move
- `game-over` - End the game
- `find-match` - Start matchmaking
- `cancel-match` - Cancel matchmaking

### Server to Client
- `game-joined` - Confirmation of joining a game
- `player-joined` - Notification when opponent joins
- `move-made` - Broadcast of chess moves
- `game-ended` - Game over notification
- `match-found` - Matchmaking success
- `player-disconnected` - Opponent disconnected

## Data Structure

### User
```javascript
{
  id: string,
  email: string,
  password: string, // hashed
  displayName: string,
  rating: number,
  createdAt: string,
  lastSeen: string
}
```

### Game
```javascript
{
  id: string,
  white: string, // user ID
  black: string, // user ID
  fen: string, // chess position
  createdAt: string,
  lastActivity: string,
  moves: array,
  gameOver: boolean,
  winner: string,
  gameResult: string
}
```

### Matchmaking Ticket
```javascript
{
  id: string,
  userId: string,
  userEmail: string,
  preferredColor: string,
  createdAt: string
}
```

## Development Notes

- Currently uses in-memory storage for development
- In production, consider using PostgreSQL for users/games and Redis for matchmaking
- JWT tokens expire after 7 days
- Matchmaking tickets expire after 5 minutes
- Automatic cleanup runs every minute

## Testing

```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong, unique `JWT_SECRET`
3. Configure proper CORS origins
4. Use environment variables for all sensitive data
5. Consider using a process manager like PM2
6. Set up proper logging and monitoring
