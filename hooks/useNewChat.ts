import { useCallback } from 'react';

export default function useNewChat(resetMessages: () => void) {
  const handleNewChat = useCallback(() => {
    resetMessages();
  }, [resetMessages]);

  return { handleNewChat };
}