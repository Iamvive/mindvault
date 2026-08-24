import React, { useState } from 'react';
import { Monitor, Share2, Copy, RefreshCw, Wrench, ExternalLink, Zap, CheckCircle2 } from 'lucide-react';

export default function QuickActionDock({ onTriggerAction, onTriggerRepair, isRefreshing, onRefresh }) {
  const [activeFeedback, setActiveFeedback] = useState('');

  const handleAction = async (actionId, label) => {
    setActiveFeedback(label);
    if (actionId === 'refresh') {
      await onRefresh();
    } else {
      await onTriggerRepair(actionId);
    }
    setTimeout(() => setActiveFeedback(''), 2500);
  };

  const actions = [
    {
      id: 'launch-screenshare',
      title: 'Remote Screen Share to Mac mini',
      desc: 'Opens native macOS Screen Sharing app connected to local VNC port 5900',
      icon: Monitor,
      color: 'var(--sg-primary)',
      btnLabel: 'Launch Screen Share'
    },
    {
      id: 'trigger-airdrop',
      title: 'Open Native AirDrop Window',
      desc: 'Instantly opens AirDrop in Finder to discover MacBook and iPad for file dropping',
      icon: Share2,
      color: '#64d2ff',
      btnLabel: 'Open AirDrop'
    },
    {
      id: 'clipboard-ping',
      title: 'Broadcast Clipboard Heartbeat',
      desc: 'Sends a lightweight cross-device sync ping to wake up Universal Clipboard',
      icon: Copy,
      color: '#ffd60a',
      btnLabel: 'Send Ping'
    },
    {
      id: 'restart-sharingd',
      title: 'Restart Apple Handoff Daemon',
      desc: 'Soft-restarts sharingd to fix hung Universal Control or AirDrop sessions',
      icon: Wrench,
      color: '#ff6b7e',
      btnLabel: 'Restart sharingd'
    },
    {
      id: 'flush-dns',
      title: 'Flush Bonjour / mDNS Cache',
      desc: 'Refreshes local subnet peer discovery for Sidecar and Apple AirPlay',
      icon: RefreshCw,
      color: 'var(--status-online)',
      btnLabel: 'Flush Cache'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 className="display-2">Quick Action Dock</h2>
            <p style={{ marginTop: '4px' }}>
              One-tap triggers to launch remote connections, file drops, and daemon health resets
            </p>
          </div>
          {activeFeedback && (
            <span className="chip chip-online">
              <CheckCircle2 size={13} />
              {activeFeedback}
            </span>
          )}
        </div>

        {/* Action Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <div 
                key={act.id} 
                className="glass-card"
                style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-wash-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={22} style={{ color: act.color }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {act.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {act.desc}
                    </p>
                  </div>
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleAction(act.id, act.title)}
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '8px 16px', width: '100%', justifyContent: 'center' }}
                  >
                    <Zap size={14} />
                    {act.btnLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
