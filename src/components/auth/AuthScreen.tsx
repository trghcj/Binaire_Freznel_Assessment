import React, { useState } from 'react';
import { View, Flex, Heading, TextField, Button, Text } from '@adobe/react-spectrum';
import { useAuth } from '../../hooks/useAuth';

export function AuthScreen() {
  const { signIn, signUp, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = () => {
    if (isSignUp) {
      signUp(email, password);
    } else {
      signIn(email, password);
    }
  };

  return (
    <View width="100vw" height="100vh" backgroundColor="gray-100" UNSAFE_style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <View padding="size-400" backgroundColor="gray-50" borderRadius="medium" borderWidth="thin" borderColor="dark" width="size-4600" UNSAFE_style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Flex direction="column" gap="size-200">
          <Heading level={2} margin="size-0" UNSAFE_style={{ textAlign: 'center' }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Heading>
          
          {error && <Text UNSAFE_style={{ color: 'red', textAlign: 'center' }}>{error}</Text>}
          
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            width="100%"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            width="100%"
          />
          
          <Button 
            variant="cta" 
            onPress={handleSubmit} 
            isDisabled={loading || !email || !password}
            marginTop="size-200"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Button>
          
          <Button variant="primary" isQuiet onPress={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </Flex>
      </View>
    </View>
  );
}
