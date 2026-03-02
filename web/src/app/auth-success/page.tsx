'use client'

import { useEffect, useState } from 'react';

export default function AuthSuccess() {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    localStorage.setItem('oauth_login_success', 'true');

    setTimeout(() => {
      localStorage.removeItem('oauth_login_success');
    }, 100);

    if (window.opener) {
      window.opener.postMessage('oauth-success', window.location.origin);
    }

    try {
      window.close();
    } catch (e) { }

    const timer = setTimeout(() => {
      if (!window.opener && !localStorage.getItem('oauth_login_success')) {
        window.location.href = '/';
      } else {
        setShowFallback(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showFallback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg">Authentication successful!</p>
        <p className="text-sm text-zinc-500">You can safely close this window.</p>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 mt-4 bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 rounded-md hover:opacity-90 transition-opacity"
        >
          Close Window
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-zinc-500 animate-pulse">Completing sign in...</p>
    </div>
  );
}