import styles from '../app/ChatInterface.module.css';
import ChatMessage from './ChatMessage';
import { Message } from '../hooks/useChat';

interface ChatAreaProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatArea({ messages, messagesEndRef }: ChatAreaProps) {
  return (
    <div className={styles.chatArea}>
      {messages.map((msg, index) => (
        <ChatMessage key={index} {...msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}