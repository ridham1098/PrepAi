// src/firebase/firebaseConfig.js
// ─────────────────────────────────────────────────────────
// HOW TO SETUP:
// 1. Go to https://console.firebase.google.com
// 2. Click "Add Project" → give it a name → Create
// 3. Go to Project Settings → "Your apps" → Click </> (Web)
// 4. Register app → Copy the firebaseConfig object
// 5. Replace the values below with YOUR config
// 6. Go to Authentication → Sign-in method → Enable Email/Password & Google
// ─────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDnn-ve8DhBloFlw5NW9YOM9mE_DLEZRg0",
  authDomain: "leaveupgrade.firebaseapp.com",
  projectId: "leaveupgrade",
  storageBucket: "leaveupgrade.firebasestorage.app",
  messagingSenderId: "458721056839",
  appId: "1:458721056839:web:f2bc48fee14dd85c317962",
  measurementId: "G-V7VT8HJJJD"
};

const app      = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
