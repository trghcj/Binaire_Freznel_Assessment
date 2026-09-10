import { useState, useEffect, useRef, useCallback } from 'react';
import { NetworkMonitor, NetworkStatus } from '../models/NetworkMonitor';

export interface UseNetworkReturn {
  isOnline: boolean;
  status: NetworkStatus;
}

export function useNetwork(): UseNetworkReturn {
  const [status, setStatus] = useState<NetworkStatus>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
  );
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const monitorRef = useRef<NetworkMonitor | null>(null);

  const handleStatusChange = useCallback((newStatus: NetworkStatus) => {
    setStatus(newStatus);
    setIsOnline(newStatus === 'online');
  }, []);

  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = new NetworkMonitor();
    }
    const monitor = monitorRef.current;

    monitor.startMonitoring();
    monitor.onStatusChange(handleStatusChange);

    return () => {
      monitor.offStatusChange(handleStatusChange);
      monitor.stopMonitoring();
    };
  }, [handleStatusChange]);

  return {
    isOnline,
    status
  };
}
