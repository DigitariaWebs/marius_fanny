import { authClient, normalizedApiUrl } from "../lib/AuthClient";

/**
 * Get the current session — works with both cookies AND bearer token.
 * Use this everywhere instead of authClient.getSession() to ensure
 * cross-domain compatibility.
 */
export async function getSessionUniversal(): Promise<{ user: any; session?: any } | null> {
  // Prefer bearer token if available — most reliable cross-domain
  const token = localStorage.getItem("bearer_token");

  if (token) {
    try {
      const response = await fetch(`${normalizedApiUrl}/api/auth/get-session`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      console.log("[getSession] bearer fetch status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("[getSession] bearer data:", data);
        if (data?.user) {
          return { user: data.user, session: data.session };
        }
      }
    } catch (e) {
      console.error("[getSession] bearer fetch error:", e);
    }
  }

  // Fallback: cookie-based session via better-auth
  try {
    const result = await authClient.getSession();
    console.log("[getSession] cookie result:", result);
    if (result?.data?.user) {
      return { user: result.data.user, session: result.data.session };
    }
  } catch (e) {
    console.error("[getSession] cookie error:", e);
  }

  return null;
}
