# Crypto Chess 🎮♟️

A real-time online chess game built with modern web technologies.

## 🚀 Features

- **Real-time Gameplay**: Socket.IO for live chess moves
- **Smart Matchmaking**: Random color assignment with custom preferences
- **Board Orientation**: Different perspectives for white/black players
- **Modern UI**: Clean, responsive design with custom chess pieces
- **Authentication**: JWT-based user system
- **Online Multiplayer**: Play against other players in real-time

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing
- **In-memory database** (development)

### Frontend
- **React** + **TypeScript**
- **Chess.js** for game logic
- **Custom CSS** for styling
- **Socket.IO Client** for real-time updates

## 🏗️ Project Structure

```
crypto-chess/
├── crypto-chess-be/          # Backend server
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── socket/           # Socket.IO handlers
│   │   ├── middleware/       # Auth middleware
│   │   └── data/             # Database
│   └── package.json
├── crypto-chess-fe/          # Frontend app
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # API & Socket clients
│   │   └── hooks/            # Custom hooks
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
```bash
cd crypto-chess-be
npm install
npm run dev
```

### Frontend Setup
```bash
cd crypto-chess-fe
npm install
npm start
```

### Environment Variables
Create `.env` files in both directories:

**Backend (.env)**
```env
PORT=5001
JWT_SECRET=your-secret-key
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5001
```

## 🎯 How to Play

1. **Register/Login** with your email
2. **Click "Find Match (Random Color)"** to start matchmaking
3. **Wait for opponent** to join
4. **Play chess** in real-time!

## 🎨 Game Features

- **Random Color Assignment**: Players get random white/black
- **Board Perspective**: Each player sees board from their side
- **Real-time Moves**: Instant move synchronization
- **Game State**: Automatic game over detection
- **Clean Interface**: Minimalist design focused on gameplay

## 🔧 Development

### Backend Commands
```bash
npm run dev      # Start with nodemon
npm start        # Start production
npm test         # Run tests
```

### Frontend Commands
```bash
npm start        # Start development server
npm build        # Build for production
npm test         # Run tests
npm run eject    # Eject from Create React App
```

## 📱 Deployment

### Backend Deployment
- Deploy to Heroku, Railway, or any Node.js hosting
- Set environment variables
- Ensure WebSocket support

### Frontend Deployment
- Build with `npm run build`
- Deploy to Netlify, Vercel, or any static hosting
- Update API URL in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎮 Live Demo

[Play Crypto Chess Online](https://your-deployment-url.com)

---

**Happy Chess Playing! ♟️✨**
