import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bedrock Chatbot",
  description: "Written with JS for Bedrock users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link
          rel="preload"
          href={`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap`}
          as="style"
          onLoad={(e) => {
            (e.target as HTMLLinkElement).rel = 'stylesheet';
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap`}
          />
        </noscript>
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}