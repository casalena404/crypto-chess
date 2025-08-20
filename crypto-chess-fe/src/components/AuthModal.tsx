import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthModal.css';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to login mode and clear previous errors/inputs when opened
  useEffect(() => {
    if (open) {
      setMode('login');
      setError(null);
      setPassword('');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err: any) {
      let errorMessage = 'Authentication error';
      if (err?.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect email or password';
      } else if (err?.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (err?.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (err?.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
    onClose();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  return (
    <div 
      className="auth-backdrop" 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="auth-modal" 
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="auth-header">
          <h3 id="auth-modal-title">
            {mode === 'login' ? '♔ Sign In to Crypto Chess' : '♔ Create Account'}
          </h3>
          <button 
            className="auth-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={mode === 'register' ? 6 : undefined}
            />
          </div>
          
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-submit" 
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-switch">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={switchMode}
                className="auth-switch-btn"
              >
                Create one
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button 
                type="button"
                onClick={switchMode}
                className="auth-switch-btn"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;


