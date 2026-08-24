import React, { useState } from 'react';
import { Monitor, Share2, Copy, RefreshCw, Wrench, Zap, CheckCircle2 } from 'lucide-react';

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
      color: 'var(--border-active)',
      btnLabel: 'Launch Screen Share'
    },
    {
      id: 'trigger-airdrop',
      title: 'Open Native AirDrop Window',
      desc: 'Instantly opens AirDrop in Finder to discover MacBook and iPad for file dropping',
      icon: Share2,
      color: 'var(--sg-accent-blue)',
      btnLabel: 'Open AirDrop'
    },
    {
      id: 'clipboard-ping',
      title: 'Broadcast Clipboard Heartbeat',
      desc: 'Sends a lightweight cross-device sync ping to wake up Universal Clipboard',
      icon: Copy,
      color: 'var(--sg-accent-purple)',
      btnLabel: 'Send Ping'
    },
    {
      id: 'restart-sharingd',
      title: 'Restart Apple Handoff Daemon',
      desc: 'Soft-restarts sharingd to fix hung Universal Control or AirDrop sessions',
      icon: Wrench,
      color: 'var(--border-active)',
      btnLabel: 'Restart sharingd'
    },
    {
      id: 'flush-dns',
      title: 'Flush Bonjour / mDNS Cache',
      desc: 'Refreshes local subnet peer discovery for Sidecar and Apple AirPlay',
      icon: RefreshCw,
      color: 'var(--sg-success)',
      btnLabel: 'Flush Cache'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="wealth-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="display-2">Quick Action Dock</h2>
            <p style={{ marginTop: '4px', fontSize: '0.88rem', color: 'var(--sg-mute)' }}>
              One-tap triggers to launch remote connections, file drops, and daemon health resets
            </p>
          </div>
          {activeFeedback && (
            <span className="badge-pill badge-success">
              <CheckCircle2 size={12} />
              {activeFeedback}
            </span>
          )}
        </div>

        {/* Action Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <div 
                key={act.id} 
                className="wealth-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'var(--surface-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid var(--border-glow)'
                  }}>
                    <Icon size={20} style={{ color: act.color }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--sg-ink)', marginBottom: '3px' }}>
                      {act.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--sg-body)', lineHeight: 1.4 }}>
                      {act.desc}
                    </p>
                  </div>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px dashed var(--border-hairline)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleAction(act.id, act.title)}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Zap size={13} />
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
