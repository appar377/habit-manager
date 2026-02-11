type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

export function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const webhookBaseUrl = process.env.GOOGLE_WEBHOOK_BASE_URL;
  if (!clientId || !clientSecret || !redirectUri || !webhookBaseUrl) {
    throw new Error("google_env_missing");
  }
  return { clientId, clientSecret, redirectUri, webhookBaseUrl };
}

export function buildAuthUrl(state: string) {
  const { clientId, redirectUri } = getGoogleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code,
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error("token_exchange_failed");
  return (await res.json()) as TokenResponse;
}

export async function refreshToken(refreshToken: string) {
  const { clientId, clientSecret } = getGoogleConfig();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error("token_refresh_failed");
  return (await res.json()) as TokenResponse;
}
