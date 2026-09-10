import { ApiService } from './ApiService';
import { ModelCache } from '../models/ModelCache';
import { RawModelData } from '../models/ModelItem';

export type SyncCallback = (models: RawModelData[], error?: Error) => void;

export class BackgroundFetcher {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly syncInterval: number; // ms
  private apiService: ApiService;
  private cache: ModelCache;
  private listeners: Set<SyncCallback> = new Set();
  private isSyncing: boolean = false;

  constructor(syncIntervalMs: number = 300000) {
    this.syncInterval = syncIntervalMs;
    this.apiService = ApiService.getInstance();
    this.cache = new ModelCache();
  }

  startSync(): void {
    if (this.intervalId !== null) return;
    this.intervalId = setInterval(() => {
      this.performSync();
    }, this.syncInterval);
    this.performSync();
  }

  stopSync(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  syncNow(): void {
    this.performSync();
  }

  onSync(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  dispose(): void {
    this.stopSync();
    this.listeners.clear();
  }

  private performSync(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    
    this.apiService.fetchModels({ limit: 100, sort: 'downloads', direction: -1 })
      .then(models => {
        return this.cache.cacheModels(models)
          .then(() => models)
          .catch(() => models); // continue even if cache save fails
      })
      .then(models => {
        this.isSyncing = false;
        this.listeners.forEach(listener => listener(models));
      })
      .catch(error => {
        this.isSyncing = false;
        this.listeners.forEach(listener => listener([], error));
      });
  }
}
