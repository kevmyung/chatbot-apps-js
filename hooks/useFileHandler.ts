import { useState, ChangeEvent } from 'react';

export default function useFileHandler() {
  const [files, setFiles] = useState<File[]>([]);
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      newFiles.forEach(file => {
        if (file.size <= MAX_FILE_SIZE) {
          validFiles.push(file);
        } else {
          alert(`File size exceeds 3MB: ${file.name}`);
        }
      });
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return {
    files,
    setFiles,
    handleFileChange,
    removeFile
  };
}