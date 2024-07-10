import styles from '../app/ChatInterface.module.css';

export default function ChatMessage({ msg }) {
  return (
    <div className={`${styles.message} ${msg.isUser ? styles.userMessage : styles.botMessage}`}>
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
        {msg.documentUrl && (
          <div className={styles.chatDocumentWrapper}>
            <a href={msg.documentUrl} target="_blank" rel="noopener noreferrer" download={msg.documentName}>
              {msg.documentName}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}