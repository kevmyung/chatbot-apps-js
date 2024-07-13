import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from '../app/SearchPopup.module.css';
import { useSearchHandler } from '../hooks/useSearchHandler';

interface FileData {
  name: string;
  size: number;
  file: File;
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
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'application/pdf': []
    }
  });

  const [files, setFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { processFiles, initializeFiles } = useSearchHandler();

  useEffect(() => {
    setFiles(acceptedFiles.map(file => ({ name: file.name, size: file.size, file: file })));
  }, [acceptedFiles]);

  const handleUnselect = () => {
    setFiles([]);
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setErrorMessage('No files selected. Please select at least one file to process.');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      files.forEach(fileData => {
        formData.append('files', fileData.file);
      });
      formData.append('embedding_model', searchSettings.embeddingModel);
      formData.append('region', searchSettings.embRegion);
      formData.append('vector_store', searchSettings.vectorStore);

      await processFiles(formData);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error processing files:', error);
      setErrorMessage('An error occurred while processing the files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitialize = async () => {
    setIsProcessing(true);
    try {
      await initializeFiles(searchSettings.embeddingModel);
    } catch (error) {
      console.error('Error initializing files:', error);
    } finally {
      setIsProcessing(false);
    }
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
            <li key={file.name}>
              {file.name} - {file.size} bytes
            </li>
          ))}
        </ul>
      </aside>
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      <div className={styles.buttonGroup}>
        <button className={`${styles.closeButton} ${isProcessing ? styles.disabledButton : ''}`} onClick={onClose} disabled={isProcessing}>Close</button>
        <button className={`${styles.processButton} ${isProcessing ? styles.disabledButton : ''}`} onClick={handleProcess} disabled={isProcessing}>Process</button>
        <button className={`${styles.unselectButton} ${isProcessing ? styles.disabledButton : ''}`} onClick={handleUnselect} disabled={isProcessing}>Unselect</button>
        <button className={`${styles.initializeButton} ${isProcessing ? styles.disabledButton : ''}`} onClick={handleInitialize} disabled={isProcessing}>Initialize</button>
      </div>
      {isProcessing && <div className={styles.loader}>Now Processing...</div>}
    </div>
  );
}