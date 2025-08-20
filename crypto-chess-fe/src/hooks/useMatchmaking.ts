import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  collection, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  writeBatch,
  getDocs,
  getDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../services/firebase';

type Ticket = {
  id: string;
  userId: string;
  displayName?: string | null;
  createdAt: any;
};

type Match = {
  id: string;
  players: string[]; // [whiteUserId, blackUserId]
  createdAt: any;
  gameId: string;
};

/**
 * Simple FIFO matchmaking: a user creates a queue ticket; if another ticket exists, pair them and create a game doc id.
 */
export function useMatchmaking(currentUserId: string | undefined, displayName?: string | null) {
  const [searching, setSearching] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const opponentListenerRef = useRef<(() => void) | null>(null);

  // Clear state when user changes
  useEffect(() => {
    // Only clear if we actually have a user change
    if (currentUserId) {
      setSearching(false);
      setGameId(null);
      if (opponentListenerRef.current) {
        opponentListenerRef.current();
        opponentListenerRef.current = null;
      }
      
      // Clear any old matchmaking data for this user
      deleteDoc(doc(db, 'match_tickets', currentUserId)).catch(() => {});
    }
  }, [currentUserId]);

  // Additional safety check to prevent loops
  useEffect(() => {
    if (gameId && !searching) {
      // If we have a gameId but we're not searching, clear it
      setGameId(null);
    }
  }, [gameId, searching]);

  // Also clear any existing matches for this user when component mounts
  useEffect(() => {
    if (!currentUserId) return;
    
    // Clear any existing matches that might be stale
    const clearStaleData = async () => {
      try {
        // Clear matchmaking tickets
        await deleteDoc(doc(db, 'match_tickets', currentUserId)).catch(() => {});
        
        // Check for existing matches and clear if they're stale
        const matchesQuery = query(collection(db, 'matches'), where('players', 'array-contains', currentUserId));
        const matchesSnapshot = await getDocs(matchesQuery);
        
        matchesSnapshot.forEach(async (matchDoc) => {
          const matchData = matchDoc.data() as Match;
          // If match is older than 5 minutes, consider it stale
          if (matchData.createdAt) {
            const createdAt = matchData.createdAt.toDate ? matchData.createdAt.toDate() : new Date(matchData.createdAt);
            const now = new Date();
            const timeDiff = (now.getTime() - createdAt.getTime()) / 1000 / 60; // minutes
            
            if (timeDiff > 5) {
              await deleteDoc(matchDoc.ref).catch(() => {});
            }
          }
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error clearing stale data:', error);
      }
    };
    
    // Only clear data once when component first mounts
    const timeoutId = setTimeout(clearStaleData, 1000); // Delay by 1 second
    
    return () => clearTimeout(timeoutId);
  }, [currentUserId]);





  // Listen for a match assigned to this user
  useEffect(() => {
    if (!currentUserId) return;
    const q = query(collection(db, 'matches'), where('players', 'array-contains', currentUserId));
    const unsub = onSnapshot(q, (snap) => {
      const docChange = snap.docChanges().find((c) => c.type === 'added' || c.type === 'modified');
      const d = docChange?.doc;
      if (!d) return;
      const data = d.data() as Match;
      if (data.gameId) {
        setGameId(data.gameId);
        setSearching(false);
      }
    });
    return () => unsub();
  }, [currentUserId]);

  const cancel = useCallback(async () => {
    setSearching(false);
    if (!currentUserId) return;
    
    try {
      // Remove my ticket
      await deleteDoc(doc(db, 'match_tickets', currentUserId));
      
      if (opponentListenerRef.current) {
        opponentListenerRef.current();
        opponentListenerRef.current = null;
      }
      
      // eslint-disable-next-line no-console
      console.log('Matchmaking canceled for user:', currentUserId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error canceling matchmaking:', error);
    }
  }, [currentUserId]);

  const search = useCallback(async () => {
    if (!currentUserId) return;
    setSearching(true);

    try {
      // eslint-disable-next-line no-console
      console.log('🚀 Starting search for user:', currentUserId);

      // First, create my ticket
      try {
        // eslint-disable-next-line no-console
        console.log('📝 Attempting to create ticket for user:', currentUserId);
        
        await setDoc(doc(db, 'match_tickets', currentUserId), {
          userId: currentUserId,
          displayName: displayName || null,
          createdAt: serverTimestamp(),
        });
        
        // eslint-disable-next-line no-console
        console.log('✅ Ticket created successfully for user:', currentUserId);
        
        // Verify the ticket was actually created
        const verifyTicket = await getDoc(doc(db, 'match_tickets', currentUserId));
        if (verifyTicket.exists()) {
          // eslint-disable-next-line no-console
          console.log('✅ Ticket verification successful:', verifyTicket.data());
        } else {
          // eslint-disable-next-line no-console
          console.log('❌ Ticket verification failed - ticket does not exist');
        }
        
      } catch (ticketError) {
        // eslint-disable-next-line no-console
        console.error('❌ Error creating ticket:', ticketError);
        // eslint-disable-next-line no-console
        console.error('❌ Error details:', {
          code: (ticketError as any)?.code,
          message: (ticketError as any)?.message,
          stack: (ticketError as any)?.stack
        });
        setSearching(false);
        return;
      }

      // eslint-disable-next-line no-console
      console.log('🔍 Checking for existing opponents...');

      // Check if there are existing tickets from other players
      let existingTickets;
      try {
        existingTickets = await getDocs(collection(db, 'match_tickets'));
        // eslint-disable-next-line no-console
        console.log('📋 All tickets found:', existingTickets.docs.map(d => ({ id: d.id, data: d.data() })));
      } catch (ticketsError) {
        // eslint-disable-next-line no-console
        console.error('❌ Error fetching tickets:', ticketsError);
        setSearching(false);
        return;
      }

      const otherTickets = existingTickets.docs.filter(doc => doc.id !== currentUserId);
      // eslint-disable-next-line no-console
      console.log('👥 Other tickets found:', otherTickets.length, otherTickets.map(d => d.id));
      
      if (otherTickets.length > 0) {
        // Match with first available player
        const otherUserId = otherTickets[0].id;
        const newGameId = `game_${Date.now()}`;
        
        // eslint-disable-next-line no-console
        console.log(`🎯 Found opponent: ${otherUserId}, creating match immediately`);
        
        try {
          // Create match and clean up tickets
          const batch = writeBatch(db);
          const matchRef = doc(collection(db, 'matches'));
          batch.set(matchRef, {
            players: [currentUserId, otherUserId],
            createdAt: serverTimestamp(),
            gameId: newGameId,
          } as Match);
          batch.delete(doc(db, 'match_tickets', currentUserId));
          batch.delete(doc(db, 'match_tickets', otherUserId));
          
          // eslint-disable-next-line no-console
          console.log('🔄 Committing batch operation...');
          await batch.commit();
          // eslint-disable-next-line no-console
          console.log('✅ Match created successfully:', newGameId);
          
          setGameId(newGameId);
          setSearching(false);
          
          // Clean up listener
          if (opponentListenerRef.current) {
            opponentListenerRef.current();
            opponentListenerRef.current = null;
          }
          
          return;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('❌ Error creating match:', error);
          // If match creation fails, continue with normal flow
        }
      }

      // eslint-disable-next-line no-console
      console.log('⏳ No immediate opponent found, waiting for new players...');

      // Listen for new tickets (opponents joining)
      if (opponentListenerRef.current) {
        opponentListenerRef.current();
        opponentListenerRef.current = null;
      }
      
      // eslint-disable-next-line no-console
      console.log('👂 Setting up listener for new opponents...');
      
      opponentListenerRef.current = onSnapshot(collection(db, 'match_tickets'), async (snap) => {
        if (!currentUserId || !searching) {
          // eslint-disable-next-line no-console
          console.log('⚠️ Listener triggered but conditions not met:', { currentUserId, searching });
          return;
        }
        
        try {
          // eslint-disable-next-line no-console
          console.log('📡 Listener triggered, checking for opponents...');
          // eslint-disable-next-line no-console
          console.log('📋 Current tickets in collection:', snap.docs.map(d => ({ id: d.id, data: d.data() })));
          
          const others = snap.docs.filter((d) => d.id !== currentUserId);
          if (others.length === 0) {
            // eslint-disable-next-line no-console
            console.log('😔 No other players found yet...');
            return;
          }
          
          // eslint-disable-next-line no-console
          console.log(`🎉 Found ${others.length} potential opponents:`, others.map(d => d.id));
          
          const otherUserId = others[0].id;
          const newGameId = `game_${Date.now()}`;
          
          // eslint-disable-next-line no-console
          console.log(`🤝 Attempting to match with: ${otherUserId}`);
          
          // Double-check that both tickets still exist before creating match
          const myTicket = await getDoc(doc(db, 'match_tickets', currentUserId));
          const otherTicket = await getDoc(doc(db, 'match_tickets', otherUserId));
          
          if (!myTicket.exists() || !otherTicket.exists()) {
            // eslint-disable-next-line no-console
            console.log('❌ One of the tickets no longer exists, skipping match creation');
            return;
          }
          
          // eslint-disable-next-line no-console
          console.log(`✅ Both tickets confirmed, creating match between ${currentUserId} and ${otherUserId}`);
          
          // Create match
          const batch = writeBatch(db);
          const matchRef = doc(collection(db, 'matches'));
          batch.set(matchRef, {
            players: [currentUserId, otherUserId],
            createdAt: serverTimestamp(),
            gameId: newGameId,
          } as Match);
          batch.delete(doc(db, 'match_tickets', currentUserId));
          batch.delete(doc(db, 'match_tickets', otherUserId));
          
          try {
            // eslint-disable-next-line no-console
            console.log('🔄 Committing match creation batch...');
            await batch.commit();
            // eslint-disable-next-line no-console
            console.log(`🎊 Match created successfully: ${newGameId}`);
            
            setGameId(newGameId);
            setSearching(false);
            
            // Clean up listener
            if (opponentListenerRef.current) {
              opponentListenerRef.current();
              opponentListenerRef.current = null;
            }
          } catch (commitError) {
            // eslint-disable-next-line no-console
            console.error('❌ Error committing batch:', commitError);
            // If commit fails, the tickets might have been deleted by another process
            // Continue searching
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('❌ Error in matchmaking listener:', error);
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting matchmaking:', error);
      setSearching(false);
    }
  }, [currentUserId, displayName, searching]);

  // Prevent infinite loops by checking if we're already searching
  const safeSearch = useCallback(async () => {
    if (searching) return; // Already searching
    await search();
  }, [searching, search]);

  return { searching, search: safeSearch, cancel, gameId } as const;
}


