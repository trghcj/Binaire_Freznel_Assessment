import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDMjsi4M0tTAXmD4bhhHhauGUNZDTsWyqY",
  authDomain: "binaire-freznelai-assessment.firebaseapp.com",
  projectId: "binaire-freznelai-assessment",
  storageBucket: "binaire-freznelai-assessment.firebasestorage.app",
  messagingSenderId: "759819838222",
  appId: "1:759819838222:web:a5ade5443a118470e8ad5f",
  measurementId: "G-LBVEV5FFB0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
