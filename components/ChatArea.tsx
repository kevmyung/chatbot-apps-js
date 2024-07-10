import styles from '../app/ChatInterface.module.css';
import ChatMessage from './ChatMessage';

export default function ChatArea({ messages, messagesEndRef }) {
  return (
    <div className={styles.chatArea}>
      {messages.map((msg, index) => (
        <ChatMessage key={index} msg={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}