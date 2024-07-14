import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from '../app/SearchPopup.module.css';
import { useSearchHandler } from '../hooks/useSearchHandler';

interface FileData {
  name: string;
  size: number;
  path: string;
}

interface FileUploadProps {
  searchSettings: {
    embeddingModel: string;
    embRegion: string;
    vectorStore: string;
  };
  onClose: () => void;
}

export default function FileUpload({ searchSettings, onClose }: FileUploadProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': []
    },
    onDrop: handleDrop
  });

  const [files, setFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const { uploadFiles, processFiles, initializeFiles } = useSearchHandler();

  async function handleDrop(acceptedFiles: File[]) {
    clearMessages();
    try {
      const response = await uploadFiles(acceptedFiles);
      setFiles(response.file_paths.map((path: string, index: number) => ({
        name: acceptedFiles[index].name,
        size: acceptedFiles[index].size,
        path
      })));
      setErrorMessage(null);
      setSuccessMessage('Files uploaded successfully.');
    } catch (error) {
      console.error('Error uploading files:', error);
      setErrorMessage('An error occurred while uploading the files.');
    }
  }

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setInfoMessage(null);
  };

  const handleUnselect = () => {
    setFiles([]);
    clearMessages();
  };

  const handleProcess = async () => {
    clearMessages();
    if (files.length === 0) {
      setErrorMessage('No files selected. Please select at least one file to process.');
      return;
    }

    setIsProcessing(true);

    try {
      const filePaths = files.map(file => file.path);
      await processFiles(filePaths, searchSettings.embeddingModel, searchSettings.embRegion, searchSettings.vectorStore);
      setErrorMessage(null);
      setInfoMessage('Processing Job submitted successfully.');
    } catch (error) {
      console.error('Error processing files:', error);
      setErrorMessage('An error occurred while processing the files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitialize = async () => {
    clearMessages();
    setIsProcessing(true);
    try {
      await initializeFiles(searchSettings.embeddingModel);
      setSuccessMessage('Initialization successful.');
    } catch (error) {
      console.error('Error initializing files:', error);
      setErrorMessage('An error occurred during initialization.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onClose();
    clearMessages();
  };

  return (
    <div>
      <h4>Knowledge Base Ingestion</h4>
      <div {...getRootProps({ className: styles.dropzone })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop files here, or click to select files</p>
      </div>
      <aside>
        <h4>Selected Files</h4>
        <ul>
          {files.map(file => (
            <li key={file.path}>
              {file.name} - {file.size} bytes
            </li>
          ))}
        </ul>
      </aside>
      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
          <button className={styles.messageCloseButton} onClick={() => setErrorMessage(null)}>x</button>
        </div>
      )}
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
          <button className={styles.messageCloseButton} onClick={() => setSuccessMessage(null)}>x</button>
        </div>
      )}
      {infoMessage && (
        <div className={styles.infoMessage}>
          {infoMessage}
          <button className={styles.messageCloseButton} onClick={() => setInfoMessage(null)}>x</button>
        </div>
      )}
      <div className={styles.buttonGroup}>
        <button className={`${styles.modalCloseButton} ${isProcessing ? styles.disabledButton : ''}`} onClick={handleClose} disabled={isProcessing}>Close</button>
        <button className={`${styles.processButton} ${isProcessing ? styles.disabledButton : ''}`} onClick={handleProcess} disabled={isProcessing}>Process</button>
        <button className={`${styles.unselectButton} ${isProcessing ? styles.disabledButton : ''}`} onClick={handleUnselect} disabled={isProcessing}>Unselect</button>
        <button className={`${styles.initializeButton} ${isProcessing ? styles.disabledButton : ''}`} onClick={handleInitialize} disabled={isProcessing}>Initialize</button>
      </div>
      {isProcessing && <div className={styles.loader}>Now Processing...</div>}
    </div>
  );
}