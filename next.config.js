require('dotenv').config();
const withTM = require('next-transpile-modules')(['react-syntax-highlighter']);

module.exports = withTM({
  reactStrictMode: true,
  env: {
    TAVILY_SEARCH_API_KEY: process.env.TAVILY_SEARCH_API_KEY,
    COHERE_RERANKER_API_KEY: process.env.COHERE_RERANKER_API_KEY,
  },
  devIndicators: {
    autoPrerender: false,
  },
  serverRuntimeConfig: {
    host: '0.0.0.0',
    port: 3000,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
});