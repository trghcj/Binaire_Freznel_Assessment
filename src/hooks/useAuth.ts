import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '../services/AuthService';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => void;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authService = AuthService.getInstance();
    const unsubscribe = authService.onAuthChange((newUser: User | null) => {
      setUser(newUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signUp = useCallback((email: string, password: string) => {
    setLoading(true);
    setError(null);
    const authService = AuthService.getInstance();
    authService.signUp(email, password)
      .then(() => {
        // onAuthChange will handle setting the user and loading state
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to sign up');
        setLoading(false);
      });
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    setLoading(true);
    setError(null);
    const authService = AuthService.getInstance();
    authService.signIn(email, password)
      .then(() => {
        // onAuthChange will handle setting the user and loading state
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to sign in');
        setLoading(false);
      });
  }, []);

  const signOut = useCallback(() => {
    setLoading(true);
    setError(null);
    const authService = AuthService.getInstance();
    authService.signOut()
      .then(() => {
        // onAuthChange will handle setting the user and loading state
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to sign out');
        setLoading(false);
      });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
    isAuthenticated: !!user,
  };
}
