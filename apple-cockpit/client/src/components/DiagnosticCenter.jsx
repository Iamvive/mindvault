import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Wrench, RefreshCw, Terminal, Sparkles } from 'lucide-react';

export default function DiagnosticCenter({ diagnostics, onTriggerRepair, actionLog }) {
  const checks = diagnostics?.checks || [];
  const score = diagnostics?.score ?? 100;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="chip chip-online">
            <CheckCircle2 size={12} />
            PASS
          </span>
        );
      case 'WARNING':
        return (
          <span className="chip chip-warning">
            <AlertTriangle size={12} />
            ATTENTION
          </span>
        );
      case 'FAIL':
        return (
          <span className="chip chip-danger">
            <XCircle size={12} />
            FAILED
          </span>
        );
      default:
        return (
          <span className="chip" style={{ background: 'var(--gradient-wash-2)', color: 'var(--text-secondary)' }}>
            INFO
          </span>
        );
    }
  };

  const getActionForCheck = (id) => {
    switch (id) {
      case 'sharingd':
        return { label: 'Restart sharingd', action: 'restart-sharingd' };
      case 'airdrop':
        return { label: 'Refresh AirDrop', action: 'trigger-airdrop' };
      case 'wifi-subnet':
        return { label: 'Flush mDNS Cache', action: 'flush-dns' };
      case 'screen-sharing':
        return { label: 'Launch VNC / ARD', action: 'launch-screenshare' };
      case 'clipboard':
        return { label: 'Heartbeat Ping', action: 'clipboard-ping' };
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview & Auto-Heal Banner */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 className="display-2">Diagnostic Center & 1-Tap Auto-Heal</h2>
            <p style={{ marginTop: '4px' }}>
              Automated 8-point audit verifying Continuity daemons, Bluetooth link layers, and Bonjour services
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.8px', color: score >= 85 ? 'var(--status-online)' : 'var(--status-warn)' }}>
                {score}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ecosystem Health
              </div>
            </div>

            <button 
              onClick={() => onTriggerRepair('restart-sharingd')}
              className="btn-primary"
              style={{ padding: '10px 20px' }}
            >
              <Wrench size={16} />
              1-Click Auto-Heal All
            </button>
          </div>
        </div>

        {/* 8 Checks Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {checks.map((check) => {
            const fixAction = getActionForCheck(check.id);
            return (
              <div 
                key={check.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>{check.title}</h3>
                    {getStatusBadge(check.status)}
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {check.detail}
                  </p>
                  {check.recommendedAction && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 214, 10, 0.08)',
                      border: '1px solid rgba(255, 214, 10, 0.2)',
                      fontSize: '0.76rem',
                      color: 'var(--status-warn)'
                    }}>
                      💡 {check.recommendedAction}
                    </div>
                  )}
                </div>

                {fixAction && (
                  <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onTriggerRepair(fixAction.action)}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    >
                      <Wrench size={13} />
                      {fixAction.label}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Logs Box */}
      {actionLog && actionLog.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Terminal size={18} style={{ color: 'var(--sg-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Diagnostic & Repair Logs</h3>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontFamily: 'var(--font-family)',
            fontSize: '0.82rem'
          }}>
            {actionLog.map((log) => (
              <div 
                key={log.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 14px',
                  background: 'var(--gradient-wash-1)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`chip ${log.success ? 'chip-online' : 'chip-danger'}`} style={{ fontSize: '0.65rem' }}>
                    {log.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                  <span>{log.message}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
