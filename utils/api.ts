import axios from 'axios';

export async function sendMessageToApi(text: string, imageUrl: string, files: File[] | null, settings, searchResult: any = null) {
  const messages = [{ role: 'user', content: [] as any[] }];

  if (!text && files && files.length > 0) {
    text = 'empty text';
  }

  if (text) {
    if (searchResult) {
      const contextContent = searchResult.map((item: any) => item.content).join('\n---\n');
      const formattedRagResult = `Using the context below, answer the User Question. <context>\n${contextContent}\n</context>\n\nQuestion: ${text}`;
      messages[0].content.push({ text: formattedRagResult });
    } else {
      messages[0].content.push({ text });
    }
    console.log("prompt:", messages[0].content)
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
          bytes: Array.from(uint8Array) 
        }
      }
    });
  }

  if (files) {
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const format = file.name.split('.').pop()?.toLowerCase();

      console.log("processing file:", file.name, "format:", format);

      if (['jpg', 'jpeg', 'png'].includes(format || '')) {
        messages[0].content.push({
          image: {
            format,
            source: {
              bytes: Array.from(uint8Array)
            }
          }
        });
        console.log("added image to message:", file.name);
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
    body: JSON.stringify({ messages: messages, settings: settings, userId: 'user123' }),
  });

  console.log('API response status:', response.status); 
  return response;
}

export async function searchApi(text: string, chatMode: string, searchSettings: any) {
  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('chat_mode', chatMode);
    formData.append('search_settings', JSON.stringify(searchSettings));

    const response = await axios.post('/api/search', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    const data = JSON.parse(response.data.output);
    return data;
  } catch (error) {
    console.error('Error calling search API:', error);
    throw error;
  }
}

export async function websearchApi(text: string, chatMode: string, tavilySearchApiKey: string) {
  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('chat_mode', chatMode);
    formData.append('tavily_search_key', tavilySearchApiKey);

    const response = await axios.post('/api/websearch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    const data = JSON.parse(response.data.output);
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error calling search API:', error);
    throw error;
  }
}