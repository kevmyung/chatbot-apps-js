import React, { useState } from 'react';
import styles from '../app/SearchPopup.module.css';

interface SearchSettingsProps {
  searchSettings: {
    embeddingModel: string;
    embRegion: string;
    vectorStore: string;
  };
  onSave: (newSearchSettings: {
    embeddingModel: string;
    embRegion: string;
    vectorStore: string;
  }) => void;
}

export default function SearchSettings({ searchSettings, onSave }: SearchSettingsProps) {
  const [tempEmbeddingModel, setTempEmbeddingModel] = useState(searchSettings.embeddingModel);
  const [tempEmbRegion, setTempEmbRegion] = useState(searchSettings.embRegion);
  const [tempVectorStore, setTempVectorStore] = useState(searchSettings.vectorStore);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApplySettings = () => {
    onSave({
      embeddingModel: tempEmbeddingModel,
      embRegion: tempEmbRegion,
      vectorStore: tempVectorStore
    });
    setSuccessMessage('Settings applied successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSetDefaultSettings = () => {
    setTempEmbeddingModel('amazon.titan-embed-text-v2:0');
    setTempEmbRegion('us-east-1');
    setTempVectorStore('OpenSearch');
    setSuccessMessage('Settings reset to default!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className={styles.configBox}>
      <div className={styles.inputGroup}>
        <h4>Embedding Model</h4>
        <select value={tempEmbeddingModel} onChange={(e) => setTempEmbeddingModel(e.target.value)}>
          <option value="amazon.titan-embed-text-v2:0">Amazon Titan Embed Text V2</option>
          <option value="cohere.embed-english-v3">Cohere Embed English V3</option>
          <option value="cohere.embed-multilingual-v3">Cohere Embed Multilingual V3</option>
        </select>
        <select className={styles.marginTop} value={tempEmbRegion} onChange={(e) => setTempEmbRegion(e.target.value)}>
          <option value="us-east-1">North Virginia</option>
          <option value="us-west-2">Oregon</option>
          <option value="ap-southeast-1">Singapore</option>
          <option value="ap-southeast-2">Sydney</option>
        </select>
      </div>
      <div className={styles.inputGroup}>
        <h4>Vector Store</h4>
        <select value={tempVectorStore} onChange={(e) => setTempVectorStore(e.target.value)}>
          <option value="OpenSearch">OpenSearch</option>
        </select>
      </div>
      <div className={styles.buttonGroup}>
        <button className={styles.applyButton} onClick={handleApplySettings}>Apply</button>
        <button className={styles.setDefaultButton} onClick={handleSetDefaultSettings}>Set Default</button>
      </div>
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
    </div>
  );
}