import React from 'react';
import { TableView, TableHeader, Column, TableBody, Row, Cell, Text, View } from '@adobe/react-spectrum';
import { ModelItem } from '../../models/ModelItem';

interface ModelTableProps {
  models: ModelItem[];
}

export function ModelTable({ models }: ModelTableProps) {
  return (
    <View borderWidth="thin" borderColor="dark" borderRadius="medium" overflow="hidden" height="size-6000">
      <TableView aria-label="Models Table" flex>
        <TableHeader>
          <Column key="name">Name</Column>
          <Column key="author">Author</Column>
          <Column key="pipeline">Pipeline</Column>
          <Column key="downloads">Downloads</Column>
          <Column key="likes">Likes</Column>
        </TableHeader>
        <TableBody items={models}>
          {(item: ModelItem) => (
            <Row key={item.rawId || item.name}>
              <Cell><Text UNSAFE_className="bold-text">{item.name}</Text></Cell>
              <Cell><Text>{item.author}</Text></Cell>
              <Cell><Text>{item.pipelineTag || 'N/A'}</Text></Cell>
              <Cell><Text>{item.downloads?.toLocaleString() || '0'}</Text></Cell>
              <Cell><Text>{item.likes?.toLocaleString() || '0'}</Text></Cell>
            </Row>
          )}
        </TableBody>
      </TableView>
    </View>
  );
}
