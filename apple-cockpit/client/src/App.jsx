import React, { useState } from 'react';
import Header from './components/Header';
import TopologyRadar from './components/TopologyRadar';
import DeskArrangement from './components/DeskArrangement';
import DiagnosticCenter from './components/DiagnosticCenter';
import MasterPlaybook from './components/MasterPlaybook';
import QuickActionDock from './components/QuickActionDock';
import { useCockpitState } from './hooks/useCockpitState';

export default function App() {
  const [activeTab, setActiveTab] = useState('radar');
  const {
    topology,
    diagnostics,
    hostInfo,
    isConnected,
    isRefreshing,
    actionLog,
    refresh,
    triggerRepair
  } = useCockpitState();

  const handleTriggerAction = async (actionId) => {
    return await triggerRepair(actionId);
  };

  return (
    <div className="container">
      {/* Global Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hostInfo={hostInfo}
        diagnostics={diagnostics}
        isConnected={isConnected}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Main View Router */}
      <main style={{ minHeight: '520px' }}>
        {activeTab === 'radar' && (
          <TopologyRadar 
            topology={topology}
            hostInfo={hostInfo}
            onTriggerAction={handleTriggerAction}
          />
        )}

        {activeTab === 'desk' && (
          <DeskArrangement />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticCenter 
            diagnostics={diagnostics}
            onTriggerRepair={triggerRepair}
            actionLog={actionLog}
          />
        )}

        {activeTab === 'playbook' && (
          <MasterPlaybook 
            onTriggerAction={handleTriggerAction}
          />
        )}

        {activeTab === 'dock' && (
          <QuickActionDock 
            onTriggerAction={handleTriggerAction}
            onTriggerRepair={triggerRepair}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
          />
        )}
      </main>

      {/* Subtle Luxury Footer */}
      <footer style={{
        marginTop: '3rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-hairline)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.8rem',
        color: 'var(--sg-mute)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🍎 Apple Ecosystem Cockpit</span>
          <span style={{ color: 'var(--border-hairline)' }}>•</span>
          <span>Mac mini + MacBook + iPad</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontWeight: 500 }}>
          <span>Universal Control: Active</span>
          <span>Sidecar: Ready</span>
          <span>Subnet: Synced</span>
        </div>
      </footer>
    </div>
  );
}
