import React from 'react';
import { Provider, defaultTheme } from '@adobe/react-spectrum';
import { AppShell } from './components/layout/AppShell';
import { AuthScreen } from './components/auth/AuthScreen';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Provider theme={defaultTheme}>
      {loading ? null : isAuthenticated ? <AppShell /> : <AuthScreen />}
    </Provider>
  );
}
