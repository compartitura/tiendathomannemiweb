// pages/_app.js
import '@fontsource/inter/variable.css';
import '@/styles/globals.css';
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
