import { useCallback, useState } from 'react';

/**
 * Simple local matchmaking for testing - simulates finding an opponent after a delay
 */
export function useLocalMatchmaking(currentUserId: string | undefined, displayName?: string | null) {
  const [searching, setSearching] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const cancel = useCallback(() => {
    setSearching(false);
    // eslint-disable-next-line no-console
    console.log('Local matchmaking canceled');
  }, []);

  const search = useCallback(() => {
    if (!currentUserId) return;
    setSearching(true);
    
    // eslint-disable-next-line no-console
    console.log('Starting local matchmaking simulation...');
    
    // Simulate finding an opponent after 3 seconds
    setTimeout(() => {
      const newGameId = `local_game_${Date.now()}`;
      setGameId(newGameId);
      setSearching(false);
      // eslint-disable-next-line no-console
      console.log('Local match found:', newGameId);
    }, 3000);
  }, [currentUserId]);

  return { searching, search, cancel, gameId } as const;
}
