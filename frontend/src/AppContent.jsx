import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart3, 
  Settings, 
  LogOut, 
  Users,
  Utensils
} from 'lucide-react';

import './App.css'; 
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import UploadCenter from './components/UploadCenter';
import Reports from './components/Reports';
import ProfileSettings from './components/ProfileSettings';
import ChatBot from './components/ChatBot';
import AuthModal from './components/AuthModal';
import OnboardingWizard from './components/OnboardingWizard';
import PersonnelManager from './components/PersonnelManager';
import MenuManager from './components/MenuManager';

import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { api } from './services/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function AppContent() {
  const { token, user, logout, updateProfileState } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [viewMode, setViewMode] = useState(token ? 'app' : 'landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [onboardingComplete, setOnboardingComplete] = useState(localStorage.getItem('onboarding_complete') === 'true');
  
  // Chat History
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Hello! I am InsightAI, your AI financial advisor. I can analyze your business data and answer your financial questions. How can I help you today?' }
  ]);
  
  // Auth Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'
  
  // Chat States
  const [chatOpen, setChatOpen] = useState(false);
  
  // Business Data
  const [financialRecords, setFinancialRecords] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [menu, setMenu] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    setViewMode(token ? 'app' : 'landing');
  }, [token]);

  const handleOpenAuth = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = useCallback(() => {
    logout();
    setOnboardingComplete(false);
    setFinancialRecords([]);
    setTopProducts([]);
    setAiInsights([]);
  }, [logout]);

  const handleSaveSuccess = (newName, newType, newEmail) => {
    updateProfileState(newName, newType, newEmail);
  };

  // Loading Data and Profile
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await api.getProfile();
      updateProfileState(profile.business_name || 'My Business', profile.business_type);
      
      const data = await api.getData();
      setFinancialRecords(data.records || []);
      setTopProducts(data.products || []);

      const pData = await api.getPersonnel();
      setPersonnel(Array.isArray(pData) ? pData : []);

      const mData = await api.getMenu();
      setMenu(Array.isArray(mData) ? mData : []);
    } catch (err) {
      console.warn("Backend API connection error.", err);
    }
  }, [token, updateProfileState]);

  // AI Analizi Tetikleme
  const triggerAnalysis = useCallback(async (force = false) => {
    if (!token) return;
    try {
      const result = await api.analyze(force);
      setAiInsights(result.insights || []);
    } catch (err) {
      console.warn("Failed to retrieve backend analysis.");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  useEffect(() => {
    if (token && financialRecords.length > 0) {
      triggerAnalysis(false);
    }
  }, [financialRecords.length, token, triggerAnalysis]);

  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage handleOpenAuth={handleOpenAuth} />
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </>
    );
  }

  return (
    <div className="dashboard-layout">
      {token && !onboardingComplete && (
        <OnboardingWizard 
          businessName={user.businessName}
          businessType={user.businessType}
          onComplete={() => {
            setOnboardingComplete(true);
            localStorage.setItem('onboarding_complete', 'true');
          }}
        />
      )}
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon-box">I</div>
          <span className="logo-text">InsightAI</span>
        </div>
        
        <nav className="sidebar-menu">
          <button 
            className={`menu-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          
          <button 
            className={`menu-link ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={18} />
            <span>Upload Data</span>
          </button>

          {/* If business type is restaurant, add "Menu Management" tab */}
          {user.businessType === 'restaurant' && (
            <button 
              className={`menu-link ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              <Utensils size={18} />
              <span>Menu Management</span>
            </button>
          )}

          {/* Add "Personnel & Shifts" tab for all business types */}
          <button 
            className={`menu-link ${activeTab === 'personnel' ? 'active' : ''}`}
            onClick={() => setActiveTab('personnel')}
          >
            <Users size={18} />
            <span>Personnel & Shifts</span>
            {personnel.some(p => p.overtime_hours > 0) && (
              <span style={{ 
                backgroundColor: 'var(--color-danger)', 
                color: 'white', 
                borderRadius: '50%', 
                width: '18px', 
                height: '18px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.75rem', 
                fontWeight: 'bold', 
                marginLeft: 'auto' 
              }}>!</span>
            )}
          </button>
          
          <button 
            className={`menu-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={18} />
            <span>Detailed Reports</span>
          </button>
          
          <button 
            className={`menu-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-user-info" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div className="user-avatar">{user.businessName.charAt(0).toUpperCase()}</div>
              <div className="user-meta" style={{ minWidth: 0 }}>
                <span className="user-name">{user.businessName}</span>
                <span className="user-role">
                  {user.businessType === 'restaurant' ? 'Restaurant & Cafe' :
                   user.businessType === 'ecommerce' ? 'E-Commerce' :
                   user.businessType === 'b2b' ? 'B2B Startup' : 'General Retail'}
                </span>
              </div>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme" style={{ flexShrink: 0 }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          {/* Overtime Alert */}
          {personnel.some(p => p.overtime_hours > 0) && (
            <div className="sidebar-alert" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-start', 
              gap: '0.25rem', 
              padding: '0.65rem 0.75rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid var(--color-danger)', 
              borderRadius: '6px', 
              color: 'var(--color-danger)',
              fontSize: '0.8rem', 
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
              width: '100%'
            }}>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>⚠️ Overtime Workers:</span>
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', width: '100%', opacity: 0.9 }}>
                {personnel.filter(p => p.overtime_hours > 0).map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>• {p.name} {p.surname ? p.surname[0] + '.' : ''}</span>
                    <span style={{ fontWeight: 600 }}>{p.overtime_hours} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main-content-area">
        {activeTab === 'dashboard' && (
          <Dashboard 
            businessName={user.businessName}
            businessType={user.businessType}
            financialRecords={financialRecords}
            topProducts={topProducts}
            aiInsights={aiInsights}
            setChatOpen={setChatOpen}
            token={token}
            apiBase={API_BASE}
            setActiveTab={setActiveTab}
            triggerAnalysis={triggerAnalysis}
          />
        )}

        {activeTab === 'upload' && (
          <UploadCenter 
            token={token}
            apiBase={API_BASE}
            onUploadSuccess={() => { fetchData(); setActiveTab('dashboard'); }}
          />
        )}

        {activeTab === 'menu' && user.businessType === 'restaurant' && (
          <MenuManager 
            businessType={user.businessType}
            onDataChange={() => { fetchData(); triggerAnalysis(true); }}
          />
        )}

        {activeTab === 'personnel' && (
          <PersonnelManager 
            onDataChange={() => { fetchData(); triggerAnalysis(true); }}
          />
        )}

        {activeTab === 'reports' && (
          <Reports 
            financialRecords={financialRecords}
            personnel={personnel}
            menu={menu}
            businessType={user.businessType}
            businessName={user.businessName}
          />
        )}

        {activeTab === 'settings' && (
          <ProfileSettings 
            businessName={user.businessName}
            setBusinessName={(val) => updateProfileState(val, user.businessType, user.email)}
            businessType={user.businessType}
            setBusinessType={(val) => updateProfileState(user.businessName, val, user.email)}
            email={user.email}
            onSaveSuccess={handleSaveSuccess}
          />
        )}
      </main>

      {/* AI CHAT PANEL */}
      <ChatBot 
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        token={token}
        apiBase={API_BASE}
        messages={chatMessages}
        setMessages={setChatMessages}
        financialRecords={financialRecords}
      />
    </div>
  );
}

export default AppContent;
