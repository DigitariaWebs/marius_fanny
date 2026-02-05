// Staff Management Types
export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: "Montreal" | "Laval";
  department: "customer_service" | "kitchen_staff";
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
}

export type StaffFormData = Omit<
  Staff,
  "id" | "createdAt" | "updatedAt" | "status"
>;

// Product Management specific interface
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
}

// Statistics Types
export interface Statistics {
  totalProducts: number;
  totalRevenue: number;
  lowStock: number;
  totalSales: number;
  revenueChange: number;
  salesChange: number;
}

// Client Management Types
export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "placeholder";
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
  orders: Order[];
}

export interface Address {
  id: number;
  type: "billing" | "shipping";
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export type ClientFormData = Omit<
  Client,
  "id" | "createdAt" | "updatedAt" | "orders" | "addresses"
>;

// Order Management Types - VERSION COMPATIBLE STAFF DASHBOARD
export interface Order {
  id: string; 
  orderNumber: string;
  clientId: number;
  client: Client;
  orderDate: string;
  pickupDate: string;
  pickupLocation: "Montreal" | "Laval";
  deliveryType: "pickup" | "delivery";
  deliveryAddress?: Address;
  deliverySlot?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  depositAmount: number;
  depositPaid: boolean;
  depositPaidAt?: string;
  balancePaid: boolean;
  balancePaidAt?: string;
  paymentStatus: "unpaid" | "deposit_paid" | "paid";
  status: 
    | "pending"
    | "confirmed"
    | "in_production"
    | "ready"
    | "completed"
    | "cancelled"
    | "delivered";
  source: "online" | "phone" | "in_store";
  notes?: string;
  staffId?: number;
  interLocationDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  productionStatus: "pending" | "in_progress" | "ready";
  readyAt?: string;
}

export interface OrderFormData {
  clientId?: number;
  clientInfo?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
  };
  pickupDate: string;
  pickupLocation: "Montreal" | "Laval";
  deliveryType: "pickup" | "delivery";
  deliveryAddressId?: number;
  deliverySlot?: string;
  items: {
    productId: number;
    quantity: number;
    notes?: string;
  }[];
  notes?: string;
  depositPaid: boolean;
}

// Version simplifiée pour le staff dashboard
export interface SimplifiedOrder {
  id: string;
  orderNumber: string;
  client: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    product?: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
  status: "pending" | "in_production" | "ready" | "delivered" | "cancelled" | "completed";
  createdAt: string;
  notes?: string;
}

export interface DeliveryZone {
  id: number;
  name: string;
  postalCodePrefixes: string[];
  deliveryFee: number;
  minimumOrder: number;
  active: boolean;
}

export interface DeliverySlot {
  id: number;
  startTime: string;
  endTime: string;
  maxOrders: number;
  availableDays: number[]; // 0-6, Sunday-Saturday
  active: boolean;
}

// Production Management
export interface ProductionListItem {
  productId: number;
  productName: string;
  totalQuantity: number;
  orders: {
    orderId: number;
    orderNumber: string;
    quantity: number;
    notes?: string;
    pickupDate: string;
    pickupLocation: string;
    status: OrderItem["productionStatus"];
  }[];
}

export interface DailyInventory {
  id: number;
  productId: number;
  product: Product;
  date: string;
  quantity: number;
  location: "Montreal" | "Laval";
  createdAt: string;
}

// Delivery Schedule
export interface InterLocationDelivery {
  id: number;
  deliveryDate: string;
  fromLocation: "Laval";
  toLocation: "Montreal";
  orders: Order[];
  status: "scheduled" | "in_transit" | "delivered";
  deliveredAt?: string;
}

// Statistics & Dashboard
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  inProductionOrders: number;
  readyOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  averageOrderValue: number;
}

// Types pour le staff dashboard
export interface OrderStats {
  today: number;
  thisWeek: number;
  pending: number;
  inProduction: number;
  ready: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface TimeSeriesData {
  date: string;
  orders: number;
  revenue: number;
}

export interface ProductSales {
  product: string;
  sales: number;
  revenue: number;
}

export interface ClientActivity {
  client: string;
  orders: number;
  totalSpent: number;
}

export interface DashboardClient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string; // Added for staff dashboard compatibility
}

export interface DashboardOrderItem {
  product?: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
}

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  client: DashboardClient;
  items: DashboardOrderItem[];
  total: number;
  status: "pending" | "in_production" | "ready" | "delivered" | "cancelled";
  createdAt: string;
  notes?: string;
}

// Type guard pour vérifier si un objet est un Order
export function isOrder(obj: any): obj is Order {
  return obj && 
         typeof obj.id === 'string' && 
         typeof obj.orderNumber === 'string' &&
         obj.client !== undefined;
}

// Helper function to ensure order.id is always a string
export function getOrderId(order: Order): string {
  return typeof order.id === 'string' ? order.id : String(order.id);
}