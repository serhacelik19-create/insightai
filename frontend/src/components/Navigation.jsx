import React from 'react';
import { LayoutDashboard, UploadCloud, BarChart3, Settings, LogOut, ArrowLeft } from 'lucide-react';

function Navigation({ activeTab, setActiveTab, setViewMode, onLogout }) {
  return (
    <div className="floating-nav">
      <button 
        className="nav-item"
        onClick={() => setViewMode('landing')}
        title="Ana Sayfaya Dön"
      >
        <ArrowLeft size={20} />
      </button>

      <button 
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
        title="Dashboard"
      >
        <LayoutDashboard size={20} />
      </button>

      <button 
        className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
        onClick={() => setActiveTab('upload')}
        title="Veri Yükleme"
      >
        <UploadCloud size={20} />
      </button>

      <button 
        className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
        onClick={() => setActiveTab('reports')}
        title="Raporlar"
      >
        <BarChart3 size={20} />
      </button>

      <button 
        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
        title="Ayarlar"
      >
        <Settings size={20} />
      </button>

      <button 
        className="nav-item"
        onClick={onLogout}
        style={{ color: 'var(--color-danger)' }}
        title="Çıkış Yap"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}

export default Navigation;
