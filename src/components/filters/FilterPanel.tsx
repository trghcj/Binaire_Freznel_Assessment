import React from 'react';
import { Flex, View, Heading, ActionButton, Text, CheckboxGroup, Checkbox, RangeSlider } from '@adobe/react-spectrum';
import Close from '@spectrum-icons/workflow/Close';

interface FilterPanelProps {
  hook: any;
  isOpen: boolean;
  onToggle: () => void;
}

export function FilterPanel({ hook, isOpen, onToggle }: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <View>
      <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="size-200">
        <Heading level={3} margin="size-0">Filters</Heading>
        <ActionButton isQuiet onPress={onToggle}>
          <Close />
        </ActionButton>
      </Flex>
      
      <Flex direction="column" gap="size-300">
        <ActionButton onPress={hook.resetFilters} isDisabled={!hook.hasActiveFilters}>
          Reset Filters
        </ActionButton>

        <CheckboxGroup
          label="Pipeline"
          value={hook.filterCriteria.pipelineTags}
          onChange={hook.setPipelineFilter}
        >
          {hook.availablePipelineTags.slice(0, 10).map((tag: string) => (
            <Checkbox key={tag} value={tag}>{tag}</Checkbox>
          ))}
        </CheckboxGroup>

        <CheckboxGroup
          label="Family"
          value={hook.filterCriteria.familyTags}
          onChange={hook.setFamilyFilter}
        >
          {hook.availableFamilyTags.slice(0, 10).map((tag: string) => (
            <Checkbox key={tag} value={tag}>{tag}</Checkbox>
          ))}
        </CheckboxGroup>

        <CheckboxGroup
          label="Architecture"
          value={hook.filterCriteria.architectureTags}
          onChange={hook.setArchitectureFilter}
        >
          {hook.availableArchitectureTags.slice(0, 10).map((tag: string) => (
            <Checkbox key={tag} value={tag}>{tag}</Checkbox>
          ))}
        </CheckboxGroup>

        <RangeSlider
          label="Safetensor Count"
          minValue={0}
          maxValue={100}
          value={hook.filterCriteria.safetensorRange || { start: 0, end: 100 }}
          onChange={(v: any) => hook.setSafetensorRange(v.start, v.end)}
        />
      </Flex>
    </View>
  );
}
