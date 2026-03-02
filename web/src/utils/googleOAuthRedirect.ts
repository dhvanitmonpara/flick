import { env } from "@/config/env";
import { authClient } from "@/lib/auth-client";

let oauthPopup: Window | null = null;

const handleGoogleOAuthRedirect = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const { data } = await authClient.signIn.social({
    provider: "google",
    callbackURL: `${env.NEXT_PUBLIC_BASE_URL}/auth-success`,
    disableRedirect: true,
  })

  if (!data || !data.url) return

  openAuthWindow(data.url)
};

export const openAuthWindow = (authUrl: string) => {
  window.removeEventListener('storage', handleStorageEvent);
  window.addEventListener('storage', handleStorageEvent);

  window.removeEventListener('message', handleMessageEvent);
  window.addEventListener('message', handleMessageEvent);

  localStorage.removeItem('oauth_login_success');

  const authWindow = openCenteredWindow(authUrl, 'oauth_popup', 500, 600);

  if (!authWindow) {
    window.location.href = authUrl;
    return;
  }

  oauthPopup = authWindow;
};

const handleStorageEvent = (e: StorageEvent) => {
  if (e.key === 'oauth_login_success' && e.newValue === 'true') {
    window.removeEventListener('storage', handleStorageEvent);
    localStorage.removeItem('oauth_login_success');

    if (oauthPopup && !oauthPopup.closed) {
      try {
        oauthPopup.close();
      } catch (err) {
        console.error("Failed to close popup:", err);
      }
    }

    window.location.href = '/';
  }
};

const handleMessageEvent = (e: MessageEvent) => {
  if (e.origin !== window.location.origin) return;

  if (e.data === 'oauth-success') {
    window.removeEventListener('message', handleMessageEvent);

    if (oauthPopup && !oauthPopup.closed) {
      try {
        oauthPopup.close();
      } catch (err) {
        console.error("Failed to close popup:", err);
      }
    }

    window.location.href = '/';
  }
};

export const openCenteredWindow = (url: string, title: string, width: number, height: number) => {
  if (!window || !window.top) return null

  const x = window.top.outerWidth / 2 + window.top.screenX - width / 2
  const y = window.top.outerHeight / 2 + window.top.screenY - height / 2

  return window.open(
    url,
    title,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${y}, left=${x}`
  )
}

export { handleGoogleOAuthRedirect };
