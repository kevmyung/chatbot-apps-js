'use client';

import styles from './ChatInterface.module.css';
import ChatArea from '../components/ChatArea';
import InputArea from '../components/InputArea';
import useChat from '../hooks/useChat';

export default function Home() {
  const {
    messages,
    inputRef,
    messagesEndRef,
    isLoading,
    handleSubmit,
    files,
    handleFileChange,
    removeFile
  } = useChat();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bedrock Chatbot</h1>
      <ChatArea messages={messages} messagesEndRef={messagesEndRef} />
      <InputArea
        inputRef={inputRef}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        files={files}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
      />
    </div>
  );
}