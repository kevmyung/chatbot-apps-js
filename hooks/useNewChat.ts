import { useCallback } from 'react';

export default function useNewChat(resetMessages: () => void) {
  const handleNewChat = useCallback(async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reset: true,
          messages: [],
          userId: null,
          settings: {},
        }),
      });
      const data = await response.json();
      if (data.message === 'Memory reset successful') {
        resetMessages();
      } else {
        console.error('Memory reset failed', data);
      }
    } catch (error) {
      console.error('Error resetting memory', error);
    }
  }, [resetMessages]);

  return { handleNewChat };
}