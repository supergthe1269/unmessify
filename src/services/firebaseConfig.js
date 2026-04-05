// Firebase configuration for UNMESSIFY
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA3ITw9TM3WETUBEq-w3f9T-DnWQxNhhyY",
  authDomain: "project-16541.firebaseapp.com",
  projectId: "project-16541",
  storageBucket: "project-16541.firebasestorage.app",
  messagingSenderId: "92871201934",
  appId: "1:92871201934:web:47d75ecade933cad9025df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Prompt user to select account every time (avoid auto-picking cached account)
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore
export const db = getFirestore(app);

export default app;
