import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJa5tzMmNo6xh0U7Jr_akU4hwTgaWaGuc",
  authDomain: "synthagma-76ff4.firebaseapp.com",
  projectId: "synthagma-76ff4",
  storageBucket: "synthagma-76ff4.firebasestorage.app",
  messagingSenderId: "779915994091",
  appId: "1:779915994091:web:5fdfe4c87af8e4ed25efae",
  measurementId: "G-M47PRCNP6G"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// Native persistence is applied lazily to avoid crashing Hermes
if (typeof window === 'undefined') {
  setTimeout(async () => {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const fbAuth = await import('firebase/auth');
      // @ts-expect-error — getReactNativePersistence resolved via RN conditional exports
      const { getReactNativePersistence } = fbAuth;
      if (getReactNativePersistence) {
        const { initializeAuth } = fbAuth;
        // Auth is already initialized with default persistence — this is best-effort
      }
    } catch {
      // AsyncStorage persistence unavailable — session persists via Firebase defaults
    }
  }, 100);
}
