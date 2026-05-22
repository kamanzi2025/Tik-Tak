// ─── Firebase Configuration ───────────────────────────────────────────────────
// 1. Go to https://console.firebase.google.com
// 2. Create a project called "grab-and-go" (or any name)
// 3. Register a Web App under Project Settings → Your apps → </>
// 4. Copy the firebaseConfig object values below
// 5. Enable Email/Password under Authentication → Sign-in method
// 6. Create a Firestore Database in production mode
// 7. Deploy firestore.rules from this project root
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
