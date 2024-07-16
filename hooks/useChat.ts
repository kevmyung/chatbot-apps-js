import { useState, useRef, FormEvent, KeyboardEvent } from 'react';
import usePasteHandler from './usePasteHandler';
import useFileHandler from './useFileHandler';
import { sendMessageToApi, searchApi, websearchApi } from '../utils/api';
import useMessageHandler from './useMessageHandler';

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  imageUrl?: string;
  documentUrls?: string[];
  documentNames?: string[];
}

export default function useChat(settings, searchSettings) {
  const {
    messages,
    messagesEndRef,
    addMessage,
    updateMessage,
    resetMessages
  } = useMessageHandler();

  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const { files, setFiles, handleFileChange, removeFile } = useFileHandler();

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

    const newMessageId = Date.now();

    addMessage({ id: newMessageId, text, isUser: true, imageUrl, documentUrls: fileUrls, documentNames: fileNames });
    inputRef.current!.innerHTML = '';
    setFiles([]);
    setIsLoading(true);
    setIsSearching(true);
    setErrorMessage(null);

    try {
      let ragResult = null;
      let websearchResult = null;
      const assistantMessageId = newMessageId + 1;

      if (settings.chatMode === 'RAG') {
        ragResult = await searchApi(text, settings.chatMode, searchSettings, settings.cohereRerankerApiKey || '');
        addMessage({ id: assistantMessageId, text: 'Done!', isUser: false });
      } else if (settings.chatMode === 'Web Search') {
        websearchResult = await websearchApi(text, settings.chatMode, settings.tavilySearchApiKey);
        addMessage({ id: assistantMessageId, text: 'Done!', isUser: false });
      } else {
        addMessage({ id: assistantMessageId, text: '', isUser: false });
      }

      setIsSearching(false);

      const response = await sendMessageToApi(text, imageUrl, files, settings, ragResult || websearchResult);

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let botResponse = '';

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

                updateMessage(assistantMessageId, botResponse);
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
      setIsSearching(false);
    }
  };

  return {
    messages,
    inputRef,
    messagesEndRef,
    isLoading,
    isSearching,
    errorMessage,
    handleSubmit,
    files,
    handleFileChange,
    removeFile,
    resetMessages
  };
}