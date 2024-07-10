import { BedrockRuntimeClient, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });
const modelId = "anthropic.claude-3-sonnet-20240229-v1:0";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, messages } = req.body;

  try {
    console.log(message);

    const processedMessages = messages.map(msg => {
      if (msg.content && Array.isArray(msg.content)) {
        return {
          ...msg,
          content: msg.content.map(content => {
            if (content.image && content.image.source && Array.isArray(content.image.source.bytes)) {
              return {
                ...content,
                image: {
                  ...content.image,
                  source: {
                    ...content.image.source,
                    bytes: new Uint8Array(content.image.source.bytes)
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

    const command = new ConverseStreamCommand({
      modelId: modelId,
      messages: processedMessages,
      system: [{text: "You are a helpful AI assistant."}],
      inferenceConfig: {
        temperature: 0.5,
        topP: 1,
        maxTokens: 500,
      }
    });

    const response = await client.send(command);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    for await (const item of response.stream) {
      if (item.contentBlockDelta) {
        const text = item.contentBlockDelta.delta?.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          res.flush(); 
        }
      }
    }
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}
