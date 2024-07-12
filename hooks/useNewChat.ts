import { useCallback } from 'react';

interface UseNewChatProps {
  resetMessages: () => void;
}

export default function useNewChat(resetMessages: () => void) {
  const handleNewChat = useCallback(async () => {
    await fetch("/api/new-chat", { method: "POST" });
    resetMessages();
  }, [resetMessages]);

  return { handleNewChat };
}