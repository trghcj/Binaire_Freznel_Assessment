import React, { Key } from 'react';
import { Flex, SearchField, Picker, Item } from '@adobe/react-spectrum';

export type SearchFieldType = 'name' | 'family';

interface SearchBarProps {
  searchQuery: string;
  searchField: SearchFieldType;
  onQueryChange: (query: string) => void;
  onFieldChange: (field: SearchFieldType) => void;
}

export function SearchBar({ searchQuery, searchField, onQueryChange, onFieldChange }: SearchBarProps) {
  return (
    <Flex direction="row" gap="size-100" width="100%" alignItems="end">
      <SearchField
        label="Search Models"
        value={searchQuery}
        onChange={onQueryChange}
        width="100%"
        flex={1}
      />
      <Picker
        label="Search In"
        selectedKey={searchField}
        onSelectionChange={(key: Key | null) => { if (key) onFieldChange(key as SearchFieldType); }}
        width="size-2000"
      >
        <Item key="name">Model Name</Item>
        <Item key="family">Family</Item>
      </Picker>
    </Flex>
  );
}
