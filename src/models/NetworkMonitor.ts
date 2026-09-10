export type NetworkStatus = 'online' | 'offline';
export type NetworkCallback = (status: NetworkStatus) => void;

export class NetworkMonitor {
  private listeners: Set<NetworkCallback>;
  private boundOnline: () => void;
  private boundOffline: () => void;

  constructor() {
    this.listeners = new Set();
    this.boundOnline = () => this.notifyListeners('online');
    this.boundOffline = () => this.notifyListeners('offline');
  }

  startMonitoring(): void {
    window.addEventListener('online', this.boundOnline);
    window.addEventListener('offline', this.boundOffline);
  }

  stopMonitoring(): void {
    window.removeEventListener('online', this.boundOnline);
    window.removeEventListener('offline', this.boundOffline);
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  getStatus(): NetworkStatus {
    return this.isOnline() ? 'online' : 'offline';
  }

  onStatusChange(callback: NetworkCallback): void {
    this.listeners.add(callback);
  }

  offStatusChange(callback: NetworkCallback): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach(callback => callback(status));
  }
}
