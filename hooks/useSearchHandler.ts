import axios from 'axios';

export const useSearchHandler = () => {
  const processFiles = async (formData: FormData) => {
    try {
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
        }
      });
      console.log('Initialization result:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error initializing files:', error);
      throw error;
    }
  };

  return { processFiles, initializeFiles };
};