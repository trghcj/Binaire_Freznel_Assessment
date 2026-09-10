import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Unsubscribe,
} from 'firebase/auth';

export type AuthCallback = (user: User | null) => void;

export class AuthService {
  private static instance: AuthService; // singleton
  private currentUser: User | null = null;
  private listeners: Set<AuthCallback> = new Set();
  private unsubscribeAuth: Unsubscribe | null = null;

  private constructor() {
    this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.listeners.forEach(listener => listener(user));
    });
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  signUp(email: string, password: string): Promise<User> {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => userCredential.user);
  }

  signIn(email: string, password: string): Promise<User> {
    return signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => userCredential.user);
  }

  signOut(): Promise<void> {
    return firebaseSignOut(auth);
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  onAuthChange(callback: AuthCallback): () => void {
    this.listeners.add(callback);
    callback(this.currentUser);
    return () => {
      this.listeners.delete(callback);
    };
  }

  dispose(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    this.listeners.clear();
  }
}
