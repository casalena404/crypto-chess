import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// API client for HTTP requests
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication endpoints
  async register(email: string, password: string, displayName?: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  async updateProfile(displayName: string) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ displayName }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Game endpoints
  async getGames() {
    return this.request('/api/games');
  }

  async getGame(gameId: string) {
    return this.request(`/api/games/${gameId}`);
  }

  async createGame(opponentId: string, color?: 'white' | 'black') {
    return this.request('/api/games', {
      method: 'POST',
      body: JSON.stringify({ opponentId, color }),
    });
  }

  async updateGame(gameId: string, data: {
    fen?: string;
    move?: any;
    gameOver?: boolean;
    winner?: string;
    gameResult?: string;
  }) {
    return this.request(`/api/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Matchmaking endpoints
  async getMatchmakingTickets() {
    return this.request('/api/games/matchmaking/tickets');
  }

  async createMatchmakingTicket(preferredColor?: 'white' | 'black' | 'random') {
    return this.request('/api/games/matchmaking/tickets', {
      method: 'POST',
      body: JSON.stringify({ preferredColor }),
    });
  }

  async deleteMatchmakingTicket(ticketId: string) {
    return this.request(`/api/games/matchmaking/tickets/${ticketId}`, {
      method: 'DELETE',
    });
  }

  async getOnlineCount() {
    return this.request('/api/games/matchmaking/online');
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }
}

// Socket.IO client for real-time communication
class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  connect() {
    if (!this.token) {
      throw new Error('Token required to connect to socket');
    }

    this.socket = io(API_BASE_URL, {
      auth: {
        token: this.token,
      },
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to game server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from game server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export instances
export const apiClient = new ApiClient(API_BASE_URL);
export const socketClient = new SocketClient();

// Export types
export interface User {
  id: string;
  email: string;
  displayName: string;
  rating: number;
  createdAt: string;
  lastSeen: string;
}

export interface Game {
  id: string;
  white: string;
  black: string;
  fen: string;
  createdAt: string;
  lastActivity: string;
  moves: any[];
  gameOver: boolean;
  winner: string | null;
  gameResult: string | null;
}

export interface MatchmakingTicket {
  id: string;
  userId: string;
  userEmail: string;
  preferredColor: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface GamesResponse {
  games: Game[];
}

export interface GameResponse {
  game: Game;
}

export interface TicketsResponse {
  tickets: MatchmakingTicket[];
}

export interface OnlineResponse {
  onlineCount: number;
}
