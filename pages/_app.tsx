import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import '../styles/globals.css';
import { Parse } from '../lib/models';

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Parse初期化の確認
    if (Parse.applicationId) {
      setIsLoading(false);
    } else {
      console.error('Parse not initialized');
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}
