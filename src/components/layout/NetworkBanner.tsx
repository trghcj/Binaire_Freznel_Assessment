import React from 'react';
import { View, Flex, Text } from '@adobe/react-spectrum';
import Alert from '@spectrum-icons/workflow/Alert';
import { useNetwork } from '../../hooks/useNetwork';

export function NetworkBanner() {
  const { isOnline } = useNetwork();

  if (isOnline) {
    return null;
  }

  return (
    <View backgroundColor="negative" padding="size-100">
      <Flex direction="row" gap="size-100" alignItems="center" justifyContent="center">
        <Alert size="S" color="negative" />
        <Text UNSAFE_style={{ color: 'white' }}>
          You are currently offline. Displaying cached data.
        </Text>
      </Flex>
    </View>
  );
}
