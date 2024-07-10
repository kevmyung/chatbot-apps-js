import { ChatBedrockConverse } from "@langchain/aws";
import { HumanMessage } from "@langchain/core/messages";
import { BedrockRuntimeClient, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";

const model = new ChatBedrockConverse({
  model: "anthropic.claude-3-sonnet-20240229-v1:0",
  region: "us-east-1"
});
const modelId = "anthropic.claude-3-sonnet-20240229-v1:0";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, userId } = req.body;

  try {
    const processedMessages = messages.map(msg => {
      if (msg.content) {
        // Check if the message contains only text
        if (Array.isArray(msg.content) && msg.content.length === 1 && msg.content[0].text) {
          return msg.content[0].text;
        }

        // Handle messages with multiple content types
        if (Array.isArray(msg.content) && msg.content.length > 0) {
          const processedContent = msg.content.map(content => {
            if (content.text) {
              return {
                type: 'text',
                text: content.text
              };
            } else if (content.image && content.image.source && Array.isArray(content.image.source.bytes)) {
              return {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${Buffer.from(content.image.source.bytes).toString('base64')}`
                }
              };
            } else if (content.document && content.document.source && Array.isArray(content.document.source.bytes)) {
              return {
                type: 'document_url',
                document_url: {
                  url: `data:application/pdf;base64,${Buffer.from(content.document.source.bytes).toString('base64')}`
                }
              };
            }
            return content;
          });

          return { content: processedContent };
        }
      }
      return msg;
    });
    
    const stream = await model.stream([
      new HumanMessage(processedMessages[0]),
    ]);
  
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
  
    for await (const chunk of stream) {
      const text = chunk.content;
      if (text) {
        const message = `data: ${JSON.stringify({ text })}\n\n`;
        res.write(message);
        res.flush();
      }
    }
  
    res.end(); // Ensure the stream is closed properly
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}
