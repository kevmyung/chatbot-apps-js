import { useState, useEffect, useRef } from 'react';
import { Message } from './useChat';

export default function useMessageHandler() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const updateMessage = (id: number, text: string) => {
    setMessages(prev =>
      prev.map(message => 
        message.id === id ? { ...message, text } : message
      )
    );
  };

  const resetMessages = async () => {
    setMessages([]);
  };

  return {
    messages,
    messagesEndRef,
    addMessage,
    updateMessage,
    resetMessages
  };
}