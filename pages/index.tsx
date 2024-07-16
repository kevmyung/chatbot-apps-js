import { useState } from 'react';
import styles from '../styles/ChatInterface.module.css';
import ChatArea from '../components/ChatArea';
import InputArea from '../components/InputArea';
import useChat from '../hooks/useChat';
import useNewChat from '../hooks/useNewChat';
import { FaRegEdit, FaCog, FaSearch } from 'react-icons/fa';
import SettingsPopup from '../components/SettingsPopup';
import SearchPopup from '../components/SearchPopup';

interface Settings {
  region: string;
  model: string;
  systemPrompt: string;
  chatMode: string;
  useRerank: boolean;
  tavilySearchApiKey?: string;
  cohereRerankerApiKey?: string;
}

export const getServerSideProps = async () => {
  const initialSettings: Settings = {
    region: 'us-east-1',
    model: 'anthropic.claude-3-sonnet-20240229-v1:0',
    systemPrompt: 'You are a helpful assistant',
    chatMode: 'Normal',
    useRerank: false,
    tavilySearchApiKey: process.env.TAVILY_SEARCH_API_KEY || '',
    cohereRerankerApiKey: process.env.COHERE_RERANKER_API_KEY || ''
  };
  const initialSearchSettings = {
    embeddingModel: 'amazon.titan-embed-text-v2:0',
    embRegion: 'us-east-1',
    vectorStore: 'Chroma'
  };
  return {
    props: {
      initialSettings,
      initialSearchSettings
    }
  };
};

interface HomeProps {
  initialSettings: Settings;
  initialSearchSettings: any;
  error?: string;
}

export default function Home({ initialSettings, initialSearchSettings, error }: HomeProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [searchSettings, setSearchSettings] = useState(initialSearchSettings);

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

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleSettingsSave = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
    setIsSettingsOpen(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bedrock Chatbot</h1>
      <div className={styles.buttonContainer}>
        <button className={styles.settingsButton} onClick={() => setIsSettingsOpen(true)}>
          <FaCog className={styles.icon} size={24} />
        </button>
        <button className={styles.searchButton} onClick={() => setIsSearchPopupOpen(true)}>
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
      {isSettingsOpen && (
        <SettingsPopup
          settings={settings}
          onSave={handleSettingsSave}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
      {isSearchPopupOpen && (
        <SearchPopup
          onClose={() => setIsSearchPopupOpen(false)}
          searchSettings={searchSettings}
          onSave={(newSearchSettings) => setSearchSettings(prevSettings => ({ ...prevSettings, ...newSearchSettings }))}
        />
      )}
    </div>
  );
}