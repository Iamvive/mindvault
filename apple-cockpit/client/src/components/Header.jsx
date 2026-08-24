import React from 'react';
import { Radio, RefreshCw, Layout, Activity, BookOpen, Zap } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  hostInfo, 
  diagnostics, 
  isConnected, 
  isRefreshing, 
  onRefresh 
}) {
  const score = diagnostics?.score ?? 100;
  const isHealthy = score >= 85;

  const tabs = [
    { id: 'radar', label: 'Ecosystem Radar', icon: Radio },
    { id: 'desk', label: 'Desk Studio', icon: Layout },
    { id: 'diagnostics', label: 'Diagnostics & Fix', icon: Activity, badge: !isHealthy ? '!' : null },
    { id: 'playbook', label: 'Master Playbook', icon: BookOpen },
    { id: 'dock', label: 'Quick Dock', icon: Zap }
  ];

  return (
    <header style={{
      marginBottom: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src="/app-icon.jpg" 
            alt="Apple Ecosystem Cockpit Icon" 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              objectFit: 'cover',
              border: '1px solid var(--border-hairline)',
              boxShadow: 'var(--shadow-subtle)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1>Apple Ecosystem Cockpit</h1>
              <span className="badge-pill badge-alert" style={{ fontSize: '0.68rem' }}>
                {hostInfo?.deviceType ? `Host: ${hostInfo.deviceType}` : 'Host: macOS'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--sg-mute)', marginTop: '2px' }}>
              Seamless Orchestration for Mac mini • MacBook • iPad
            </p>
          </div>
        </div>

        {/* Global Health & Live Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sync Status Badge */}
          <div className="live-indicator">
            <span className={`live-dot ${isConnected ? 'pulsing' : ''}`} style={{
              backgroundColor: isConnected ? (isHealthy ? 'var(--sg-success)' : 'var(--sg-warn)') : 'var(--sg-mute)'
            }} />
            <span>{isConnected ? `${score}% Ecosystem Health` : 'Offline Mode'}</span>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn-secondary"
            title="Refresh Diagnostics & Services"
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRefreshing ? 'Auditing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Pill Bar */}
      <nav className="tab-pill-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-pill-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--sg-warn)'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
