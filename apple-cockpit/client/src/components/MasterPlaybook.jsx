import React, { useState } from 'react';
import { 
  MousePointer, 
  Monitor, 
  Copy, 
  Edit3, 
  ScreenShare, 
  Check, 
  ChevronRight, 
  Sparkles,
  Terminal,
  ExternalLink
} from 'lucide-react';

export default function MasterPlaybook({ onTriggerAction }) {
  const [activeGuideId, setActiveGuideId] = useState('universal-control');
  const [copiedCmd, setCopiedCmd] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  const guides = [
    {
      id: 'universal-control',
      title: 'Universal Control (1 Keyboard & Mouse across 3 Devices)',
      icon: MousePointer,
      badge: 'Multi-Device Flow',
      summary: 'Use your Mac mini desktop keyboard & mouse to seamlessly navigate across your MacBook and iPad without switching Bluetooth connections.',
      steps: [
        {
          title: '1. Position & Push Through Edge',
          detail: 'Place your iPad or MacBook next to your Mac mini monitor. Move your cursor steadily past the edge of the screen. A boundary indicator will appear on the receiving device, and your cursor will jump onto it.'
        },
        {
          title: '2. Cross-Device Drag and Drop',
          detail: 'Select a file in macOS Finder on your Mac mini, drag it off the edge onto the iPad screen, and drop it straight into Files, GoodNotes, or Procreate.'
        },
        {
          title: '3. Shared Keyboard Input',
          detail: 'When the cursor is on the iPad or MacBook, typing on your Mac mini keyboard routes keystrokes straight to that device. Press Cmd+Space to invoke iPad Spotlight search.'
        }
      ],
      proTip: 'If the cursor jumps at the wrong vertical height, go to System Settings > Displays on your Mac and drag the virtual screens up or down to match your physical desk eye-level.',
      terminalFix: 'defaults write com.apple.universalcontrol Disable -bool false && killall sharingd'
    },
    {
      id: 'sidecar',
      title: 'Sidecar & Apple Pencil (iPad as Mac Monitor)',
      icon: Monitor,
      badge: 'Dual Screen & Stylus',
      summary: 'Turn your iPad into a color-accurate second/third high-DPI display for your Mac mini or MacBook with pressure-sensitive Apple Pencil support.',
      steps: [
        {
          title: '1. Launch Sidecar',
          detail: 'Click Control Center (top right on Mac) > Screen Mirroring > Select your iPad under "Extend Desktop".'
        },
        {
          title: '2. Apple Pencil Drawing in macOS Apps',
          detail: 'Drag Photoshop, Illustrator, Affinity, or Preview windows onto the iPad screen. Use your Apple Pencil with full tilt and pressure sensitivity directly in desktop Mac apps.'
        },
        {
          title: '3. Touch Bar & Sidebar Navigation',
          detail: 'Enable the Sidecar sidebar to get quick access to Cmd, Shift, Option, and an onscreen Touch Bar even if your Mac lacks one.'
        }
      ],
      proTip: 'For latency-free drawing and zero battery drain, plug your iPad into your Mac with a USB-C cable. Sidecar automatically switches to high-speed wired USB transport.',
      terminalFix: 'killall -HUP mDNSResponder && killall sharingd'
    },
    {
      id: 'clipboard-handoff',
      title: 'Universal Clipboard & Handoff',
      icon: Copy,
      badge: 'Instant Sync',
      summary: 'Copy text, passwords, or images on your Mac mini and paste them instantaneously on your MacBook or iPad within seconds.',
      steps: [
        {
          title: '1. Instant Copy & Paste',
          detail: 'Press Cmd+C on your Mac mini. Within 1-2 seconds, tap "Paste" on iPad or press Cmd+V on MacBook. Works bidirectionally.'
        },
        {
          title: '2. Continuing Sessions (Handoff)',
          detail: 'Browse a webpage in Safari or write a note on your iPad. A badged Safari/Notes icon appears on your Mac Dock. Click it to resume at the exact same scroll position.'
        }
      ],
      proTip: 'Universal Clipboard expires after ~2 minutes for privacy and security. Copy immediately when transferring sensitive information or 2FA codes.',
      terminalFix: 'killall pboard && killall sharingd'
    },
    {
      id: 'continuity-sketch',
      title: 'Continuity Sketch, Scan & Markup',
      icon: Edit3,
      badge: 'Creative Input',
      summary: 'Insert hand-drawn vector sketches or signed PDF documents directly into your Mac documents from your iPad in real time.',
      steps: [
        {
          title: '1. Insert Sketch from iPad',
          detail: 'In Pages, Notes, Mail, or Keynote on Mac, right-click anywhere and select "Insert from iPhone or iPad" > "Add Sketch". A canvas appears on iPad; draw and tap Done.'
        },
        {
          title: '2. Instant Document Scanner',
          detail: 'Right-click in Finder on Mac > "Scan Documents" > Select iPad. The camera scans receipts or contracts, auto-straightens perspective, and drops a PDF on your Mac.'
        },
        {
          title: '3. Quick Look PDF Markup',
          detail: 'Select any PDF on Mac, press Spacebar, click the Markup (Pen) icon, then click the iPad button to sign documents with Apple Pencil.'
        }
      ],
      proTip: 'No third-party scanner apps needed. Native Apple Continuity scanning produces search-indexed PDF vectors with OCR automatically.',
      terminalFix: 'defaults write com.apple.sharingd DiscoverableMode -string "Contacts Only"'
    },
    {
      id: 'screen-sharing',
      title: 'Headless Mac mini Screen Sharing',
      icon: ScreenShare,
      badge: 'Remote Compute',
      summary: 'Control your Mac mini headlessly from your MacBook over local Wi-Fi with ultra-low latency, full Retina resolution, and zero lag.',
      steps: [
        {
          title: '1. Enable Screen Sharing on Mac mini',
          detail: 'On Mac mini: Go to System Settings > General > Sharing > Enable "Screen Sharing" (or Remote Management).'
        },
        {
          title: '2. Connect from MacBook',
          detail: 'On MacBook: Press Cmd+Space > Type "Screen Sharing" > Select your Mac mini from the Network list or enter vnc://[Mac-mini-IP].'
        },
        {
          title: '3. High Performance Mode',
          detail: 'If both Macs run macOS Sonoma or Sequoia, Screen Sharing enables Apple Silicon hardware-accelerated High Performance Mode with 60 FPS HDR.'
        }
      ],
      proTip: 'You can drag and drop files directly between the remote Screen Sharing window and your MacBook local desktop.',
      terminalFix: 'open screen-sharing://'
    }
  ];

  const activeGuide = guides.find((g) => g.id === activeGuideId) || guides[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
      {/* Sidebar Guide Menu */}
      <div className="glass-panel" style={{ padding: '20px', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px', paddingLeft: '8px' }}>
          Master Playbook
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {guides.map((guide) => {
            const Icon = guide.icon;
            const isActive = activeGuideId === guide.id;
            return (
              <button
                key={guide.id}
                onClick={() => setActiveGuideId(guide.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--gradient-wash-3)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid var(--sg-primary)' : '3px solid transparent'
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--sg-primary)' : 'var(--text-muted)' }} />
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {guide.title.split('(')[0]}
                </div>
                <ChevronRight size={14} style={{ opacity: isActive ? 1 : 0.4 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide Content Display */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span className="chip chip-primary" style={{ marginBottom: '8px' }}>
              {activeGuide.badge}
            </span>
            <h2 className="display-2" style={{ marginTop: '4px' }}>{activeGuide.title}</h2>
          </div>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          {activeGuide.summary}
        </p>

        {/* Steps List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          {activeGuide.steps.map((step, idx) => (
            <div 
              key={idx} 
              className="glass-card"
              style={{ padding: '18px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--gradient-wash-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--sg-primary)',
                flexShrink: 0
              }}>
                {idx + 1}
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tip Box */}
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(230, 0, 35, 0.06)',
          border: '1px solid var(--border-primary)',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <Sparkles size={18} style={{ color: 'var(--sg-primary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sg-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ecosystem Pro Tip
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.4 }}>
              {activeGuide.proTip}
            </div>
          </div>
        </div>

        {/* Terminal Repair Snippet */}
        {activeGuide.terminalFix && (
          <div style={{
            padding: '14px 18px',
            background: 'var(--bg-base)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <Terminal size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <code style={{ fontSize: '0.8rem', color: '#ff6b7e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeGuide.terminalFix}
              </code>
            </div>
            <button
              onClick={() => copyToClipboard(activeGuide.terminalFix)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', flexShrink: 0 }}
            >
              {copiedCmd === activeGuide.terminalFix ? (
                <>
                  <Check size={12} style={{ color: 'var(--status-online)' }} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy Command
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
