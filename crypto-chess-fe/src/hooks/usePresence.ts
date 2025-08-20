import { useEffect, useRef } from 'react';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Tracks authenticated user's presence by updating a heartbeat in Firestore.
 * Considers a user online if their lastActive is within the past minute.
 */
export function usePresence(userId: string | undefined, displayName?: string | null) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) {
      // Clear presence when no user
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const ref = doc(db, 'presence', userId);
    const now = serverTimestamp();

    // Mark online immediately
    setDoc(
      ref,
      {
        userId,
        displayName: displayName || null,
        status: 'online',
        lastActive: now,
        updatedAt: now,
      },
      { merge: true }
    ).catch(() => {});

    // Heartbeat every 25s
    intervalRef.current = window.setInterval(() => {
      updateDoc(ref, { status: 'online', lastActive: serverTimestamp(), updatedAt: serverTimestamp() }).catch(
        () => {}
      );
    }, 25000);

    // On unload, try to set offline
    const handleUnload = () => {
      updateDoc(ref, { status: 'offline', updatedAt: serverTimestamp() }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      window.removeEventListener('beforeunload', handleUnload);
      // Set offline when cleaning up
      updateDoc(ref, { status: 'offline', updatedAt: serverTimestamp() }).catch(() => {});
    };
  }, [userId, displayName]);
}


