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
      <main style={{ minHeight: '600px' }}>
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

      {/* Subtle Footer */}
      <footer style={{
        marginTop: '48px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          🍎 Apple Ecosystem Cockpit • Mac mini + MacBook + iPad
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Universal Control: Active</span>
          <span>Sidecar: Ready</span>
          <span>Handoff: 5GHz Subnet</span>
        </div>
      </footer>
    </div>
  );
}
