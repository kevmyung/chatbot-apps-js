import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import usePasteHandler from './usePasteHandler';
import useFileHandler from './useFileHandler';
import { sendMessageToApi } from '../utils/api';

export interface Message {
  text: string;
  isUser: boolean;
  imageUrl?: string;
  documentUrls?: string[];
  documentNames?: string[];
}

export default function useChat(settings) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { files, setFiles, handleFileChange, removeFile } = useFileHandler();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  usePasteHandler(inputRef);

  const handleSubmit = async (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLDivElement>, files: File[]) => {
    e.preventDefault();
    if (isLoading) return;

    const text = inputRef.current?.innerText.trim() || '';
    const images = inputRef.current?.getElementsByTagName('img');

    let imageUrl = '';
    if (images?.length) {
      imageUrl = images[0].src;
    }

    const fileUrls = files.map(file => URL.createObjectURL(file));
    const fileNames = files.map(file => file.name);

    if (!text && !imageUrl && files.length === 0) {
      console.error('No content to send');
      return;
    }

    setMessages(prev => [
      ...prev,
      { text, isUser: true, imageUrl, documentUrls: fileUrls, documentNames: fileNames }
    ]);
    inputRef.current!.innerHTML = '';
    setFiles([]);
    setIsLoading(true);
    setErrorMessage(null);  // 에러 메시지 초기화

    try {
      const response = await sendMessageToApi(text, imageUrl, files, settings);

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let botResponse = '';

        setMessages(prev => [...prev, { text: '', isUser: false }]);

        const readChunk = async () => {
          const { done, value } = await reader!.read();
          if (done) {
            setIsLoading(false);
            return;
          }
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              const jsonText = line.slice(6);
              try {
                const parsedChunk = JSON.parse(jsonText);
                botResponse += parsedChunk.text;

                setMessages(prev => [
                  ...prev.slice(0, -1),
                  { text: botResponse, isUser: false }
                ]);
              } catch (error) {
                console.error('JSON parsing error:', error);
              }
            }
          });
          readChunk();
        };
        readChunk();
      } else {
        setErrorMessage('An API error occurred. Please reset the chat or check your configuration.');
        console.error('API response error:', response.statusText);
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage('An API error occurred. Please reset the chat or check your configuration.');
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const resetMessages = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  return {
    messages,
    inputRef,
    messagesEndRef,
    isLoading,
    errorMessage,
    handleSubmit,
    files,
    handleFileChange,
    removeFile,
    resetMessages
  };
}