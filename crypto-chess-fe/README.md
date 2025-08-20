# Crypto Chess Frontend

A React-based chess game with online multiplayer capabilities.

## Features

- ♟️ Full chess game implementation
- 🌐 Online multiplayer with real-time updates
- 🔐 User authentication and profiles
- 🎯 Intelligent matchmaking system
- 📱 Responsive design for all devices

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

4. Make sure the backend server is running on port 5000

## Backend Integration

This frontend now uses a custom Express.js + Socket.IO backend instead of Firebase:

- **API Endpoints**: RESTful API for authentication, games, and matchmaking
- **Real-time Communication**: Socket.IO for live game updates
- **Authentication**: JWT-based authentication system
- **Matchmaking**: Intelligent player matching with color preferences

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run cypress:open` - Open Cypress test runner
- `npm run cypress:run` - Run Cypress tests

## Project Structure

```
src/
├── components/          # React components
│   ├── ChessBoard.tsx  # Main chess board
│   ├── OnlineGame.tsx  # Online game component
│   ├── OnlinePlay.tsx  # Matchmaking interface
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ...
├── services/           # API services
│   ├── api.ts         # HTTP API client
│   └── ...
└── hooks/              # Custom React hooks
```

## Backend Requirements

- Node.js backend running on port 5000
- Socket.IO server for real-time communication
- JWT authentication
- In-memory or persistent database for users and games

## Testing

The project includes comprehensive testing with:
- Jest for unit tests
- Cypress for end-to-end tests
- Component testing for React components

## Deployment

1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Ensure the backend is accessible from your frontend domain
4. Update environment variables for production

## Development Notes

- The frontend now communicates with a custom backend instead of Firebase
- Socket.IO handles real-time game updates
- JWT tokens are stored in localStorage for authentication
- All API calls go through the centralized `apiClient` service
