import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadCenter from './pages/UploadCenter';
import Reports from './pages/Reports';
import ProfileSettings from './pages/ProfileSettings';
import AuthModal from './components/AuthModal';
import PersonnelManager from './pages/PersonnelManager';
import MenuManager from './pages/MenuManager';
import SidebarLayout from './components/SidebarLayout';

import './App.css';

function AppContent() {
  const { token, loading } = useAuth();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  
  const handleOpenAuth = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ animation: 'pulse 2s infinite', color: 'var(--color-primary)' }}>Loading...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage handleOpenAuth={handleOpenAuth} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </>
    );
  }

  return (
    <Routes>
      <Route path="/app" element={<SidebarLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<UploadCenter />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="personnel" element={<PersonnelManager />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<ProfileSettings />} />
        <Route index element={<Navigate to="/app/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}

export default AppContent;
