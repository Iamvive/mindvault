import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Wrench, Terminal, Sparkles } from 'lucide-react';

export default function DiagnosticCenter({ diagnostics, onTriggerRepair, actionLog }) {
  const checks = diagnostics?.checks || [];
  const score = diagnostics?.score ?? 100;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="badge-pill badge-success">
            <CheckCircle2 size={11} />
            PASS
          </span>
        );
      case 'WARNING':
        return (
          <span className="badge-pill badge-warn">
            <AlertTriangle size={11} />
            ATTENTION
          </span>
        );
      case 'FAIL':
        return (
          <span className="badge-pill badge-alert">
            <XCircle size={11} />
            FAILED
          </span>
        );
      default:
        return (
          <span className="badge-pill" style={{ background: 'var(--surface-card)', color: 'var(--sg-mute)' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview & Auto-Heal Banner */}
      <div className="wealth-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div>
            <h2 className="display-2">Diagnostic Center & 1-Tap Auto-Heal</h2>
            <p style={{ marginTop: '4px', fontSize: '0.88rem', color: 'var(--sg-mute)' }}>
              Automated 8-point audit verifying Continuity daemons, Bluetooth link layers, and Bonjour services
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-1px', color: score >= 85 ? 'var(--sg-success)' : 'var(--sg-warn)' }}>
                {score}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sg-mute)', textTransform: 'uppercase', fontWeight: 700 }}>
                Ecosystem Health
              </div>
            </div>

            <button 
              onClick={() => onTriggerRepair('restart-sharingd')}
              className="btn-primary"
            >
              <Wrench size={15} />
              1-Click Auto-Heal All
            </button>
          </div>
        </div>

        {/* 8 Checks Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {checks.map((check) => {
            const fixAction = getActionForCheck(check.id);
            return (
              <div 
                key={check.id}
                className="wealth-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--sg-ink)' }}>{check.title}</h3>
                    {getStatusBadge(check.status)}
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--sg-body)', lineHeight: 1.4 }}>
                    {check.detail}
                  </p>
                  {check.recommendedAction && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--sg-warn-pale)',
                      border: '1px solid var(--sg-warn-border)',
                      fontSize: '0.76rem',
                      color: 'var(--sg-warn)',
                      fontWeight: 500
                    }}>
                      💡 {check.recommendedAction}
                    </div>
                  )}
                </div>

                {fixAction && (
                  <div style={{ paddingTop: '8px', borderTop: '1px dashed var(--border-hairline)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onTriggerRepair(fixAction.action)}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                    >
                      <Wrench size={12} />
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
        <div className="wealth-panel" style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Terminal size={16} style={{ color: 'var(--border-active)' }} />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Recent Diagnostic & Repair Logs</h3>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
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
                  background: 'var(--surface-card)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-hairline)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge-pill ${log.success ? 'badge-success' : 'badge-alert'}`} style={{ fontSize: '0.62rem' }}>
                    {log.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                  <span style={{ color: 'var(--sg-ink)', fontWeight: 500 }}>{log.message}</span>
                </div>
                <span style={{ color: 'var(--sg-mute)', fontSize: '0.75rem' }}>{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
