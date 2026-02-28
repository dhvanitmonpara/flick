'use client'

import { useEffect, useState } from 'react';

export default function AuthSuccess() {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // 1. Fire the storage event for the parent window to detect and close us.
    // This is the most reliable cross-window communication method when COOP 
    // (Cross-Origin-Opener-Policy) breaks window references.
    localStorage.setItem('oauth_login_success', 'true');

    // Clean up the key so we can use it again later
    setTimeout(() => {
      localStorage.removeItem('oauth_login_success');
    }, 100);

    // 2. Try postMessage as a secondary method
    if (window.opener) {
      window.opener.postMessage('oauth-success', window.location.origin);
    }

    // 3. Try to close ourselves as a tertiary method
    try {
      window.close();
    } catch (e) {
      // Ignore
    }

    // 4. If nothing worked (which happens if navigated directly without an opener),
    // we show a fallback or redirect after a delay.
    const timer = setTimeout(() => {
      // If we still have an opener, maybe it just took long. But if window.opener
      // is completely null and we didn't get closed, the user probably navigated
      // here directly.
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

  // Render minimal content while parent closes us
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-zinc-500 animate-pulse">Completing sign in...</p>
    </div>
  );
}