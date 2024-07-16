import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaRegCopy } from 'react-icons/fa';
import styles from '../styles/ChatInterface.module.css';

type Props = {
  code: string;
};

function CopyButton({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CopyToClipboard text={code} onCopy={handleCopy}>
      <button className={styles.copyButton}>
        {copied ? 'Copied!' : <FaRegCopy />}
      </button>
    </CopyToClipboard>
  );
}

export default CopyButton;