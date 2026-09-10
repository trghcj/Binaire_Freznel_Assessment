import { ModelItem } from './ModelItem';

export type SortOption = 'safetensor-count-asc' | 'safetensor-count-desc' | 'name-asc' | 'name-desc';

export class ModelSortEngine {
  private currentSort: SortOption;

  constructor(defaultSort: SortOption = 'name-asc') {
    this.currentSort = defaultSort;
  }

  setSort(option: SortOption): void {
    this.currentSort = option;
  }

  getSort(): SortOption {
    return this.currentSort;
  }

  sort(models: ModelItem[]): ModelItem[] {
    switch (this.currentSort) {
      case 'safetensor-count-asc':
        return this.sortBySafetensorCount(models, true);
      case 'safetensor-count-desc':
        return this.sortBySafetensorCount(models, false);
      case 'name-asc':
        return this.sortByName(models, true);
      case 'name-desc':
        return this.sortByName(models, false);
      default:
        return [...models];
    }
  }

  private sortBySafetensorCount(models: ModelItem[], ascending: boolean): ModelItem[] {
    return [...models].sort((a, b) => {
      if (ascending) {
        return a.safetensorCount - b.safetensorCount;
      } else {
        return b.safetensorCount - a.safetensorCount;
      }
    });
  }

  private sortByName(models: ModelItem[], ascending: boolean): ModelItem[] {
    return [...models].sort((a, b) => {
      if (ascending) {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }
}
