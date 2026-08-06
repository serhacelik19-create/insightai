import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

function ProfileSettings() {
  const { user, updateProfileState } = useAuth();
  
  const [bName, setBName] = useState(user?.businessName || '');
  const [bType, setBType] = useState(user?.businessType || 'general');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [password, setPassword] = useState('');
  const [credLoading, setCredLoading] = useState(false);
  const [credStatus, setCredStatus] = useState('');

  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      await api.updateProfile(bName, bType);
      setStatusMessage('Profile updated successfully!');
      updateProfileState(bName, bType);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.warn("Failed to save profile settings.", err);
      setStatusMessage(err.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setCredLoading(true);
    setCredStatus('');

    try {
      await api.updateCredentials(userEmail, password);
      setCredStatus('Credentials updated successfully!');
      setPassword('');
      updateProfileState(bName, bType);
      setTimeout(() => setCredStatus(''), 3000);
    } catch (err) {
      console.warn("Failed to update credentials.", err);
      setCredStatus(err.message || 'Failed to update credentials.');
    } finally {
      setCredLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h2 className="widget-title">Business Settings & Profile</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Update your business name and industry type to help the AI analysis engine generate more accurate and customized insights.
      </p>

      <form className="settings-form" onSubmit={handleSaveProfile}>
        <div className="form-group">
          <label htmlFor="b_name">Business Name</label>
          <input 
            type="text" 
            id="b_name"
            className="text-input"
            value={bName}
            onChange={(e) => setBName(e.target.value)}
            placeholder="e.g., Coffee House, E-Shop"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="b_type">Business Industry</label>
          <select 
            id="b_type"
            className="select-input"
            style={{ height: '45px' }}
            value={bType}
            onChange={(e) => setBType(e.target.value)}
          >
            <option value="general">General Retail</option>
            <option value="restaurant">Restaurant & Cafe</option>
            <option value="ecommerce">E-Commerce</option>
            <option value="b2b">B2B SaaS / Subscription Model</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
            Changing your industry automatically updates dashboard widgets and the nature of AI financial suggestions.
          </span>
        </div>

        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      {statusMessage && (
        <div 
          className="insight-item" 
          style={{ 
            marginTop: '2rem',
            borderLeftColor: statusMessage.includes('successfully') ? 'var(--color-success)' : 'var(--color-danger)',
            backgroundColor: statusMessage.includes('successfully') ? 'var(--color-success-light)' : 'var(--color-danger-light)',
          }}
        >
          <div className="insight-icon-wrapper">
            <CheckCircle size={18} style={{ color: statusMessage.includes('successfully') ? 'var(--color-success)' : 'var(--color-danger)' }} />
          </div>
          <div className="insight-content-area">
            <span className="insight-description-text">{statusMessage}</span>
          </div>
        </div>
      )}

      <hr style={{ margin: '2.5rem 0', borderColor: '#e2e8f0' }} />

      <h2 className="widget-title" style={{ marginTop: '1rem' }}>Login Credentials</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Change your login email address and security password.
      </p>

      <form className="settings-form" onSubmit={handleSaveCredentials}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email"
            className="text-input"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="e.g., info@company.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input 
            type="password" 
            id="password"
            className="text-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }} disabled={credLoading}>
          {credLoading ? 'Updating...' : 'Update Credentials'}
        </button>
      </form>

      {credStatus && (
        <div 
          className="insight-item" 
          style={{ 
            marginTop: '2rem',
            borderLeftColor: credStatus.includes('successfully') ? 'var(--color-success)' : 'var(--color-danger)',
            backgroundColor: credStatus.includes('successfully') ? 'var(--color-success-light)' : 'var(--color-danger-light)',
          }}
        >
          <div className="insight-icon-wrapper">
            <CheckCircle size={18} style={{ color: credStatus.includes('successfully') ? 'var(--color-success)' : 'var(--color-danger)' }} />
          </div>
          <div className="insight-content-area">
            <span className="insight-description-text">{credStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSettings;
