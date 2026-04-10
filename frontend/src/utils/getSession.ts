import { authClient, normalizedApiUrl } from "../lib/AuthClient";

/**
 * Get the current session — works with both cookies AND bearer token.
 * Use this everywhere instead of authClient.getSession() to ensure
 * cross-domain compatibility.
 */
export async function getSessionUniversal(): Promise<{ user: any; session?: any } | null> {
  // 1. Try the normal cookie-based session
  try {
    const result = await authClient.getSession();
    if (result?.data?.user) {
      return { user: result.data.user, session: result.data.session };
    }
  } catch {
    // ignore
  }

  // 2. Fallback: bearer token
  const token = localStorage.getItem("bearer_token");
  if (!token) return null;

  try {
    const response = await fetch(`${normalizedApiUrl}/api/auth/get-session`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.user) {
      return { user: data.user, session: data.session };
    }
  } catch {
    // ignore
  }

  return null;
}
