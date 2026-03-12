const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const normalizedApiUrl = API_URL.startsWith("http")
  ? API_URL
  : `https://${API_URL}`;

export interface DailyInventoryEntry {
  productId: string;
  productName: string;
  stock_stdo: number;
  stdo: number;
  berri: number;
  comm_berri: number;
  client: number;
  total: number;
}

export interface DailyInventoryRecord {
  date: string;
  entries: DailyInventoryEntry[];
  savedBy: string | null;
  updatedAt: string | null;
}

class DailyInventoryAPI {
  private baseURL = `${normalizedApiUrl}/api/daily-inventory`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/se-connecter";
      throw new Error("AUTH_REDIRECT");
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Une erreur est survenue" }));
      throw new Error(
        errorData.error || errorData.message || `HTTP ${response.status}`,
      );
    }

    return response.json();
  }

  /** GET /api/daily-inventory?date=YYYY-MM-DD */
  async getByDate(date: string): Promise<{ success: boolean; data: DailyInventoryRecord }> {
    return this.request(`?date=${date}`);
  }

  /** POST /api/daily-inventory */
  async save(payload: {
    date: string;
    entries: DailyInventoryEntry[];
  }): Promise<{ success: boolean; message: string; data: DailyInventoryRecord }> {
    return this.request("", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const dailyInventoryAPI = new DailyInventoryAPI();
