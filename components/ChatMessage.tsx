import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from './CopyButton';
import styles from '../styles/ChatInterface.module.css';

interface MessageProps {
  text: string;
  isUser: boolean;
  imageUrl?: string;
  documentUrls?: string[];
  documentNames?: string[];
}

function isCodeBlock(text: string) {
  return text.startsWith('```') && text.endsWith('```');
}

function getCodeLanguage(text: string) {
  const match = text.match(/```(\w+)?/);
  return match ? match[1] : 'text';
}

function stripCodeBlockMarkers(text: string) {
  return text.replace(/```[\w]*\n/, '').replace(/```$/, '');
}

export default function ChatMessage({ text, isUser, imageUrl, documentUrls, documentNames }: MessageProps) {
  const parts = text.split(/(```[\s\S]*?```)/);

  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : styles.botMessage}`}>
      {!isUser && (
        <div className={styles.imageWrapper}>
          <img src="/bedrock.png" alt="Bot" className={styles.botImage} />
        </div>
      )}
      <div className={styles.messageContent}>
        {parts.map((part, index) => {
          if (isCodeBlock(part)) {
            const language = getCodeLanguage(part);
            const code = stripCodeBlockMarkers(part);
            return (
              <div key={index} className={styles.codeBlockWrapper}>
                <CopyButton code={code} />
                <SyntaxHighlighter language={language} style={dracula} customStyle={{
                  border: "1px solid #c3c3c3",
                  borderRadius: "5px",
                  padding: "1em"
                }}>
                  {code}
                </SyntaxHighlighter>
              </div>
            );
          }
          return (
            <span key={index}>
              {part.split(/(`[^`]+`)/).map((subPart, subIndex) =>
                subPart.startsWith('`') && subPart.endsWith('`') ? (
                  <code key={subIndex} className={styles.inlineCode}>
                    {subPart.slice(1, -1)}
                  </code>
                ) : (
                  subPart
                )
              )}
            </span>
          );
        })}
        {imageUrl && isUser && (
          <div className={styles.chatImageWrapper}>
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              <img src={imageUrl} alt="Pasted image" className={styles.chatImage} />
            </a>
          </div>
        )}
        {documentUrls?.map((url, index) => (
          <div className={styles.chatDocumentWrapper} key={index}>
            <a href={url} target="_blank" rel="noopener noreferrer" download={documentNames?.[index]}>
              {documentNames?.[index]}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}