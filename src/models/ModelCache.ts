import { openDB, IDBPDatabase } from 'idb';
import { ModelItem, RawModelData } from './ModelItem';

interface CacheMetadata {
  lastSyncTime: number;
  modelCount: number;
}

export class ModelCache {
  private dbName: string;
  private dbVersion: number;
  private dbPromise: Promise<IDBPDatabase> | null = null;

  constructor(dbName: string = 'model-cache', dbVersion: number = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  private getDb(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('models')) {
            db.createObjectStore('models', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  cacheModels(rawModels: RawModelData[]): Promise<void> {
    return this.getDb().then(db => {
      const tx = db.transaction(['models', 'metadata'], 'readwrite');
      const modelsStore = tx.objectStore('models');
      modelsStore.clear(); // Clear old cached items (e.g. from the live API)
      
      const putPromises = rawModels.map(model => modelsStore.put(model));
      
      const metadataStore = tx.objectStore('metadata');
      const metaPromise = metadataStore.put({
        key: 'cache-meta',
        lastSyncTime: Date.now(),
        modelCount: rawModels.length
      });
      
      return Promise.all([...putPromises, metaPromise]).then(() => tx.done);
    });
  }

  getCachedModels(): Promise<ModelItem[]> {
    return this.getDb().then(db => {
      return db.getAll('models').then((rawModels: RawModelData[]) => {
        return rawModels.map(raw => ModelItem.fromApiResponse(raw));
      });
    });
  }

  getMetadata(): Promise<CacheMetadata | undefined> {
    return this.getDb().then(db => {
      return db.get('metadata', 'cache-meta');
    });
  }

  clearCache(): Promise<void> {
    return this.getDb().then(db => {
      const tx = db.transaction(['models', 'metadata'], 'readwrite');
      tx.objectStore('models').clear();
      tx.objectStore('metadata').clear();
      return tx.done;
    });
  }

  hasCachedData(): Promise<boolean> {
    return this.getMetadata().then(meta => {
      return !!meta && meta.modelCount > 0;
    });
  }

  getRawModels(): Promise<RawModelData[]> {
    return this.getDb().then(db => {
      return db.getAll('models');
    });
  }
}
