import React from 'react';
import styles from '../styles/ChatInterface.module.css';
import ChatMessage from './ChatMessage';

interface ChatAreaProps {
  messages: { id: number, text: string, isUser: boolean }[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isSearching: boolean;
}

export default function ChatArea({ messages, messagesEndRef, isSearching }: ChatAreaProps) {
  return (
    <div className={styles.chatArea}>
      {messages.map((message) => (
        <ChatMessage key={message.id} {...message} />
      ))}
      {isSearching && (
        <ChatMessage key="searching" text="Searching..." isUser={false} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}