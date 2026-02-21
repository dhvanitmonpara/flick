import { env } from "@/config/env";

const handleGoogleOAuthRedirect = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth`;
  const params = new URLSearchParams({
    client_id: env.NEXT_PUBLIC_GOOGLE_OAUTH_ID,
    redirect_uri: `${env.NEXT_PUBLIC_SERVER_API_ENDPOINT}/auth/google/callback`,
    response_type: "code",
    scope: "email profile",
    access_type: "offline",
    prompt: "consent",
  });

  window.location.href = `${googleAuthUrl}?${params.toString()}`;
};

export { handleGoogleOAuthRedirect };
