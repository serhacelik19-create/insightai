import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, UploadCloud, BarChart3, Settings, 
  LogOut, Users, Utensils
} from 'lucide-react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import ChatBot from './ChatBot';
import OnboardingWizard from './OnboardingWizard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function SidebarLayout() {
  const { token, user, logout, updateProfileState } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [onboardingComplete, setOnboardingComplete] = useState(localStorage.getItem('onboarding_complete') === 'true');
  
  // Chat History
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Hello! I am InsightAI, your AI financial advisor. I can analyze your business data and answer your financial questions. How can I help you today?' }
  ]);
  
  const [chatOpen, setChatOpen] = useState(false);
  
  // Business Data
  const [financialRecords, setFinancialRecords] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [menu, setMenu] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(() => {
    logout();
    setOnboardingComplete(false);
    setFinancialRecords([]);
    setTopProducts([]);
    setAiInsights([]);
  }, [logout]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [token, updateProfileState]);

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

  const outletContext = {
    businessName: user.businessName,
    businessType: user.businessType,
    financialRecords,
    topProducts,
    aiInsights,
    personnel,
    menu,
    setChatOpen,
    token,
    apiBase: API_BASE,
    triggerAnalysis,
    fetchData,
    isLoading
  };

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

      <aside className="sidebar glass-effect">
        <div className="sidebar-logo">
          <div className="logo-icon-box">I</div>
          <span className="logo-text">InsightAI</span>
        </div>
        
        <nav className="sidebar-menu">
          <NavLink to="/app/dashboard" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>
          
          <NavLink to="/app/upload" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
            <UploadCloud size={18} />
            <span>Upload Data</span>
          </NavLink>

          {user.businessType === 'restaurant' && (
            <NavLink to="/app/menu" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
              <Utensils size={18} />
              <span>Menu Management</span>
            </NavLink>
          )}

          <NavLink to="/app/personnel" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Personnel & Shifts</span>
            {personnel.some(p => p.overtime_hours > 0) && (
              <span className="sidebar-badge danger-badge">!</span>
            )}
          </NavLink>
          
          <NavLink to="/app/reports" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span>Detailed Reports</span>
          </NavLink>
          
          <NavLink to="/app/settings" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="user-info-inner">
              <div className="user-avatar">{user.businessName.charAt(0).toUpperCase()}</div>
              <div className="user-meta">
                <span className="user-name">{user.businessName}</span>
                <span className="user-role">
                  {user.businessType === 'restaurant' ? 'Restaurant & Cafe' :
                   user.businessType === 'ecommerce' ? 'E-Commerce' :
                   user.businessType === 'b2b' ? 'B2B Startup' : 'General Retail'}
                </span>
              </div>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          {personnel.some(p => p.overtime_hours > 0) && (
            <div className="sidebar-alert">
              <div className="alert-header">
                <span>⚠️ Overtime Workers:</span>
              </div>
              <div className="alert-body">
                {personnel.filter(p => p.overtime_hours > 0).map((p, idx) => (
                  <div key={idx} className="alert-row">
                    <span>• {p.name} {p.surname ? p.surname[0] + '.' : ''}</span>
                    <span className="bold-text">{p.overtime_hours} hrs</span>
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

      <main className="main-content-area">
        <Outlet context={outletContext} />
      </main>

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

export default SidebarLayout;
