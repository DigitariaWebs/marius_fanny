// User role types
export type UserRole = "user" | "staff" | "customerService" | "admin";

// User types for better-auth
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: UserRole;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Order Management Types
export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string; // User ID from better-auth
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  orderDate: Date;
  pickupDate?: Date;
  pickupLocation: "Montreal" | "Laval";
  deliveryType: "pickup" | "delivery";
  deliveryAddress?: Address;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  depositAmount: number;
  depositPaid: boolean;
  depositPaidAt?: Date;
  balancePaid: boolean;
  balancePaidAt?: Date;
  paymentStatus: "unpaid" | "deposit_paid" | "paid";
  status:
    | "pending"
    | "confirmed"
    | "in_production"
    | "ready"
    | "completed"
    | "cancelled"
    | "delivered";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pickupDate?: string;
  pickupLocation: "Montreal" | "Laval";
  deliveryType: "pickup" | "delivery";
  deliveryAddress?: Address;
  items: OrderItem[];
  notes?: string;
  depositPaid?: boolean;
}

export interface UpdateOrderInput {
  status?: Order["status"];
  depositPaid?: boolean;
  balancePaid?: boolean;
  notes?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: PaginationParams;
  };
}

// Request extensions
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}

export {};
