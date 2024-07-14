import axios from 'axios';

export const useSearchHandler = () => {
  const uploadFiles = async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  const processFiles = async (filePaths: string[], embeddingModel: string, region: string, vectorStore: string) => {
    try {
      const formData = new FormData();
      formData.append('file_paths', filePaths.join(','));
      formData.append('embedding_model', embeddingModel);
      formData.append('region', region);
      formData.append('vector_store', vectorStore);

      console.log('Process formData:', {
        filePaths,
        embeddingModel,
        region,
        vectorStore
      });

      const response = await axios.post('/api/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Processing result:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error processing files:', error);
      throw error;
    }
  };

  const initializeFiles = async (embeddingModel: string) => {
    try {
      const formData = new FormData();
      formData.append('embedding_model', embeddingModel);
  
      const response = await axios.post('/api/initialize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });
      console.log('Initialization result:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error initializing files:', error);
      throw error;
    }
  };

  return { uploadFiles, processFiles, initializeFiles };
};