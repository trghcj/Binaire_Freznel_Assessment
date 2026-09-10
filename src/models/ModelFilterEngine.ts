import { ModelItem } from './ModelItem';

export interface FilterCriteria {
  pipelineTags: string[];
  familyTags: string[];
  architectureTags: string[];
  weightTags: string[];
  safetensorRange: { min: number; max: number } | null;
}

export class ModelFilterEngine {
  private criteria: FilterCriteria;

  constructor() {
    this.criteria = {
      pipelineTags: [],
      familyTags: [],
      architectureTags: [],
      weightTags: [],
      safetensorRange: null
    };
  }

  setPipelineFilter(tags: string[]): void {
    this.criteria.pipelineTags = [...tags];
  }

  setFamilyFilter(tags: string[]): void {
    this.criteria.familyTags = [...tags];
  }

  setArchitectureFilter(tags: string[]): void {
    this.criteria.architectureTags = [...tags];
  }

  setWeightFilter(tags: string[]): void {
    this.criteria.weightTags = [...tags];
  }

  setSafetensorRange(min: number, max: number): void {
    this.criteria.safetensorRange = { min, max };
  }

  clearSafetensorRange(): void {
    this.criteria.safetensorRange = null;
  }

  getCriteria(): FilterCriteria {
    return { ...this.criteria };
  }

  hasActiveFilters(): boolean {
    return this.criteria.pipelineTags.length > 0 ||
           this.criteria.familyTags.length > 0 ||
           this.criteria.architectureTags.length > 0 ||
           this.criteria.weightTags.length > 0 ||
           this.criteria.safetensorRange !== null;
  }

  resetAll(): void {
    this.criteria = {
      pipelineTags: [],
      familyTags: [],
      architectureTags: [],
      weightTags: [],
      safetensorRange: null
    };
  }

  applyAll(models: ModelItem[]): ModelItem[] {
    let filtered = [...models];
    filtered = this.filterByPipeline(filtered);
    filtered = this.filterByFamily(filtered);
    filtered = this.filterByArchitecture(filtered);
    filtered = this.filterByWeight(filtered);
    filtered = this.filterBySafetensorRange(filtered);
    return filtered;
  }

  private filterByPipeline(models: ModelItem[]): ModelItem[] {
    if (this.criteria.pipelineTags.length === 0) return models;
    return models.filter(m => this.criteria.pipelineTags.includes(m.pipelineTag));
  }

  private filterByFamily(models: ModelItem[]): ModelItem[] {
    if (this.criteria.familyTags.length === 0) return models;
    return models.filter(m => this.criteria.familyTags.includes(m.modelType));
  }

  private filterByArchitecture(models: ModelItem[]): ModelItem[] {
    if (this.criteria.architectureTags.length === 0) return models;
    return models.filter(m => 
      m.architectures.some(arch => this.criteria.architectureTags.includes(arch))
    );
  }

  private filterByWeight(models: ModelItem[]): ModelItem[] {
    if (this.criteria.weightTags.length === 0) return models;
    return models.filter(m => {
      const wTags = m.getWeightTags();
      return this.criteria.weightTags.some(wt => wTags.includes(wt));
    });
  }

  private filterBySafetensorRange(models: ModelItem[]): ModelItem[] {
    if (!this.criteria.safetensorRange) return models;
    const { min, max } = this.criteria.safetensorRange;
    return models.filter(m => m.safetensorCount >= min && m.safetensorCount <= max);
  }
}
