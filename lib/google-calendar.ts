"use server";

import { getIntegration, upsertIntegration } from "@/lib/calendar-db";
import { refreshToken } from "@/lib/google";

export async function getValidAccessToken(userId: string) {
  const integration = await getIntegration(userId);
  if (!integration || !integration.accessToken) {
    throw new Error("google_not_connected");
  }
  if (integration.tokenExpiry) {
    const exp = new Date(integration.tokenExpiry).getTime();
    if (Date.now() < exp - 60_000) {
      return integration.accessToken;
    }
  }
  if (!integration.refreshToken) {
    throw new Error("google_refresh_missing");
  }
  const refreshed = await refreshToken(integration.refreshToken);
  const tokenExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await upsertIntegration(userId, {
    accessToken: refreshed.access_token,
    tokenExpiry,
  });
  return refreshed.access_token;
}
