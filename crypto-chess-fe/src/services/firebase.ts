import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID,
} = process.env as Record<string, string | undefined>;

const missingVars: string[] = [];
if (!REACT_APP_FIREBASE_API_KEY) missingVars.push('REACT_APP_FIREBASE_API_KEY');
if (!REACT_APP_FIREBASE_AUTH_DOMAIN) missingVars.push('REACT_APP_FIREBASE_AUTH_DOMAIN');
if (!REACT_APP_FIREBASE_PROJECT_ID) missingVars.push('REACT_APP_FIREBASE_PROJECT_ID');
if (!REACT_APP_FIREBASE_STORAGE_BUCKET) missingVars.push('REACT_APP_FIREBASE_STORAGE_BUCKET');
if (!REACT_APP_FIREBASE_MESSAGING_SENDER_ID) missingVars.push('REACT_APP_FIREBASE_MESSAGING_SENDER_ID');
if (!REACT_APP_FIREBASE_APP_ID) missingVars.push('REACT_APP_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}. Create a .env with these keys and restart the dev server.`);
}

const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY as string,
  authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN as string,
  projectId: REACT_APP_FIREBASE_PROJECT_ID as string,
  storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: REACT_APP_FIREBASE_APP_ID as string,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;


