const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const normalizedApiUrl = API_URL.startsWith("http")
  ? API_URL
  : `https://${API_URL}`;

class OrderAPI {
  private baseURL = `${normalizedApiUrl}/api/orders`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
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
      throw new Error("Session expirée. Veuillez vous reconnecter.");
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "An error occurred" }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /** GET /api/orders */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    deliveryType?: string;
    paymentStatus?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.deliveryType) query.set("deliveryType", params.deliveryType);
    if (params?.paymentStatus)
      query.set("paymentStatus", params.paymentStatus);

    const qs = query.toString();
    return this.request<any>(qs ? `?${qs}` : "");
  }

  /** POST /api/orders */
  async createOrder(data: {
    clientInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    pickupDate?: string;
    pickupLocation: "Montreal" | "Laval";
    deliveryType: "pickup" | "delivery";
    deliveryDate?: string;
    deliveryTimeSlot?: string;
    deliveryAddress?: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
    items: {
      productId: number;
      productName: string;
      quantity: number;
      unitPrice: number;
      amount: number;
      notes?: string;
    }[];
    notes?: string;
    paymentType?: "full" | "deposit";
    paymentLinkChannel?: "email" | "sms";
    depositPaid?: boolean;
  }) {
    return this.request<any>("", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /** PATCH /api/orders/:id */
  async updateOrder(id: string, data: Record<string, any>) {
    return this.request<any>(`/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /** DELETE /api/orders/:id */
  async deleteOrder(id: string) {
    return this.request<any>(`/${id}`, {
      method: "DELETE",
    });
  }
}

export const orderAPI = new OrderAPI();
