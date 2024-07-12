'use client';

import { useState } from 'react';
import styles from './ChatInterface.module.css';
import ChatArea from '../components/ChatArea';
import InputArea from '../components/InputArea';
import useChat from '../hooks/useChat';
import useNewChat from '../hooks/useNewChat';
import { FaRegEdit, FaCog } from 'react-icons/fa';
import SettingsPopup from '../components/SettingsPopup';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    region: 'us-east-1',
    model: 'anthropic.claude-3-sonnet-20240229-v1:0',
    systemPrompt: 'You are a helpful assistant'
  });

  const {
    messages,
    inputRef,
    messagesEndRef,
    isLoading,
    handleSubmit,
    files,
    handleFileChange,
    removeFile,
    resetMessages,
    errorMessage
  } = useChat(settings);

  const { handleNewChat } = useNewChat(resetMessages);

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bedrock Chatbot</h1>
      <div className={styles.buttonContainer}>
        <button className={styles.settingsButton} onClick={handleSettingsOpen}>
          <FaCog className={styles.icon} size={24} />
        </button>
        <button className={styles.newChatButton} onClick={handleNewChat}>
          <FaRegEdit className={styles.icon} size={24} />
        </button>
      </div>
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      <ChatArea messages={messages} messagesEndRef={messagesEndRef} />
      <InputArea
        inputRef={inputRef}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        files={files}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
      />
      {isSettingsOpen && <SettingsPopup settings={settings} onSave={handleSettingsSave} onClose={handleSettingsClose} />}
    </div>
  );
}