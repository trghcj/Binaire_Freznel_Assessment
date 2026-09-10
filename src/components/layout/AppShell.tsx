import React, { useState } from 'react';
import { Flex, View, Heading, ActionButton, Grid, Text } from '@adobe/react-spectrum';
import FilterFilter from '@spectrum-icons/workflow/Filter';
import { FilterPanel } from '../filters/FilterPanel';
import { SearchBar } from '../search/SearchBar';
import { SortControls } from '../sort/SortControls';
import { ModelCard } from '../models/ModelCard';
import { NetworkBanner } from './NetworkBanner';
import { useModels } from '../../hooks/useModels';

export function AppShell() {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const modelsHook = useModels();

  return (
    <View minHeight="100vh" backgroundColor="gray-100">
      <NetworkBanner />
      <Flex direction="column" gap="size-0" minHeight="100vh">
        <View backgroundColor="gray-50" padding="size-200" borderBottomWidth="thin" borderColor="dark">
          <Flex direction="row" alignItems="center" justifyContent="space-between">
            <Heading level={2} margin="size-0">Binaire FreznelAI</Heading>
            <ActionButton 
              isQuiet 
              onPress={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              UNSAFE_style={{ backgroundColor: isFilterPanelOpen ? '#e0e0e0' : 'transparent' }}
            >
              <FilterFilter />
              <Text>Filters</Text>
            </ActionButton>
          </Flex>
        </View>
        <Flex direction="row" flex={1} UNSAFE_style={{ overflow: 'hidden' }}>
          {isFilterPanelOpen && (
            <View width="size-3400" borderWidth="thin" borderColor="dark" backgroundColor="gray-50" padding="size-200" UNSAFE_style={{ overflow: 'auto', borderLeftWidth: 0, borderTopWidth: 0, borderBottomWidth: 0 }}>
              <FilterPanel 
                hook={modelsHook}
                isOpen={isFilterPanelOpen} 
                onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)} 
              />
            </View>
          )}
          <View flex={1} padding="size-300" UNSAFE_style={{ overflow: 'auto' }}>
            <Flex direction="column" gap="size-300">
              <Flex direction="row" gap="size-200" alignItems="end">
                <View flex={1}>
                  <SearchBar 
                    searchQuery={modelsHook.searchQuery}
                    searchField={modelsHook.searchField}
                    onQueryChange={modelsHook.setSearchQuery}
                    onFieldChange={modelsHook.setSearchField}
                  />
                </View>
                <SortControls 
                  sortOption={modelsHook.sortOption}
                  onSortChange={modelsHook.setSortOption}
                />
              </Flex>
              {modelsHook.isLoading ? (
                <View padding="size-600"><Text>Loading models...</Text></View>
              ) : modelsHook.error ? (
                <View padding="size-600"><Text UNSAFE_style={{ color: 'red' }}>{modelsHook.error}</Text></View>
              ) : (
                <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" gap="size-200">
                  {modelsHook.models.map(model => (
                    <ModelCard key={model.rawId || model.name} model={model} />
                  ))}
                </Grid>
              )}
              {!modelsHook.isLoading && modelsHook.models.length === 0 && (
                <View padding="size-600"><Text>No models found.</Text></View>
              )}
            </Flex>
          </View>
        </Flex>
      </Flex>
    </View>
  );
}
