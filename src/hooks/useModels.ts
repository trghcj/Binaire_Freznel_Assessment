import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ModelItem, RawModelData } from '../models/ModelItem';
import { ModelSearchEngine, SearchField } from '../models/ModelSearchEngine';
import { ModelFilterEngine, FilterCriteria } from '../models/ModelFilterEngine';
import { ModelSortEngine, SortOption } from '../models/ModelSortEngine';
import { ModelCache } from '../models/ModelCache';
import { ApiService } from '../services/ApiService';
import { BackgroundFetcher } from '../services/BackgroundFetcher';
import { NetworkMonitor, NetworkStatus } from '../models/NetworkMonitor';

export interface UseModelsReturn {
  // Data
  models: ModelItem[];
  allModels: ModelItem[];
  isLoading: boolean;
  error: string | null;
  
  // Search
  searchQuery: string;
  searchField: SearchField;
  setSearchQuery: (query: string) => void;
  setSearchField: (field: SearchField) => void;
  
  // Filters
  filterCriteria: FilterCriteria;
  setPipelineFilter: (tags: string[]) => void;
  setFamilyFilter: (tags: string[]) => void;
  setArchitectureFilter: (tags: string[]) => void;
  setWeightFilter: (tags: string[]) => void;
  setSafetensorRange: (min: number, max: number) => void;
  clearSafetensorRange: () => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  
  // Sorting
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  
  // Available filter options
  availablePipelineTags: string[];
  availableFamilyTags: string[];
  availableArchitectureTags: string[];
  availableWeightTags: string[];
  safetensorCountRange: { min: number; max: number };
  
  // Actions
  refreshModels: () => void;
  
  // Network status
  isOnline: boolean;
  lastSyncTime: number | null;
}

export function useModels(): UseModelsReturn {
  const [allModels, setAllModels] = useState<ModelItem[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchField, setSearchField] = useState<SearchField>('name');
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    pipelineTags: [],
    familyTags: [],
    architectureTags: [],
    weightTags: [],
    safetensorRange: null
  });
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const searchEngine = useRef(new ModelSearchEngine());
  const filterEngine = useRef(new ModelFilterEngine());
  const sortEngine = useRef(new ModelSortEngine());
  const cache = useRef(new ModelCache());
  const apiService = useRef(ApiService.getInstance());
  const backgroundFetcher = useRef(new BackgroundFetcher());
  const networkMonitor = useRef(new NetworkMonitor());

  // Network setup
  useEffect(() => {
    const monitor = networkMonitor.current;
    monitor.startMonitoring();
    const callback = (status: NetworkStatus) => {
      setIsOnline(status === 'online');
    };
    monitor.onStatusChange(callback);
    return () => {
      monitor.offStatusChange(callback);
      monitor.stopMonitoring();
    };
  }, []);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    if (isOnline) {
      apiService.current.fetchModels()
        .then((fetchedRawModels: RawModelData[]) => {
          const fetchedModels = fetchedRawModels.map(ModelItem.fromApiResponse);
          setAllModels(fetchedModels);
          cache.current.cacheModels(fetchedRawModels)
            .then(() => cache.current.getMetadata())
            .then((metadata) => {
              if (metadata) setLastSyncTime(metadata.lastSyncTime);
              setIsLoading(false);
            })
            .catch(() => { setIsLoading(false); });
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setError(err.message || 'Failed to fetch models from API');
          setIsLoading(false);
        });
    } else {
      cache.current.getCachedModels()
        .then((cachedModels) => {
          setAllModels(cachedModels);
          return cache.current.getMetadata();
        })
        .then((metadata) => {
          if (metadata) setLastSyncTime(metadata.lastSyncTime);
          setIsLoading(false);
        })
        .catch((err) => {
          setError('Failed to load cached models while offline');
          setIsLoading(false);
        });
    }
  }, [isOnline]);

  useEffect(() => {
    loadData();
    const fetcher = backgroundFetcher.current;
    fetcher.startSync();
    
    const searchEng = searchEngine.current;
    return () => {
      fetcher.stopSync();
      fetcher.dispose();
      searchEng.cancelPending();
      searchEng.dispose();
    };
  }, [loadData]);

  // Apply Search, Filter, Sort pipeline
  useEffect(() => {
    if (!allModels.length) {
      setModels([]);
      return;
    }
    
    let processed = allModels;
    
    if (searchQuery) {
      processed = searchEngine.current.searchLocally(processed, searchQuery, searchField);
    }
    
    // Apply filters
    filterEngine.current.setPipelineFilter(filterCriteria.pipelineTags);
    filterEngine.current.setFamilyFilter(filterCriteria.familyTags);
    filterEngine.current.setArchitectureFilter(filterCriteria.architectureTags);
    filterEngine.current.setWeightFilter(filterCriteria.weightTags);
    if (filterCriteria.safetensorRange) {
      filterEngine.current.setSafetensorRange(filterCriteria.safetensorRange.min, filterCriteria.safetensorRange.max);
    } else {
      filterEngine.current.clearSafetensorRange();
    }
    processed = filterEngine.current.applyAll(processed);
    
    // Sort
    sortEngine.current.setSort(sortOption);
    processed = sortEngine.current.sort(processed);
    
    setModels(processed);
  }, [allModels, searchQuery, searchField, filterCriteria, sortOption]);

  const availablePipelineTags = useMemo(() => {
    const tags = new Set<string>();
    allModels.forEach(m => { if (m.pipelineTag) tags.add(m.pipelineTag); });
    return Array.from(tags).sort();
  }, [allModels]);

  const availableFamilyTags = useMemo(() => {
    const tags = new Set<string>();
    allModels.forEach(m => { if (m.modelType) tags.add(m.modelType); });
    return Array.from(tags).sort();
  }, [allModels]);

  const availableArchitectureTags = useMemo(() => {
    const tags = new Set<string>();
    allModels.forEach(m => { 
      if (m.architectures) {
        m.architectures.forEach(a => tags.add(a));
      }
    });
    return Array.from(tags).sort();
  }, [allModels]);

  const availableWeightTags = useMemo(() => {
    const tags = new Set<string>();
    allModels.forEach(m => { 
      if (m.getWeightTags) {
        m.getWeightTags().forEach((w: string) => tags.add(w));
      }
    });
    return Array.from(tags).sort();
  }, [allModels]);

  const safetensorCountRange = useMemo(() => {
    if (allModels.length === 0) return { min: 0, max: 10 };
    const counts = allModels.map(m => m.safetensorCount);
    return { min: Math.min(...counts), max: Math.max(...counts) };
  }, [allModels]);

  const hasActiveFilters = filterCriteria.pipelineTags.length > 0 ||
    filterCriteria.familyTags.length > 0 ||
    filterCriteria.architectureTags.length > 0 ||
    filterCriteria.weightTags.length > 0 ||
    filterCriteria.safetensorRange !== null;

  return {
    models,
    allModels,
    isLoading,
    error,

    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,

    filterCriteria,
    setPipelineFilter: (tags) => setFilterCriteria(prev => ({ ...prev, pipelineTags: tags })),
    setFamilyFilter: (tags) => setFilterCriteria(prev => ({ ...prev, familyTags: tags })),
    setArchitectureFilter: (tags) => setFilterCriteria(prev => ({ ...prev, architectureTags: tags })),
    setWeightFilter: (tags) => setFilterCriteria(prev => ({ ...prev, weightTags: tags })),
    setSafetensorRange: (min, max) => setFilterCriteria(prev => ({ ...prev, safetensorRange: { min, max } })),
    clearSafetensorRange: () => setFilterCriteria(prev => ({ ...prev, safetensorRange: null })),
    resetFilters: () => setFilterCriteria({
      pipelineTags: [],
      familyTags: [],
      architectureTags: [],
      weightTags: [],
      safetensorRange: null
    }),
    hasActiveFilters,

    sortOption,
    setSortOption,

    availablePipelineTags,
    availableFamilyTags,
    availableArchitectureTags,
    availableWeightTags,
    safetensorCountRange,

    refreshModels: loadData,
    
    isOnline,
    lastSyncTime
  };
}
