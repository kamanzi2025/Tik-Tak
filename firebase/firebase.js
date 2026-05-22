// ─── Shared Firebase Config ───────────────────────────────────────────────────
// Both customer-app and staff-app connect to THIS SAME Firebase project.
// Copy your values from Firebase Console → Project Settings → Your apps → Web
//
// Setup:
//  1. console.firebase.google.com → create project
//  2. Add Web App → copy firebaseConfig
//  3. Authentication → Sign-in method → enable Email/Password
//  4. Firestore Database → Create database (production mode)
//  5. Paste config values into customer-app/src/firebase/config.js
//     AND staff-app/src/firebase/config.js (or symlink this file)
// ─────────────────────────────────────────────────────────────────────────────

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}
