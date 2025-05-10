// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head />
      <body className="font-inter antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
