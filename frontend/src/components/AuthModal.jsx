import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AuthModal({ isOpen, onClose, initialMode }) {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState(initialMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('general');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        await register(email, password, businessName || 'My Business', businessType);
        // Auto-login after registration
        setAuthMode('login');
        setError('Registration successful! You can log in now.');
      } else {
        await login(email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-overlay show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', zIndex: 1010 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{authMode === 'login' ? 'Log In' : 'Create Account'}</h3>
          <button className="close-chat-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '8px', 
            backgroundColor: error.includes('successful') ? 'var(--color-success-light)' : 'var(--color-danger-light)', 
            color: error.includes('successful') ? 'var(--color-success)' : 'var(--color-danger)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {authMode === 'register' && (
            <>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Business Name</label>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder="e.g. Acme Restaurant" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Industry</label>
                <select 
                  className="select-input"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="general">General Retail</option>
                  <option value="restaurant">Restaurant & Cafe</option>
                  <option value="ecommerce">E-Commerce Store</option>
                  <option value="b2b">B2B Startup</option>
                </select>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email</label>
            <input 
              type="email" 
              className="text-input" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
            <input 
              type="password" 
              className="text-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '12px' }} disabled={loading}>
            {loading ? 'Processing...' : (authMode === 'login' ? 'Log In' : 'Create Account')}
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {authMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <span 
                  style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setAuthMode('register')}
                >
                  Sign Up
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span 
                  style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setAuthMode('login')}
                >
                  Log In
                </span>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
