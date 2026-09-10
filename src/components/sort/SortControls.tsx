import React, { Key } from 'react';
import { Picker, Item, Flex, Text } from '@adobe/react-spectrum';

export type SortOption = 'safetensor-count-asc' | 'safetensor-count-desc' | 'name-asc' | 'name-desc';

interface SortControlsProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export function SortControls({ sortOption, onSortChange }: SortControlsProps) {
  return (
    <Flex direction="row" alignItems="center" gap="size-100">
      <Text>Sort By:</Text>
      <Picker
        aria-label="Sort models"
        selectedKey={sortOption}
        onSelectionChange={(key: Key | null) => { if (key) onSortChange(key as SortOption); }}
      >
        <Item key="name-asc">Name (A-Z)</Item>
        <Item key="name-desc">Name (Z-A)</Item>
        <Item key="safetensor-count-desc">Safetensors (High to Low)</Item>
        <Item key="safetensor-count-asc">Safetensors (Low to High)</Item>
      </Picker>
    </Flex>
  );
}
