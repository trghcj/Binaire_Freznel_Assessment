export interface RawModelData {
  _id: string;
  id: string;
  author?: string;
  pipeline_tag?: string;
  tags?: string[];
  config?: {
    architectures?: string[];
    model_type?: string;
  };
  safetensors?: {
    total?: number;
    parameters?: Record<string, number>;
    sharded?: boolean;
  };
  siblings?: Array<{ rfilename: string }>;
  downloads?: number;
  likes?: number;
  createdAt?: string;
  library_name?: string;
}

export class ModelItem {
  readonly rawId: string;
  readonly name: string;
  readonly author: string;
  readonly pipelineTag: string;
  readonly tags: string[];
  readonly architectures: string[];
  readonly modelType: string;
  readonly safetensorCount: number;
  readonly safetensorTotal: number;
  readonly safetensorSharded: boolean;
  readonly safetensorParameters: Record<string, number>;
  readonly downloads: number;
  readonly likes: number;
  readonly createdAt: Date;
  readonly libraryName: string;

  private constructor(data: RawModelData) {
    this.rawId = data._id;
    this.name = data.id;
    this.author = data.author || '';
    this.pipelineTag = data.pipeline_tag || '';
    this.tags = data.tags || [];
    this.architectures = data.config?.architectures || [];
    this.modelType = data.config?.model_type || '';
    this.safetensorCount = ModelItem.countSafetensorFiles(data.siblings);
    this.safetensorTotal = data.safetensors?.total || 0;
    this.safetensorSharded = data.safetensors?.sharded || false;
    this.safetensorParameters = data.safetensors?.parameters || {};
    this.downloads = data.downloads || 0;
    this.likes = data.likes || 0;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.libraryName = data.library_name || '';
  }

  static fromApiResponse(data: RawModelData): ModelItem {
    return new ModelItem(data);
  }

  matchesSearch(query: string, field: 'name' | 'family'): boolean {
    const lowerQuery = query.toLowerCase();
    if (field === 'name') {
      return this.name.toLowerCase().indexOf(lowerQuery) !== -1;
    } else if (field === 'family') {
      return this.modelType.toLowerCase().indexOf(lowerQuery) !== -1;
    }
    return false;
  }

  getPipelineTags(): string[] {
    if (this.pipelineTag) return [this.pipelineTag];
    return [];
  }

  getFamilyTags(): string[] {
    const familyTags = new Set<string>();
    if (this.modelType) familyTags.add(this.modelType);
    this.tags.forEach(tag => {
      if (tag === this.modelType || this.architectures.includes(tag)) {
          familyTags.add(tag);
      }
    });
    return Array.from(familyTags);
  }

  getArchitectureTags(): string[] {
    return [...this.architectures];
  }

  getWeightTags(): string[] {
    const weightKeywords = ['safetensors', 'gguf', 'pytorch', 'onnx', 'peft'];
    return this.tags.filter(tag => weightKeywords.some(keyword => tag.toLowerCase().includes(keyword)));
  }

  private static countSafetensorFiles(siblings?: Array<{ rfilename: string }>): number {
    if (!siblings) return 0;
    return siblings.filter(s => s.rfilename.endsWith('.safetensors')).length;
  }
}
