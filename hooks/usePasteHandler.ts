import { useEffect } from 'react';

export default function usePasteHandler(inputRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault(); 
      const items = event.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                if (inputRef.current) {
                  const img = document.createElement('img');
                  img.src = e.target?.result as string;
                  img.style.maxWidth = '200px';
                  img.style.maxHeight = '200px';
                  img.style.objectFit = 'contain';
                  inputRef.current.appendChild(img);
                }
              };
              reader.readAsDataURL(file);
            }
          }
        }
      }
    };

    const inputElement = inputRef.current;
    inputElement?.addEventListener('paste', handlePaste);
    return () => {
      inputElement?.removeEventListener('paste', handlePaste);
    };
  }, [inputRef]);
}