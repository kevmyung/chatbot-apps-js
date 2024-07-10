export async function sendMessageToApi(text: string, imageUrl: string) {
    const messages = [{ role: 'user', content: [] as any[] }];
  
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
  
    return await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
  }
  