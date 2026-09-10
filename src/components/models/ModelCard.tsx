import React from 'react';
import { View, Flex, Text, StatusLight, Heading } from '@adobe/react-spectrum';
import { motion } from 'framer-motion';
import { ModelItem } from '../../models/ModelItem';

interface ModelCardProps {
  model: ModelItem;
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      style={{ cursor: 'pointer' }}
    >
      <View
        borderWidth="thin"
        borderColor="dark"
        borderRadius="medium"
        padding="size-200"
        backgroundColor="gray-50"
        UNSAFE_style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'box-shadow 0.2s' }}
      >
        <Flex direction="column" gap="size-100">
          <Heading level={4} margin="size-0">{model.name}</Heading>
          <Text UNSAFE_style={{ color: '#6e6e6e' }}>{model.author}</Text>
          
          {model.pipelineTag && (
            <StatusLight variant="positive">{model.pipelineTag}</StatusLight>
          )}
          
          <Flex direction="row" gap="size-100" wrap>
            {model.architectures?.map((arch, i) => (
              <View key={i} backgroundColor="blue-400" padding="size-50" borderRadius="small" UNSAFE_style={{ display: 'inline-block' }}>
                <Text UNSAFE_style={{ color: 'white', fontSize: '11px' }}>{arch}</Text>
              </View>
            ))}
          </Flex>
          
          <Flex direction="row" justifyContent="space-between">
            <Text>Safetensors: {model.safetensorCount || 0}</Text>
            <Text>↓ {model.downloads?.toLocaleString() || 0}</Text>
            <Text>♥ {model.likes || 0}</Text>
          </Flex>
        </Flex>
      </View>
    </motion.div>
  );
}
