import React from 'react';
import styles from '../styles/SearchPopup.module.css';
import SearchSettings from './SearchSettings';
import FileUpload from './FileUpload';

interface SearchPopupProps {
  onClose: () => void;
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

export default function SearchPopup({ onClose, searchSettings, onSave }: SearchPopupProps) {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <div className={styles.popupTitle}>Search Settings</div>
        <SearchSettings searchSettings={searchSettings} onSave={onSave} />
        <FileUpload searchSettings={searchSettings} onClose={onClose} />
      </div>
    </div>
  );
}