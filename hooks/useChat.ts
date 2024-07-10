import { useState, useEffect, useRef, FormEvent } from 'react';
import usePasteHandler from './usePasteHandler';
import { sendMessageToApi } from '../utils/api';

interface Message {
  text: string;
  isUser: boolean;
  imageUrl?: string;
}

export default function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  usePasteHandler(inputRef);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const text = inputRef.current?.innerText || '';
    const images = inputRef.current?.getElementsByTagName('img');

    let imageUrl = '';
    if (images?.length) {
      imageUrl = images[0].src;
    }

    setMessages(prev => [...prev, { text, isUser: true, imageUrl }]);
    inputRef.current!.innerHTML = '';
    setIsLoading(true);

    const response = await sendMessageToApi(text, imageUrl);

    if (response.ok) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let botResponse = '';

      setMessages(prev => [...prev, { text: '', isUser: false, imageUrl: '' }]);

      const readChunk = async () => {
        const { done, value } = await reader!.read();
        if (done) {
          setIsLoading(false);
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            const jsonText = line.slice(6);
            try {
              const parsedChunk = JSON.parse(jsonText);
              botResponse += parsedChunk.text;

              setMessages(prev => [
                ...prev.slice(0, -1),
                { text: botResponse, isUser: false, imageUrl: '' }
              ]);
            } catch (error) {
              console.error('JSON parsing error:', error);
            }
          }
        });
        readChunk();
      };
      readChunk();
    } else {
      console.error('Error:', response.statusText);
      setIsLoading(false);
    }
  };

  return {
    messages,
    inputRef,
    messagesEndRef,
    isLoading,
    handleSubmit
  };
}