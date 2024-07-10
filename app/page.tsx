'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ChatInterface.module.css';

export default function Home() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; imageUrl?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault(); 
    const items = event.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (inputRef.current) {
                const img = document.createElement('img');
                img.src = e.target?.result as string;
                img.style.maxWidth = '200px';
                img.style.maxHeight = '200px';
                img.style.objectFit = 'contain';
                inputRef.current.appendChild(img);
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }
  };

  useEffect(() => {
    const inputElement = inputRef.current;
    inputElement?.addEventListener('paste', handlePaste);
    return () => {
      inputElement?.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: text,
        messages: [{ role: 'user', content: [{ text }] }]
      }),
    });

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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bedrock Chatbot</h1>
      <div className={styles.chatArea}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.isUser ? styles.userMessage : styles.botMessage}`}>
            {!msg.isUser && (
              <div className={styles.imageWrapper}>
                <img src="/bedrock.png" alt="Bot" className={styles.botImage} />
              </div>
            )}
            <div className={styles.messageContent}>
              {msg.text}
              {msg.imageUrl && msg.isUser && (
                <div className={styles.chatImageWrapper}>
                  <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                    <img src={msg.imageUrl} alt="Pasted image" className={styles.chatImage} />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.inputArea}>
        <div
          contentEditable
          ref={inputRef}
          className={styles.input}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
        />
        <button type="submit" className={styles.sendButton} disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}