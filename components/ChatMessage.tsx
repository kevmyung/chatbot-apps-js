import styles from '../app/ChatInterface.module.css';

interface MessageProps {
  text: string;
  isUser: boolean;
  imageUrl?: string;
  documentUrls?: string[];
  documentNames?: string[];
}

export default function ChatMessage({ text, isUser, imageUrl, documentUrls, documentNames }: MessageProps) {
  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : styles.botMessage}`}>
      {!isUser && (
        <div className={styles.imageWrapper}>
          <img src="/bedrock.png" alt="Bot" className={styles.botImage} />
        </div>
      )}
      <div className={styles.messageContent}>
        {text}
        {imageUrl && isUser && (
          <div className={styles.chatImageWrapper}>
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              <img src={imageUrl} alt="Pasted image" className={styles.chatImage} />
            </a>
          </div>
        )}
        {documentUrls?.map((url, index) => (
          <div className={styles.chatDocumentWrapper} key={index}>
            <a href={url} target="_blank" rel="noopener noreferrer" download={documentNames?.[index]}>
              {documentNames?.[index]}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}