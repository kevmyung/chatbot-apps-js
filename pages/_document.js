import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Preloading Google Fonts with as="style" */}
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600&display=swap"
            as="style"
          />
          {/* Loading Google Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;