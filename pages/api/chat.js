import { BufferMemory } from "langchain/memory";
import { BedrockRuntimeClient, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";

const chatPromptMemory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});

const region = "us-east-1";
const modelId = "anthropic.claude-3-sonnet-20240229-v1:0";
const system_prompt = "You are a helpful AI assistant.";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const client = new BedrockRuntimeClient({ region: region });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, userId } = req.body;
  
  try {
    const processedMessages = messages.map(msg => {
      if (msg.content && Array.isArray(msg.content) && msg.content.length > 0) {
        return {
          ...msg,
          content: msg.content.map(content => {
            if (content.image && content.image.source && Array.isArray(content.image.source.bytes)) {
              return {
                ...content,
                image: {
                  ...content.image,
                  source: {
                    bytes: new Uint8Array(content.image.source.bytes)
                  }
                }
              };
            } else if (content.document && content.document.source && Array.isArray(content.document.source.bytes)) {
              return {
                ...content,
                document: {
                  ...content.document,
                  source: {
                    bytes: new Uint8Array(content.document.source.bytes)
                  }
                }
              };
            }
            return content;
          })
        };
      }
      return msg;
    });

    chatPromptMemory.chatHistory.addMessage(processedMessages[0]);
    const chatHistoryData = await chatPromptMemory.loadMemoryVariables({});
    const commandMessage = chatHistoryData.chat_history.slice(-5)

    const command = new ConverseStreamCommand({
      modelId: modelId,
      system: [{text: system_prompt}],
      messages: commandMessage,
      inferenceConfig: {
        temperature: 0.5,
        topP: 1,
        maxTokens: 4096,
      }
    });

    const response = await client.send(command);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    let aiResponse = '';
    for await (const item of response.stream) {
      if (item.contentBlockDelta) {
        const text = item.contentBlockDelta.delta?.text;
        if (text) {
          aiResponse += text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          res.flush();
        }
      }
    }

    chatPromptMemory.chatHistory.addMessage({ role: "assistant", content: [{ text: aiResponse}]});
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}