'use client';

import { useState } from 'react';
import styles from './ChatInterface.module.css';
import ChatArea from '../components/ChatArea';
import InputArea from '../components/InputArea';
import useChat from '../hooks/useChat';
import useNewChat from '../hooks/useNewChat';
import { FaRegEdit, FaCog, FaSearch } from 'react-icons/fa';
import SettingsPopup from '../components/SettingsPopup';
import SearchPopup from '../components/SearchPopup';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [settings, setSettings] = useState({
    region: 'us-east-1',
    model: 'anthropic.claude-3-sonnet-20240229-v1:0',
    systemPrompt: 'You are a helpful assistant',
    chatMode: 'Normal'
  });

  const [searchSettings, setSearchSettings] = useState({
    embeddingModel: 'amazon.titan-embed-text-v2:0',
    embRegion: 'us-east-1',
    vectorStore: 'OpenSearch'
  });

  const {
    messages,
    inputRef,
    messagesEndRef,
    isLoading,
    isSearching,
    handleSubmit,
    files,
    handleFileChange,
    removeFile,
    resetMessages,
    errorMessage
  } = useChat(settings, searchSettings);

  const { handleNewChat } = useNewChat(resetMessages);

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSettingsSave = (newSettings) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
    setIsSettingsOpen(false);
  };

  const handleSearchPopupOpen = () => {
    setIsSearchPopupOpen(true);
  };

  const handleSearchPopupClose = () => {
    setIsSearchPopupOpen(false);
  };

  const handleSearchSettingsSave = (newSearchSettings) => {
    setSearchSettings(prevSettings => ({ ...prevSettings, ...newSearchSettings }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bedrock Chatbot</h1>
      <div className={styles.buttonContainer}>
        <button className={styles.settingsButton} onClick={handleSettingsOpen}>
          <FaCog className={styles.icon} size={24} />
        </button>
        <button className={styles.searchButton} onClick={handleSearchPopupOpen}>
          <FaSearch className={styles.icon} size={24} />
        </button>
        <button className={styles.newChatButton} onClick={handleNewChat}>
          <FaRegEdit className={styles.icon} size={24} />
        </button>
      </div>
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      <ChatArea messages={messages} messagesEndRef={messagesEndRef} isSearching={isSearching} />
      <InputArea
        inputRef={inputRef}
        isLoading={isLoading}
        handleSubmit={(e) => handleSubmit(e, files)}
        files={files}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
      />
      {isSettingsOpen && <SettingsPopup settings={settings} onSave={handleSettingsSave} onClose={handleSettingsClose} />}
      {isSearchPopupOpen && (
        <SearchPopup
          onClose={handleSearchPopupClose}
          searchSettings={searchSettings}
          onSave={handleSearchSettingsSave}
        />
      )}
    </div>
  );
}