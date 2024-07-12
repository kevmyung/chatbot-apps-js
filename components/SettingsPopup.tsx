import React, { useState } from 'react';
import styles from '../app/SettingsPopup.module.css';

export default function SettingsPopup({ settings, onSave, onClose }) {
    const [region, setRegion] = useState(settings.region);
    const [model, setModel] = useState(settings.model);
    const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  
    const handleSave = () => {
      const newSettings = { region, model, systemPrompt };
      onSave(newSettings);
    };
  
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <h2>Settings</h2>
        <div className={styles.inputGroup}>
          <label>Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="us-east-1">North Virginia</option>
            <option value="us-west-2">Oregon</option>
            <option value="ap-southeast-1">Singapore</option>
            <option value="ap-southeast-2">Sydney</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
            <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku</option>
            <option value="anthropic.claude-3-5-sonnet-20240620-v1:0">Claude 3.5 Sonnet</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.saveButton} onClick={handleSave}>Save</button>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
