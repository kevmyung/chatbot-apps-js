
# Bedrock Chatbot Apps (NextJS ver.)

## Overview

This is a Next.js-based web frontend application for a chatbot that leverages the Bedrock Converse API for model invocation. The application includes several key features:

### Basic Features
- **Next.js Web Frontend**: Built using the powerful Next.js framework.
        ![Basic chat](./images/Basic-chat.png)
- **Bedrock Converse API**: Utilizes the Bedrock Converse API for chatbot model invocation.

### Additional Features
- **Multi-modal Chat**: Supports multimodal interactions (File upload / Clipboard).
        ![Multimodal chat](./images/Multimodal-chat.png)
- **Environment Configuration**: Easy setup and configuration of the environment.
    - Chat Mode Selection : Normal / RAG / Web Search / Auto (Work In progress)
- **In-Memory Chat History**: Maintains chat history in memory to preserve the chat context.
- **RAG (Retrieval-Augmented Generation)**: Combines the LLM with an external knowledge base.
    - Vector DB Selection
        - ChromaDB (Default) : Utilizes local storage space.
        - Amazon OpenSearch Service : Domain endpoint and host auth. info should be defined in `py-backend/app/libs/opensearch.yml`.
    - Ingestion of Knowledge Base (PDF)
        ![RAG ingestion](./images/RAG-ingestion.png)   
    - Chat with RAG
        - Parent-Document Retrieval
        - Reranker : Cohere API key should be provided via `.env`
        ![RAG chat](./images/RAG-chat.png)   
- **Web Search**: Delivers real-time, factual results with a web search retriever.        
    - Tavily Web Search API key should be provided via `.env`
        ![Web search chat](./images/Web-search-chat.png)   



## File Structure

The project is organized as follows:

```
chatbot-apps-js/
├── .next/
├── components/ 
│   ├── ChatArea.tsx
│   ├── ChatMessage.tsx
│   ├── CopyButton.tsx
│   ├── FileUpload.tsx
│   ├── InputArea.tsx
│   ├── SearchPopup.tsx
│   ├── SearchSettings.tsx
│   ├── SettingsPopup.tsx
├── hooks/
│   ├── useChat.ts
│   ├── useFileHandler.ts
│   ├── useMessageHandler.ts
│   ├── useNewChat.ts
│   ├── usePasteHandler.ts
│   ├── useSearchHandler.ts
├── images/
│   ├── ...
├── node_modules/
│   ├── ...
├── pages/
│   ├── api/
│   ├── _app.tsx
│   ├── _document.js
│   ├── index.tsx
│   ├── layout.tsx
├── py-backend/
│   ├── app/
│   │   ├── app.py
│   │   ├── initialize.py
│   │   ├── process.py
│   │   ├── search.py
│   │   ├── websearch.py
│   │   ├── libs/
│   │   │   ├── opensearch_connector.py
│   │   │   ├── opensearch.py
├── styles/
│   ├── ChatInterface.module.css
│   ├── globals.css
│   ├── SearchPopup.module.css
│   ├── SettingsPopup.module.css
├── utils/
│   ├── api.ts
├── vectordb/
├── .env.example
├── package.json
├── README.md
├── SETUP.md
```

## Explaination

- `components/`: Reusable React components used throughout the application.
- `hooks/`: Custom hooks used to manage state and side effects in the application.
- `pages/`: Contains the main application files. This directory is also used for defining the application’s routes and API endpoints. 
- `public/`: Static files served by the Next.js application.
- `py-backend/`: The Python backend directory containing the FastAPI application and related scripts.
  - `app/`: Main FastAPI application and related scripts.
  - `libs/`: Custom helper libraries for backend services.
- `styles/`: CSS modules for styling the application.
- `utils/`: Utility functions and helpers used across the application.
- `vectordb/`: Directory for vector databases used in the application.
- `.env.example`: Example environment variables file. (should be given with `.env` for your usage.)
- `package.json`: NPM package file.
- `README.md`: Project overview and instructions.
- `SETUP.md`: Detailed setup instructions.


## Getting Started

To get started with the project, please refer to the `SETUP.md` file for detailed instructions on setting up your environment and running the application.

