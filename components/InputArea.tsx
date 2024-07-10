import React, { useRef, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { FaPaperclip, FaTimes } from 'react-icons/fa';
import styles from '../app/ChatInterface.module.css';
import { Message } from '../hooks/useChat';

interface InputAreaProps {
  inputRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  handleSubmit: (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLDivElement>, files: File[]) => Promise<void>;
  files: File[];
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
}

export default function InputArea({
  inputRef,
  isLoading,
  handleSubmit,
  files,
  handleFileChange,
  removeFile
}: InputAreaProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const tooLargeFiles: File[] = [];

      newFiles.forEach(file => {
        if (file.size <= MAX_FILE_SIZE) {
          validFiles.push(file);
        } else {
          tooLargeFiles.push(file);
          setErrorMessage(`File size exceeds 3MB: ${file.name}`);
        }
      });

      handleFileChange(e);
      if (tooLargeFiles.length > 0) {
        alert('Some files are too large to upload.');
      }
    }
  };

  const clearErrorMessage = () => {
    setErrorMessage(null);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleSubmit(e, files);
  };

  return (
    <div>
      <div className={styles.filePreview}>
        {files.map((file, index) => (
          <div key={index} className={styles.filePreviewItem}>
            {file.type.startsWith('image/') && <img src={URL.createObjectURL(file)} alt={file.name} />}
            <span>{file.name}</span>
            <button onClick={() => removeFile(index)}><FaTimes /></button>
          </div>
        ))}
      </div>
      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
          <button onClick={clearErrorMessage}><FaTimes /></button>
        </div>
      )}
      <form onSubmit={onSubmit} className={styles.inputArea} ref={formRef}>
        <label htmlFor="file-upload" className={styles.fileUploadLabel}>
          <FaPaperclip className={styles.clipIcon} />
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={onFileChange}
          className={styles.fileInput}
        />
        <div
          contentEditable
          ref={inputRef}
          className={styles.input}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />
        <button type="submit" className={styles.sendButton} disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}