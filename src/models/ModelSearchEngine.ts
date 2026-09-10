import { ModelItem } from './ModelItem';

export type SearchField = 'name' | 'family';

export class ModelSearchEngine {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastThrottleTime: number = 0;
  private readonly debounceDelay: number;
  private readonly throttleInterval: number;

  constructor(debounceDelay: number = 300, throttleInterval: number = 500) {
    this.debounceDelay = debounceDelay;
    this.throttleInterval = throttleInterval;
  }

  debouncedSearch(query: string, field: SearchField, callback: (query: string, field: SearchField) => void): void {
    this.cancelPending();
    this.debounceTimer = setTimeout(() => {
      callback(query, field);
    }, this.debounceDelay);
  }

  throttledExecute(fn: () => void): void {
    const now = Date.now();
    if (now - this.lastThrottleTime >= this.throttleInterval) {
      this.lastThrottleTime = now;
      fn();
    }
  }

  searchLocally(models: ModelItem[], query: string, field: SearchField): ModelItem[] {
    if (!query) return models;
    return models.filter(model => model.matchesSearch(query, field));
  }

  cancelPending(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  dispose(): void {
    this.cancelPending();
  }
}
