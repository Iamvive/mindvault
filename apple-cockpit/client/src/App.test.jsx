import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes('/api/devices/host')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, host: { deviceType: 'Mac mini', hostname: 'MacMini.local' } })
      });
    }
    if (url.includes('/api/devices')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          devices: [
            { id: 'mac-mini', name: 'Mac mini', type: 'mac-mini', role: 'Desk Engine', isHost: true, ip: '192.168.1.102', status: 'ONLINE', services: ['Screen Sharing'], latencyMs: 0 },
            { id: 'macbook', name: 'MacBook', type: 'macbook', role: 'Portable', isHost: false, ip: '192.168.1.105', status: 'ONLINE', services: ['Handoff'], latencyMs: 2 },
            { id: 'ipad', name: 'iPad', type: 'ipad', role: 'Companion', isHost: false, ip: '192.168.1.110', status: 'ONLINE', services: ['Sidecar'], latencyMs: 4 }
          ]
        })
      });
    }
    if (url.includes('/api/diagnostics')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          score: 100,
          checks: [
            { id: 'wifi-subnet', title: 'Wi-Fi & Local Subnet Matching', status: 'PASS', detail: 'Connected to 5GHz Wi-Fi' }
          ]
        })
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });
});

describe('Apple Ecosystem Cockpit App', () => {
  it('renders title and navigation tabs', async () => {
    render(<App />);
    expect(screen.getByText('Apple Ecosystem Cockpit')).toBeInTheDocument();
    expect(screen.getByText('Ecosystem Radar')).toBeInTheDocument();
    expect(screen.getByText('Desk Studio')).toBeInTheDocument();
    expect(screen.getByText('Master Playbook')).toBeInTheDocument();
  });

  it('switches between tabs on click', async () => {
    render(<App />);
    
    const deskTab = screen.getByText('Desk Studio');
    fireEvent.click(deskTab);
    expect(screen.getByText('Triple Desk Command Center')).toBeInTheDocument();

    const playbookTab = screen.getByText('Master Playbook');
    fireEvent.click(playbookTab);
    expect(screen.getByText('Universal Control (1 Keyboard & Mouse across 3 Devices)')).toBeInTheDocument();
  });
});
