import { useState, useEffect, useCallback, useRef } from 'react';

export function useCockpitState() {
  const [topology, setTopology] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [hostInfo, setHostInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLog, setActionLog] = useState([]);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const fetchRestState = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [devRes, diagRes, hostRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/diagnostics'),
        fetch('/api/devices/host')
      ]);

      if (devRes.ok) {
        const devData = await devRes.json();
        setTopology(devData);
      }
      if (diagRes.ok) {
        const diagData = await diagRes.json();
        setDiagnostics(diagData);
      }
      if (hostRes.ok) {
        const hostData = await hostRes.json();
        setHostInfo(hostData.host);
      }
    } catch (err) {
      console.warn('REST sync error (fallback active):', err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:5174`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('📡 Connected to Cockpit WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'INITIAL_STATE' || message.type === 'TELEMETRY_UPDATE') {
            if (message.topology) setTopology(message.topology);
            if (message.diagnostics) setDiagnostics(message.diagnostics);
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        // Auto-reconnect in 3s
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
        ws.close();
      };
    } catch (e) {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    }
  }, []);

  useEffect(() => {
    fetchRestState();
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [fetchRestState, connectWebSocket]);

  const triggerRepair = async (actionId) => {
    try {
      const res = await fetch('/api/diagnostics/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId })
      });
      const data = await res.json();
      
      const logEntry = {
        id: Date.now(),
        actionId,
        success: data.success,
        message: data.message || (data.success ? 'Action completed' : 'Action failed'),
        time: new Date().toLocaleTimeString()
      };
      
      setActionLog((prev) => [logEntry, ...prev.slice(0, 9)]);
      // Trigger instant rest refresh
      setTimeout(fetchRestState, 600);
      return data;
    } catch (err) {
      const errorEntry = {
        id: Date.now(),
        actionId,
        success: false,
        message: `Error: ${err.message}`,
        time: new Date().toLocaleTimeString()
      };
      setActionLog((prev) => [errorEntry, ...prev.slice(0, 9)]);
      return { success: false, error: err.message };
    }
  };

  return {
    topology,
    diagnostics,
    hostInfo,
    isConnected,
    isRefreshing,
    actionLog,
    refresh: fetchRestState,
    triggerRepair
  };
}
