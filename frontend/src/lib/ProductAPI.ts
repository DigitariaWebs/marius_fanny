const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Ensure API_URL has protocol
const normalizedApiUrl = API_URL.startsWith('http') ? API_URL : `https://${API_URL}`;

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  sales?: number;
  revenue?: number;
  preparationTimeHours?: number;
  hasTaxes?: boolean;
  allergens?: string;
  customOptions?: Array<{
    name: string;
    choices: string[];
  }>;
}

export interface CreateProductData {
  name: string;
  category: string;
  price: number;
  available?: boolean;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  description?: string;
  image?: string;
  preparationTimeHours?: number;
  hasTaxes?: boolean;
  allergens?: string;
  customOptions?: Array<{
    name: string;
    choices: string[];
  }>;
}

export interface UpdateProductData {
  name?: string;
  category?: string;
  price?: number;
  available?: boolean;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  description?: string;
  image?: string;
  preparationTimeHours?: number;
  hasTaxes?: boolean;
  allergens?: string;
  customOptions?: Array<{
    name: string;
    choices: string[];
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    products: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

class ProductAPI {
  private baseURL = `${normalizedApiUrl}/api/products`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getAllProducts(page = 1, limit = 10): Promise<PaginatedResponse<Product>> {
    return this.request<PaginatedResponse<Product>>(`?page=${page}&limit=${limit}`);
  }

  async getProductById(id: number): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/${id}`);
  }

  async createProduct(data: CreateProductData): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: UpdateProductData): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleProductAvailability(id: number): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/${id}/toggle-availability`, {
      method: 'PATCH',
    });
  }
}

export const productAPI = new ProductAPI();