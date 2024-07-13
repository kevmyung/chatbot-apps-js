import React, { useState } from 'react';
import styles from '../app/SettingsPopup.module.css';

export default function SettingsPopup({ settings, onSave, onClose }) {
  const [region, setRegion] = useState(settings.region);
  const [model, setModel] = useState(settings.model);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  const [chatMode, setChatMode] = useState(settings.chatMode || 'Normal');

  const handleSave = () => {
    const newSettings = { region, model, systemPrompt, chatMode };
    onSave(newSettings);
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <div className={styles.inputGroup}>
          <label>Chat Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
            <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku</option>
            <option value="anthropic.claude-3-5-sonnet-20240620-v1:0">Claude 3.5 Sonnet</option>
          </select>
          <select className={styles.marginTop} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="us-east-1">North Virginia</option>
            <option value="us-west-2">Oregon</option>
            <option value="ap-southeast-1">Singapore</option>
            <option value="ap-southeast-2">Sydney</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={8}  
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Chat Mode</label>
          <select value={chatMode} onChange={(e) => setChatMode(e.target.value)}>
            <option value="Normal">Normal</option>
            <option value="RAG">RAG</option>
            <option value="Web Search">Web Search</option>
            <option value="Auto">Auto</option>
          </select>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.saveButton} onClick={handleSave}>Save</button>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}