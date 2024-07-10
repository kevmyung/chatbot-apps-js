function getFileNameWithoutExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return fileName;
    return fileName.slice(0, lastDotIndex);
  }
  
  export async function sendMessageToApi(text: string, imageUrl: string, files: File[] | null) {
    const messages = [{ role: 'user', content: [] as any[] }];
  
    if (!text && files && files.length > 0) {
      text = 'empty text';
    }
  
    if (text) {
      messages[0].content.push({ text });
    }
  
    if (imageUrl) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const format = blob.type.split('/')[1];
  
      messages[0].content.push({
        image: {
          format,
          source: {
            bytes: Array.from(uint8Array) // Convert Uint8Array to regular array
          }
        }
      });
    }

    if (files) {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const format = file.name.split('.').pop()?.toLowerCase();
        const fileNameWithoutExtension = getFileNameWithoutExtension(file.name);
  
        console.log("processing file:", file.name, "format:", format);
  
        if (['jpg', 'jpeg', 'png'].includes(format || '')) {
          messages[0].content.push({
            image: {
              format,
              source: {
                bytes: Array.from(uint8Array) // Convert Uint8Array to regular array
              }
            }
          });
          console.log("added image to message:", file.name);
        } else if (['csv', 'txt', 'md'].includes(format || '')) {
          messages[0].content.push({
            document: {
              format,
              name: fileNameWithoutExtension,
              source: {
                bytes: Array.from(uint8Array) // Convert Uint8Array to regular array
              }
            }
          });
          console.log("added document to message:", fileNameWithoutExtension);
        } else {
          console.log("unsupported file format:", format);
        }
      }
    }
  
    if (messages[0].content.length === 0) {
      throw new Error('No content to send');
    }
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          userId: 'user123', 
        }),
      });
      
    console.log('API response status:', response.status); // Debug statement
  
    return response;
  }