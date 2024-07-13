module.exports = {
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
};