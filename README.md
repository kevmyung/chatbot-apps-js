
# Bedrock Chatbot Apps (NextJS ver.)

## Overview

This is a Next.js-based web frontend application for a chatbot that leverages the Bedrock Converse API for model invocation. The application includes several key features:

![Basic Interface](./images/basic.png)

### Basic Features
- **Next.js Web Frontend**: Built using the powerful Next.js framework.
- **Bedrock Converse API**: Utilizes the Bedrock Converse API for chatbot model invocation.

### Additional Features
- **Multimodal Chat**: Supports multimodal interactions (File upload / Clipboard).
- **Environment Configuration**: Easy setup and configuration of the environment.
- **In-Memory Chat History**: Maintains chat history in memory for quick access.

## File Structure

The project is organized as follows:

```plaintext
chatbot-apps-js/
├── app/
│   ├── page.tsx
│   ├── ...
├── components/ 
│   ├── ...
├── hooks/
│   ├── ...
├── pages/
│   ├── ...
├── utils/
│   ├── ...
├── public/
│   ├── ...
├── package.json
├── README.md
└── SETUP.md
```


### Main Components

- **app/page.tsx** : This file is the main entry point of the application. It handles the rendering of the main chat interface and incorporates various components and hooks.

- **app/SettingsPopup.module.css** and **app/ChatInterface.module.css** : These CSS modules provide styling for the settings popup and chat interface respectively.

- **components/**: : This directory contains reusable React components used throughout the application.

- **hooks/** : Custom hooks used to manage state and side effects in the application.

- **pages/** : Next.js pages directory for defining the application’s routes (defines an API endpoint).

- **utils/** : Utility functions and helpers used across the application.


## Getting Started

To get started with the project, please refer to the `SETUP.md` file for detailed instructions on setting up your environment and running the application.

