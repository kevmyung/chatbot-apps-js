import styles from '../app/ChatInterface.module.css';

export default function InputArea({ inputRef, isLoading, handleSubmit }) {
  return (
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
  );
}