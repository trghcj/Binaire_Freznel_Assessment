import { RawModelData } from '../models/ModelItem';
import { ModelCache } from '../models/ModelCache';

export interface FetchParams {
  search?: string;
  pipeline_tag?: string;
  filter?: string[];  // comma-joined as CSV
  sort?: 'downloads' | 'likes' | 'lastModified' | 'trendingScore' | 'created';
  direction?: -1 | 1;
  limit?: number;
}

export class ApiService {
  private static instance: ApiService;
  private readonly baseUrl: string = 'https://huggingface.co/api/models';
  private cache: ModelCache;
  private abortController: AbortController | null = null;

  private constructor() {
    this.cache = new ModelCache();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private buildUrl(params: FetchParams): string {
    const url = new URL(this.baseUrl);
    url.searchParams.append('full', 'true');
    url.searchParams.append('config', 'true');
    url.searchParams.append('expand[]', 'safetensors');
    
    if (params.search) url.searchParams.append('search', params.search);
    if (params.pipeline_tag) url.searchParams.append('pipeline_tag', params.pipeline_tag);
    if (params.filter && params.filter.length > 0) {
      url.searchParams.append('filter', params.filter.join(','));
    }
    if (params.sort) url.searchParams.append('sort', params.sort);
    if (params.direction) url.searchParams.append('direction', params.direction.toString());
    if (params.limit) url.searchParams.append('limit', params.limit.toString());
    
    return url.toString();
  }

  fetchModels(params: FetchParams = {}): Promise<RawModelData[]> {
    this.cancelFetch();
    this.abortController = new AbortController();
    const url = this.buildUrl(params);

    return this.fetchWithRetry(url, 3, this.abortController.signal)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return this.safeParseJson(response);
      })
      .then(data => {
        return this.cache.cacheModels(data)
          .then(() => data)
          .catch(() => data); // ignore cache errors
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return Promise.reject(error);
        }
        return this.getCachedModels().then(cachedData => {
          if (cachedData && cachedData.length > 0) return cachedData;
          return Promise.reject(error);
        });
      });
  }

  private fetchWithRetry(url: string, retries: number, signal?: AbortSignal): Promise<Response> {
    return fetch(url, { signal })
      .catch(error => {
        if (retries > 0 && error.name !== 'AbortError') {
          return this.fetchWithRetry(url, retries - 1, signal);
        }
        return Promise.reject(error);
      });
  }

  private safeParseJson(response: Response): Promise<RawModelData[]> {
    const contentLengthHeader = response.headers.get('content-length');
    const expectedBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : null;
    
    if (!response.body) {
      return Promise.reject(new Error("Response body is null"));
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    const readChunk = (): Promise<Uint8Array[]> => {
      return reader.read().then(({ done, value }) => {
        if (done) {
          return chunks;
        }
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
        }
        return readChunk();
      });
    };

    return readChunk().then(() => {
      if (expectedBytes !== null && receivedBytes !== expectedBytes) {
        throw new Error(`Size mismatch. Expected ${expectedBytes}, got ${receivedBytes}`);
      }
      
      const combined = new Uint8Array(receivedBytes);
      let position = 0;
      for (const chunk of chunks) {
        combined.set(chunk, position);
        position += chunk.length;
      }
      
      const text = new TextDecoder('utf-8').decode(combined);
      try {
        return JSON.parse(text) as RawModelData[];
      } catch (e) {
        throw new Error("Failed to parse JSON");
      }
    }).catch(error => {
      console.warn("safeParseJson failed, falling back to cache", error);
      return this.getCachedModels();
    });
  }

  cancelFetch(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  getCachedModels(): Promise<RawModelData[]> {
    return this.cache.getRawModels();
  }
}
