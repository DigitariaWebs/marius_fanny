import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Calendar,
  Mail,
  Phone,
  MapPin,
  UserCircle,
  DollarSign,
  Check,
  Printer,
} from "lucide-react";
import { DataTable } from "./ui/DataTable";
import { Modal } from "./ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import OrderForm from "./OrderForm";
import OrderChangeHistory from "./OrderChangeHistory";
import { orderAPI } from "../lib/OrderAPI";
import { normalizedApiUrl } from "../lib/AuthClient";
import { clientAPI } from "../lib/ClientAPI";
import type { Order } from "../types";

interface OrderItemWithPacking {
  id: number;
  productId: number;
  product?: { id: number; name: string; price: number };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productionStatus: string;
  notes?: string;
  isPacked?: boolean;
}

interface OrderWithPacking extends Omit<Order, 'items'> {
  items: OrderItemWithPacking[];
  paymentMethod?: "in_store" | "payment_link";
  paymentLinkChannel?: "email" | "sms";
  squarePaymentId?: string;
  squareInvoiceId?: string;
}

export function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithPacking[]>([
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      clientId: 1,
      client: {
        id: 1,
        firstName: "Marie",
        lastName: "Dubois",
        email: "marie.dubois@email.com",
        phone: "514-555-0101",
        status: "active",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        addresses: [],
        orders: [],
      },
      orderDate: "2024-01-20T10:30:00Z",
      pickupDate: "2024-01-25T15:00:00Z",
      pickupLocation: "Montreal",
      deliveryType: "pickup",
      items: [
        {
          id: 1,
          productId: 101,
          product: { id: 101, name: "Gateau au chocolat", price: 35.00 },
          quantity: 2,
          unitPrice: 35.00,
          subtotal: 70.00,
          productionStatus: "pending",
          isPacked: false
        },
        {
          id: 2,
          productId: 102,
          product: { id: 102, name: "Tarte aux pommes", price: 25.00 },
          quantity: 1,
          unitPrice: 25.00,
          subtotal: 25.00,
          productionStatus: "pending",
          isPacked: false
        }
      ],
      subtotal: 95.0,
      taxAmount: 14.21,
      deliveryFee: 0,
      total: 109.21,
      depositAmount: 54.61,
      depositPaid: true,
      depositPaidAt: "2024-01-20T10:35:00Z",
      balancePaid: false,
      paymentStatus: "deposit_paid",
      status: "in_production",
      source: "phone",
      createdAt: "2024-01-20T10:30:00Z",
      updatedAt: "2024-01-22T14:20:00Z",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      clientId: 2,
      client: {
        id: 2,
        firstName: "Jean",
        lastName: "Tremblay",
        email: "jean.tremblay@email.com",
        phone: "450-555-0202",
        status: "active",
        createdAt: "2024-01-10T09:00:00Z",
        updatedAt: "2024-01-10T09:00:00Z",
        addresses: [],
        orders: [],
      },
      orderDate: "2024-01-21T14:15:00Z",
      pickupDate: "2024-01-26T10:00:00Z",
      pickupLocation: "Laval",
      deliveryType: "delivery",
      deliveryAddress: {
        id: 1,
        type: "shipping",
        street: "123 Rue Principale",
        city: "Laval",
        province: "QC",
        postalCode: "H7A 1A1",
        isDefault: true,
      },
      deliverySlot: "10:00-12:00",
      items: [
        {
          id: 3,
          productId: 103,
          product: { id: 103, name: "Croissants (x6)", price: 12.00 },
          quantity: 3,
          unitPrice: 12.00,
          subtotal: 36.00,
          productionStatus: "ready",
          isPacked: true
        }
      ],
      subtotal: 125.0,
      taxAmount: 18.69,
      deliveryFee: 15.0,
      total: 158.69,
      depositAmount: 79.35,
      depositPaid: true,
      depositPaidAt: "2024-01-21T14:20:00Z",
      balancePaid: true,
      balancePaidAt: "2024-01-25T09:00:00Z",
      paymentStatus: "paid",
      status: "ready",
      source: "online",
      createdAt: "2024-01-21T14:15:00Z",
      updatedAt: "2024-01-25T09:00:00Z",
    },
    {
      id: "3",
      orderNumber: "ORD-2024-003",
      clientId: 3,
      client: {
        id: 3,
        firstName: "Sophie",
        lastName: "Gagnon",
        email: "sophie.gagnon@email.com",
        phone: "514-555-0303",
        status: "active",
        createdAt: "2024-01-18T11:00:00Z",
        updatedAt: "2024-01-18T11:00:00Z",
        addresses: [],
        orders: [],
      },
      orderDate: "2024-01-22T09:00:00Z",
      pickupDate: "2024-01-27T16:00:00Z",
      pickupLocation: "Montreal",
      deliveryType: "pickup",
      items: [],
      subtotal: 65.0,
      taxAmount: 9.72,
      deliveryFee: 0,
      total: 74.72,
      depositAmount: 37.36,
      depositPaid: false,
      balancePaid: false,
      paymentStatus: "unpaid",
      status: "pending",
      source: "in_store",
      createdAt: "2024-01-22T09:00:00Z",
      updatedAt: "2024-01-22T09:00:00Z",
    },
    {
      id: "4",
      orderNumber: "ORD-2024-004",
      clientId: 4,
      client: {
        id: 4,
        firstName: "Pierre",
        lastName: "Lavoie",
        email: "pierre.lavoie@email.com",
        phone: "450-555-0404",
        status: "active",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        addresses: [],
        orders: [],
      },
      orderDate: "2024-01-23T11:30:00Z",
      pickupDate: "2024-01-28T14:00:00Z",
      pickupLocation: "Laval",
      deliveryType: "pickup",
      items: [
        {
          id: 4,
          productId: 104,
          product: { id: 104, name: "Pain au levain", price: 8.00 },
          quantity: 2,
          unitPrice: 8.00,
          subtotal: 16.00,
          productionStatus: "in_progress",
          isPacked: false
        }
      ],
      subtotal: 95.0,
      taxAmount: 14.21,
      deliveryFee: 0,
      total: 109.21,
      depositAmount: 54.61,
      depositPaid: true,
      depositPaidAt: "2024-01-23T11:35:00Z",
      balancePaid: false,
      paymentStatus: "deposit_paid",
      status: "confirmed",
      source: "phone",
      createdAt: "2024-01-23T11:30:00Z",
      updatedAt: "2024-01-23T11:35:00Z",
    },
  ]);

  const [filteredOrders, setFilteredOrders] = useState<OrderWithPacking[]>(orders);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedOrderForProducts, setSelectedOrderForProducts] = useState<OrderWithPacking | null>(null);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithPacking | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderWithPacking | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithPacking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"simple" | "complete">("simple");

  // Filtrer par date
  useEffect(() => {
    if (selectedDate) {
      const filtered = orders.filter(order => {
        const orderDate = (order.orderDate || "").split("T")[0];
        return orderDate === selectedDate;
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [selectedDate, orders]);

  // Charger les commandes depuis l'API au montage
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getOrders({ limit: 100 });
        const items = res.data?.items || [];
        
        if (items.length > 0) {
          const mapped: OrderWithPacking[] = items.map((o: any) => {
            // S'assurer que les items ont des produits avec des noms
            const orderItems = (o.items || []).map((item: any, idx: number) => {
              let productName = `Produit #${item.productId}`; // Nom par defaut
              let productPrice = item.unitPrice || 0;
              if (item.product) {
                productName = item.product.name || productName;
                productPrice = item.product.price || productPrice;
              } else if (item.productName) {
                productName = item.productName;
              }
              
              return {
                id: idx + 1,
                orderId: 0,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.amount || (item.quantity * item.unitPrice),
                productionStatus: item.productionStatus || "pending",
                notes: item.notes,
                product: {
                  id: item.productId,
                  name: productName,
                  price: productPrice
                },
                isPacked: item.productionStatus === "ready" || item.isPacked === true
              };
            });

            return {
              id: o._id || o.id,
              orderNumber: o.orderNumber || "",
              clientId: 0,
              client: {
                id: 0,
                firstName: o.clientInfo?.firstName || "",
                lastName: o.clientInfo?.lastName || "",
                email: o.clientInfo?.email || "",
                phone: o.clientInfo?.phone || "",
                status: "active" as const,
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
                addresses: [],
                orders: [],
              },
              orderDate: o.orderDate || o.createdAt,
              pickupDate: o.pickupDate || o.createdAt,
              pickupLocation: o.pickupLocation || "Laval",
              deliveryType: o.deliveryType || "pickup",
              deliveryDate: o.deliveryDate,
              deliveryTimeSlot: o.deliveryTimeSlot,
              deliveryAddress: o.deliveryAddress,
              items: orderItems,
              subtotal: o.subtotal || 0,
              taxAmount: o.taxAmount || 0,
              deliveryFee: o.deliveryFee || 0,
              total: o.total || 0,
              depositAmount: o.depositAmount || 0,
              depositPaid: o.depositPaid || false,
              depositPaidAt: o.depositPaidAt,
              balancePaid: o.balancePaid || false,
              balancePaidAt: o.balancePaidAt,
              squarePaymentId: o.squarePaymentId,
              squareInvoiceId: o.squareInvoiceId,
              paymentStatus: o.paymentStatus || "unpaid",
              status: o.status || "pending",
              source: "in_store" as const,
              paymentMethod:
                o.paymentType === "deposit" ? "payment_link" : "in_store",
              paymentLinkChannel: o.paymentLinkChannel || "email",
              notes: o.notes,
              createdAt: o.createdAt,
              updatedAt: o.updatedAt,
            };
          });
          
          setOrders(mapped);
          setFilteredOrders(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchOrders();
  }, []);

  // Charger les clients depuis l'API
  const [clientsList, setClientsList] = useState<any[]>([]);
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await clientAPI.getClients(1, 100);
        setClientsList(data.clients);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      }
    };
    fetchClients();
  }, []);

  // Combiner les clients des commandes avec les clients de l'API
  const orderClients = orders
    .map((order) => order.client)
    .filter(
      (client, index, self) =>
        index === self.findIndex((c) => c.id === client.id) && client.id !== 0,
    );
  
  // Fusionner les clients de l'API avec ceux des commandes
  const allClients = [...clientsList, ...orderClients];
  const uniqueClients = allClients.filter(
    (client, index, self) =>
      index === self.findIndex((c) => c.id === client.id),
  );
  
  const clients = uniqueClients;
  const getOrderColor = (order: OrderWithPacking) => {
    if (order.status === "completed") {
      return "!bg-green-50 border-l-4 !border-l-green-500 hover:!bg-green-100 cursor-pointer";
    }
    if (order.pickupLocation === "Montreal" && order.deliveryType === "pickup") {
      return "!bg-blue-50 border-l-4 !border-l-blue-500 hover:!bg-blue-100 cursor-pointer";
    } else if (order.deliveryType === "delivery") {
      return "!bg-yellow-50 border-l-4 !border-l-yellow-500 hover:!bg-yellow-100 cursor-pointer";
    } else if (order.pickupLocation === "Laval" && order.deliveryType === "pickup") {
      return "!bg-white border-l-4 !border-l-gray-300 hover:!bg-gray-50 cursor-pointer";
    }
    return "!bg-white hover:!bg-gray-50 cursor-pointer";
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: {
        label: "En attente",
        className: "bg-yellow-100 text-yellow-800",
      },
      confirmed: {
        label: "Confirmee",
        className: "bg-blue-100 text-blue-800",
      },
      in_production: {
        label: "En production",
        className: "bg-purple-100 text-purple-800",
      },
      ready: { label: "Prete", className: "bg-green-100 text-green-800" },
      completed: {
        label: "Ramassee",
        className: "bg-green-100 text-green-800",
      },
      cancelled: { label: "Annulee", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: Order["paymentStatus"]) => {
    const paymentConfig = {
      unpaid: { label: "Non payer", className: "bg-red-100 text-red-800" },
      deposit_paid: {
        label: "Depot payer",
        className: "bg-yellow-100 text-yellow-800",
      },
      paid: { label: "Payer", className: "bg-green-100 text-green-800" },
    };

    const config = paymentConfig[paymentStatus];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatServiceTime = (order: OrderWithPacking) => {
    if (order.deliveryType === "pickup") {
      return formatDate(order.pickupDate || order.orderDate);
    }

    if (order.deliveryDate && order.deliveryTimeSlot) {
      const deliveryDateLabel = new Date(order.deliveryDate).toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return `${deliveryDateLabel} (${order.deliveryTimeSlot})`;
    }

    if (order.deliveryTimeSlot) return order.deliveryTimeSlot;
    return formatDate(order.orderDate);
  };

  const parseItemNotes = (notes?: string) => {
    if (!notes) return { options: [] as string[], allergies: "", note: "" };

    const lines = notes
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const optionsLine = lines.find((line) => line.toLowerCase().startsWith("options:"));
    const allergiesLine = lines.find((line) => line.toLowerCase().startsWith("allergies:"));
    const noteLine = lines.find((line) => line.toLowerCase().startsWith("note:"));

    const options = optionsLine
      ? optionsLine
          .replace(/^options:\s*/i, "")
          .split("|")
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [];

    const allergies = allergiesLine
      ? allergiesLine.replace(/^allergies:\s*/i, "").trim()
      : "";

    const fallbackLines = lines.filter(
      (line) =>
        !line.toLowerCase().startsWith("options:") &&
        !line.toLowerCase().startsWith("allergies:") &&
        !line.toLowerCase().startsWith("note:"),
    );

    const note = noteLine
      ? noteLine.replace(/^note:\s*/i, "").trim()
      : fallbackLines.join(" ");

    return { options, allergies, note };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatOrderNumber = (orderNumber: string) => {
    const trimmed = orderNumber.trim();
    const mfMatch = trimmed.match(/^(MF-\d{8}-)(\d{1,4})$/i);
    if (mfMatch) {
      return mfMatch[2].padStart(4, "0");
    }

    if (!/^\d+$/.test(trimmed)) return orderNumber;
    const numeric = Number(trimmed);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 1000) return orderNumber;
    return String(numeric).padStart(4, "0");
  };

  const extractOrderDateCode = (order: OrderWithPacking) => {
    const mfMatch = order.orderNumber.trim().match(/^MF-(\d{8})-\d{1,4}$/i);
    if (mfMatch) return mfMatch[1];
    return new Date(order.orderDate).toISOString().slice(0, 10).replace(/-/g, "");
  };

  const orderNumberCounts = filteredOrders.reduce<Record<string, number>>((acc, order) => {
    const shortNumber = formatOrderNumber(order.orderNumber);
    acc[shortNumber] = (acc[shortNumber] || 0) + 1;
    return acc;
  }, {});

  const getOrderDisplayNumber = (order: OrderWithPacking) => {
    const shortNumber = formatOrderNumber(order.orderNumber);
    if ((orderNumberCounts[shortNumber] || 0) <= 1) return shortNumber;
    return `${shortNumber} (${extractOrderDateCode(order)})`;
  };

  const generateFallbackOrderNumber = (isoDate: string) => {
    const datePart = isoDate.slice(0, 10).replace(/-/g, "");
    const prefix = `MF-${datePart}-`;
    const nextSequence = orders.filter((order) => order.orderNumber.startsWith(prefix)).length + 1;
    return `${prefix}${String(nextSequence).padStart(4, "0")}`;
  };

  // Fonction pour voir les produits d'une commande
  const handleViewProducts = (order: OrderWithPacking) => {
    console.log("Ouverture des produits pour:", order.orderNumber);
    setSelectedOrderForProducts(order);
    setIsProductsModalOpen(true);
  };

  // Fonction pour emballer un produit
  const handlePackItem = async (orderId: string, itemId: number) => {
    // Compute new state synchronously before calling setOrders
    const currentOrder = orders.find((o) => o.id === orderId);
    if (!currentOrder) return;

    const updatedItems = currentOrder.items.map((item) =>
      item.id === itemId ? { ...item, isPacked: true, productionStatus: "ready" } : item,
    );
    const allPacked = updatedItems.every((item) => item.productionStatus === "ready");
    const newStatus = (allPacked ? "ready" : currentOrder.status) as OrderWithPacking["status"];

    const updatedOrder: OrderWithPacking = {
      ...currentOrder,
      items: updatedItems,
      status: newStatus,
    };

    // Update local state
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    // Keep modal state in sync with the source of truth to prevent visual rollback.
    if (selectedOrderForProducts?.id === orderId) {
      setSelectedOrderForProducts(updatedOrder);
    }

    // Persist the status change to the backend so it survives navigation
    if (allPacked && currentOrder.status !== "ready") {
      try {
        const result = await orderAPI.updateOrder(orderId, { status: "ready" });
        console.log("✅ Statut sauvegardé:", result);
      } catch (err: any) {
        console.error("❌ Failed to persist order status:", err);
        alert(`Erreur lors de la sauvegarde du statut: ${err.message || err}`);
      }
    }
  };

  const handleViewDetails = (order: OrderWithPacking) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (order: OrderWithPacking) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (order: OrderWithPacking) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;

    setIsSubmitting(true);
    try {
      await orderAPI.deleteOrder(orderToDelete.id);
      const newOrders = orders.filter((o) => o.id !== orderToDelete.id);
      setOrders(newOrders);
      setFilteredOrders(newOrders);
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (err: any) {
      console.error("❌ Failed to delete order:", err);
      alert(`Erreur lors de la suppression: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefundClick = (order: OrderWithPacking) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleRefund = async () => {
    if (!orderToCancel) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${normalizedApiUrl}/api/payments/refund-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderId: orderToCancel.id,
          reason: `Remboursement admin pour commande ${orderToCancel.orderNumber}`,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Echec du remboursement Square");
      }

      const updatedOrders: OrderWithPacking[] = orders.map((o) =>
        o.id === orderToCancel.id
          ? { ...o, status: "cancelled", paymentStatus: "unpaid", balancePaid: false }
          : o,
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (err: any) {
      console.error("❌ Failed to refund order:", err);
      alert(`Erreur lors du remboursement: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderWithPacking["status"]) => {
    const updatedOrders: OrderWithPacking[] = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o,
    );
    setOrders(updatedOrders);
    setFilteredOrders(updatedOrders);

    // Persist status change to the backend
    try {
      await orderAPI.updateOrder(orderId, { status: newStatus });
    } catch (err: any) {
      console.error("❌ Failed to persist order status:", err);
      alert(`Erreur lors de la sauvegarde du statut: ${err.message || err}`);
    }
  };

  const canRefundOrder = (order: OrderWithPacking) => {
    const hasSquareReference = Boolean(order.squarePaymentId || order.squareInvoiceId);
    return hasSquareReference && order.status !== "cancelled";
  };

  const sendPaymentLink = async (order: OrderWithPacking) => {
    const invoicePayload = {
      orderId: order.id,
      customerEmail: order.client.email,
      customerPhone: order.client.phone,
      customerName: `${order.client.firstName} ${order.client.lastName}`.trim(),
      deliveryChannel: order.paymentLinkChannel || "email",
      items: order.items.map((item) => ({
        name: item.product?.name ?? item.productId.toString(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      deliveryFee: order.deliveryFee,
      taxAmount: order.taxAmount,
      total: order.total,
      notes: `Lien de paiement pour commande ${order.orderNumber}`,
    };

    const response = await fetch(`${normalizedApiUrl}/api/payments/invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(invoicePayload),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || "Erreur creation lien de paiement");
    }

    await orderAPI.updateOrder(order.id, {
      squareInvoiceId: result.data?.invoiceId,
    });

    return result.data;
  };

  const handlePrintOrders = () => {
    if (filteredOrders.length === 0) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const ordersRows = filteredOrders
      .map((order) => {
        const clientName = `${order.client.firstName} ${order.client.lastName}`.trim();
        const productsSummary =
          order.items.length > 0
            ? order.items
                .map((item) => {
                  const productName = item.product?.name ?? `Produit #${item.productId}`;
                  return `${productName} (x${item.quantity})`;
                })
                .join("<br />")
            : "Aucun produit";

        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${getOrderDisplayNumber(order)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${clientName}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatServiceTime(order)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${productsSummary}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(order.total)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${order.status}</td>
          </tr>
        `;
      })
      .join("");

    const grandTotal = filteredOrders.reduce((sum, order) => sum + order.total, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Liste des commandes</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px; color: #1f2937;">
          <h1 style="margin: 0 0 8px; color: #337957;">Liste des commandes</h1>
          <p style="margin: 0 0 16px;">
            Nombre de commandes: ${filteredOrders.length}<br />
            Filtre date: ${selectedDate || "Aucun"}
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 8px; text-align: left;">Numero</th>
                <th style="padding: 8px; text-align: left;">Client</th>
                <th style="padding: 8px; text-align: left;">Heure ramassage</th>
                <th style="padding: 8px; text-align: left;">Produits</th>
                <th style="padding: 8px; text-align: right;">Total</th>
                <th style="padding: 8px; text-align: left;">Statut</th>
              </tr>
            </thead>
            <tbody>${ordersRows}</tbody>
          </table>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 18px; margin-top: 8px;">
              Total global: ${formatCurrency(grandTotal)}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const columns = [
    {
      key: "orderNumber",
      label: "numero de commande",
      sortable: true,
      render: (order: OrderWithPacking) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewProducts(order);
          }}
          className="text-left w-full hover:text-[#337957] transition-colors font-medium"
        >
          {getOrderDisplayNumber(order)}
        </button>
      ),
    },
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (order: OrderWithPacking) =>
        `${order.client.firstName} ${order.client.lastName}`,
    },
    {
      key: "serviceTime",
      label: "Heure de ramassage",
      sortable: true,
      render: (order: OrderWithPacking) => formatServiceTime(order),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (order: OrderWithPacking) => formatCurrency(order.total),
    },
    {
      key: "paymentStatus",
      label: "Paiement",
      sortable: true,
      render: (order: OrderWithPacking) => getPaymentBadge(order.paymentStatus),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (order: OrderWithPacking) => getStatusBadge(order.status),
    },
    {
      key: "actions",
      label: "Actions",
      render: (order: OrderWithPacking) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-2 hover:bg-gray-100 rounded">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(order)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(order)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            {order.status !== "cancelled" && order.status !== "completed" && (
              <>
                {order.status === "pending" && (
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(order.id, "confirmed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer
                  </DropdownMenuItem>
                )}
                {order.status === "confirmed" && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateStatus(order.id, "in_production")
                    }
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Mettre en production
                  </DropdownMenuItem>
                )}
                {order.status === "in_production" && (
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(order.id, "ready")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer prete
                  </DropdownMenuItem>
                )}
                {order.status === "ready" && (
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(order.id, "completed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer ramassee
                  </DropdownMenuItem>
                )}
                {canRefundOrder(order) && (
                  <DropdownMenuItem onClick={() => handleRefundClick(order)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Rembourser via Square
                  </DropdownMenuItem>
                )}
              </>
            )}
            <DropdownMenuItem
              onClick={() => handleDeleteClick(order)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const completeColumns = [
    ...columns.slice(0, 3),
    {
      key: "productsPreview",
      label: "Produits",
      sortable: false,
      render: (order: OrderWithPacking) => (
        <div className="space-y-2 min-w-70">
          {order.items.map((item) => {
            const parsed = parseItemNotes(item.notes);
            return (
              <div key={`${order.id}-${item.id}`} className="rounded-md border border-gray-200 bg-gray-50 p-2">
                <div className="text-xs font-semibold text-gray-900">
                  {item.product?.name ?? `Produit #${item.productId}`} x{item.quantity}
                </div>
                {parsed.options.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {parsed.options.map((option) => (
                      <span key={option} className="inline-flex rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px]">
                        {option}
                      </span>
                    ))}
                  </div>
                )}
                {parsed.allergies && (
                  <div className="mt-1 rounded bg-amber-100 text-amber-900 px-2 py-1 text-[10px] font-medium">
                    Allergies: {parsed.allergies}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ),
    },
    ...columns.slice(3),
  ];

  const getSearchValue = (order: OrderWithPacking) => {
    return `${order.orderNumber} ${formatOrderNumber(order.orderNumber)} ${getOrderDisplayNumber(order)} ${order.client.firstName} ${order.client.lastName} ${order.client.phone}`;
  };

  return (
    <>
      <header className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2
              className="text-4xl md:text-5xl mb-2"
              style={{ fontFamily: '"Great Vibes", cursive', color: "#337957" }}
            >
              Gestion des Commandes
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
              Gerer toutes les commandes (en ligne, telephone, en magasin)
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#337957] hover:bg-[#2D2A26] text-white font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-xl transition-all duration-300 hover:shadow-lg text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Nouvelle Commande</span>
          </button>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Filtre par date */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
          <div className="sm:w-56">
            <Label htmlFor="order-date-filter" className="text-xs text-gray-600">
              Date de creation
            </Label>
            <Input
              id="order-date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          {selectedDate && (
            <Button
              onClick={() => setSelectedDate("")}
              variant="ghost"
              size="sm"
              className="text-[#337957] hover:text-[#B38F55]"
            >
              Effacer
            </Button>
          )}
          <Button
            onClick={handlePrintOrders}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={filteredOrders.length === 0}
          >
            <Printer className="h-4 w-4" />
            Imprimer toutes les commandes
          </Button>

          <Button
            onClick={() => setViewMode((prev) => (prev === "simple" ? "complete" : "simple"))}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {viewMode === "simple" ? "Vue complete" : "Vue simplifiee"}
          </Button>
        </div>

        <DataTable
          data={filteredOrders}
          columns={viewMode === "simple" ? columns : completeColumns}
          filters={[]}
          searchPlaceholder="Rechercher par numero, client ou telephone..."
          getSearchValue={getSearchValue}
          itemsPerPage={10}
          selectable={false}
          rowClassName={(order: OrderWithPacking) => getOrderColor(order)}
        />
      </div>

      {/* MODAL DES PRODUITS AVEC BOUTONS EMBALLER */}
      <Modal
        open={isProductsModalOpen}
        onOpenChange={setIsProductsModalOpen}
        type="details"
        title={`Produits de la commande ${selectedOrderForProducts ? formatOrderNumber(selectedOrderForProducts.orderNumber) : ""}`}
        description={`Client: ${selectedOrderForProducts?.client.firstName} ${selectedOrderForProducts?.client.lastName}`}
        icon={<Package className="h-6 w-6 text-[#337957]" />}
        size="lg"
        actions={{
          secondary: {
            label: "Fermer",
            onClick: () => {
              setIsProductsModalOpen(false);
              setSelectedOrderForProducts(null);
            },
          },
        }}
      >
        {selectedOrderForProducts && (
          <div className="space-y-4">
            {/* Indicateur de commande prete */}
            {selectedOrderForProducts.items.length > 0 &&
              selectedOrderForProducts.items.every((item) => item.productionStatus === "ready") && (
              <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-center">
                <span className="text-green-800 font-semibold text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  COMMANDE PRETE - Tous les produits sont emballes
                </span>
              </div>
            )}

            {selectedOrderForProducts.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun produit dans cette commande
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Produit</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Quantite</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Prix unitaire</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Sous-total</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Emballage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrderForProducts.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">
                          {item.product?.name ?? `Produit #${item.productId}`}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm">{formatCurrency(item.subtotal)}</td>
                        <td className="px-4 py-3 text-sm">
                          {item.productionStatus !== "ready" ? (
                            <Button
                              onClick={() => handlePackItem(selectedOrderForProducts.id, item.id)}
                              size="sm"
                              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                            >
                              Emballer
                            </Button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              <Check className="w-3 h-3 mr-1" />
                              Emballe
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="font-medium">{formatCurrency(selectedOrderForProducts.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes:</span>
                  <span className="font-medium">{formatCurrency(selectedOrderForProducts.taxAmount)}</span>
                </div>
                {selectedOrderForProducts.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison:</span>
                    <span className="font-medium">{formatCurrency(selectedOrderForProducts.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrderForProducts.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      
      <Modal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        type="details"
        title="Details de la Commande"
        description="Informations completes sur la commande"
        icon={<Eye className="h-6 w-6 text-(--bakery-gold)" />}
        size="xl"
        actions={{
          secondary: {
            label: "Fermer",
            onClick: () => {
              setIsDetailsModalOpen(false);
              setSelectedOrder(null);
            },
          },
        }}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Articles</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {selectedOrder.items.length}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-[#337957]" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(selectedOrder.total)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-[#337957]" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {getStatusBadge(selectedOrder.status)}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-[#337957]" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="items">
                  Articles ({selectedOrder.items.length})
                </TabsTrigger>
                <TabsTrigger value="payments">Paiements</TabsTrigger>
                <TabsTrigger value="delivery">Livraison</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="p-6 bg-linear-to-br from-(--bakery-cream) to-white rounded-xl border border-(--bakery-border)">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-(--bakery-gold) bg-opacity-20 flex items-center justify-center">
                        <Package className="w-10 h-10 text-(--bakery-gold)" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-(--bakery-text)">
                          {formatOrderNumber(selectedOrder.orderNumber)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getPaymentBadge(selectedOrder.paymentStatus)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-(--bakery-text-secondary)">
                      <p>Commandee le</p>
                      <p className="font-medium text-(--bakery-text)">
                        {formatDate(selectedOrder.orderDate)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-(--bakery-text) mb-3">
                        Informations client
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <UserCircle className="w-5 h-5 text-(--bakery-gold)" />
                          <div>
                            <p className="text-xs text-(--bakery-text-secondary)">
                              Nom
                            </p>
                            <p className="text-sm font-medium text-(--bakery-text)">
                              {selectedOrder.client.firstName}{" "}
                              {selectedOrder.client.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <Mail className="w-5 h-5 text-(--bakery-gold)" />
                          <div>
                            <p className="text-xs text-(--bakery-text-secondary)">
                              Email
                            </p>
                            <p className="text-sm font-medium text-(--bakery-text)">
                              {selectedOrder.client.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <Phone className="w-5 h-5 text-(--bakery-gold)" />
                          <div>
                            <p className="text-xs text-(--bakery-text-secondary)">
                              Telephone
                            </p>
                            <p className="text-sm font-medium text-(--bakery-text)">
                              {selectedOrder.client.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-(--bakery-text) mb-3">
                        Informations de commande
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <Calendar className="w-5 h-5 text-(--bakery-gold)" />
                          <div>
                            <p className="text-xs text-(--bakery-text-secondary)">
                              Date de retrait
                            </p>
                            <p className="text-sm font-medium text-(--bakery-text)">
                              {formatDate(selectedOrder.pickupDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <MapPin className="w-5 h-5 text-(--bakery-gold)" />
                          <div>
                            <p className="text-xs text-(--bakery-text-secondary)">
                              Lieu
                            </p>
                            <p className="text-sm font-medium text-(--bakery-text)">
                              {selectedOrder.pickupLocation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <Truck className="w-5 h-5 text-(--bakery-gold)" />
                          <div>
                            <p className="text-xs text-(--bakery-text-secondary)">
                              Type
                            </p>
                            <p className="text-sm font-medium text-(--bakery-text)">
                              {selectedOrder.deliveryType === "pickup"
                                ? "Ramassage"
                                : "Livraison"}
                            </p>
                          </div>
                        </div>
                        {selectedOrder.deliveryDate && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <Calendar className="w-5 h-5 text-(--bakery-gold)" />
                            <div>
                              <p className="text-xs text-(--bakery-text-secondary)">
                                Date de livraison
                              </p>
                              <p className="text-sm font-medium text-(--bakery-text)">
                                {new Date(selectedOrder.deliveryDate).toLocaleDateString('fr-CA', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                        {selectedOrder.deliveryTimeSlot && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <Clock className="w-5 h-5 text-(--bakery-gold)" />
                            <div>
                              <p className="text-xs text-(--bakery-text-secondary)">
                                Creneau horaire
                              </p>
                              <p className="text-sm font-medium text-(--bakery-text)">
                                {selectedOrder.deliveryTimeSlot}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold text-(--bakery-text) mb-2">
                        Notes
                      </h4>
                      <p className="text-sm text-(--bakery-text-secondary)">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Produit
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Quantite
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Prix unitaire
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Sous-total
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            Aucun article dans cette commande
                          </td>
                        </tr>
                      ) : (
                        selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm">
                              {item.product?.name ?? `Produit #${item.productId}`}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatCurrency(item.subtotal)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.productionStatus === "ready"
                                    ? "bg-green-100 text-green-800"
                                    : item.productionStatus === "in_progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.productionStatus === "ready"
                                  ? "Pret"
                                  : item.productionStatus === "in_progress"
                                    ? "En cours"
                                    : "En attente"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-total:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxes:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedOrder.taxAmount)}
                      </span>
                    </div>
                    {selectedOrder.deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Livraison:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedOrder.deliveryFee)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                <div className="space-y-3">
                  {/* Méthode de paiement */}
                  <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Méthode de paiement
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedOrder.paymentMethod === "payment_link"
                            ? "Lien de paiement envoyé"
                            : "Paiement en magasin"}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                          {selectedOrder.paymentMethod === "payment_link"
                            ? "Lien de paiement"
                            : "En magasin"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {selectedOrder.paymentMethod === "in_store"
                            ? "Paiement total (100%)"
                            : "Depot (50%)"}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatCurrency(selectedOrder.depositAmount)}
                        </div>
                      </div>
                      <div className="text-right">
                        {selectedOrder.depositPaid ? (
                          <>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Paye
                            </span>
                            {selectedOrder.depositPaidAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(selectedOrder.depositPaidAt)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            Non paye
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Solde restant
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatCurrency(
                            selectedOrder.total - selectedOrder.depositAmount,
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {selectedOrder.balancePaid ? (
                          <>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Paye
                            </span>
                            {selectedOrder.balancePaidAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(selectedOrder.balancePaidAt)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            {selectedOrder.paymentMethod === "in_store"
                              ? "Aucun solde"
                              : "Du au retrait"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4">
                {selectedOrder.deliveryType === "delivery" ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Adresse de livraison
                      </h3>
                      {selectedOrder.deliveryAddress && (
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          <div>{selectedOrder.deliveryAddress.street}</div>
                          <div>
                            {selectedOrder.deliveryAddress.city},{" "}
                            {selectedOrder.deliveryAddress.province}{" "}
                            {selectedOrder.deliveryAddress.postalCode}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedOrder.deliverySlot && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Creneau horaire
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="h-4 w-4" />
                          {selectedOrder.deliverySlot}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Frais de livraison
                      </h3>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedOrder.deliveryFee)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Lieu de ramassage
                      </h3>
                      <div className="text-lg font-medium text-gray-900">
                        {selectedOrder.pickupLocation}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Date et heure de ramassage
                      </h3>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-5 w-5" />
                        {formatDate(selectedOrder.pickupDate)}
                      </div>
                    </div>

                    {selectedOrder.pickupLocation === "Montreal" &&
                      selectedOrder.interLocationDeliveryDate && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h3 className="font-semibold text-blue-900 mb-1">
                                Livraison inter-succursale
                              </h3>
                              <p className="text-sm text-blue-700">
                                Cette commande sera livree de Laval a Montreal
                                le{" "}
                                {formatDate(
                                  selectedOrder.interLocationDeliveryDate,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <OrderChangeHistory
                  orderId={selectedOrder.id}
                  orderNumber={selectedOrder.orderNumber}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        type="form"
        title="Nouvelle Commande"
        description="Creer une nouvelle commande"
        icon={<Plus className="h-6 w-6 text-[#337957]" />}
        size="xl"
        actions={{
          primary: {
            label: isSubmitting ? "Enregistrement..." : "Enregistrer la commande",
            onClick: () => {
              const form = document.getElementById("order-form") as HTMLFormElement;
              if (form) form.requestSubmit();
            },
            disabled: isSubmitting,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsCreateModalOpen(false);
            },
            disabled: isSubmitting,
          },
        }}
      >
        <OrderForm
          onSubmit={async (formData) => {
            setIsSubmitting(true);
            try {
              const apiItems = formData.items
                .filter((item) => item.productId && item.quantity > 0)
                .map((item) => ({
                  productId: item.productId!,
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  amount: item.amount,
                  notes: item.notes || undefined,
                }));

              const payload: any = {
                clientInfo: {
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  email: formData.email,
                  phone: formData.phone,
                },
                pickupLocation: formData.pickupLocation,
                deliveryType: formData.deliveryType,
                items: apiItems,
                notes: formData.notes || undefined,
                paymentType:
                  formData.paymentMethod === "in_store" ? ("full" as const) : ("deposit" as const),
                depositPaid: formData.paymentMethod === "in_store",
                paymentLinkChannel: formData.paymentLinkChannel,
              };

              if (formData.date) {
                const pickupDateTime = `${formData.date}T${formData.pickupTime || "00:00"}:00`;
                payload.pickupDate = new Date(pickupDateTime).toISOString();
              }

              if (formData.deliveryType === "delivery" && formData.deliveryAddress) {
                payload.deliveryAddress = {
                  street: formData.deliveryAddress.street,
                  city: formData.deliveryAddress.city,
                  province: formData.deliveryAddress.province,
                  postalCode: formData.deliveryAddress.postalCode,
                };
                if (formData.date) {
                  payload.deliveryDate = formData.date;
                }
              }

              const result = await orderAPI.createOrder(payload);
              const saved = result.data;
              const now = new Date().toISOString();

              const newOrder: OrderWithPacking = {
                id: saved?._id || String(Date.now()),
                orderNumber: saved?.orderNumber || generateFallbackOrderNumber(now),
                clientId: formData.clientId || 0,
                client: {
                  id: formData.clientId || 0,
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  email: formData.email,
                  phone: formData.phone,
                  status: "active",
                  createdAt: now,
                  updatedAt: now,
                  addresses: [],
                  orders: [],
                },
                orderDate: now,
                pickupDate: formData.date
                  ? new Date(`${formData.date}T${formData.pickupTime || "00:00"}:00`).toISOString()
                  : now,
                pickupLocation: formData.pickupLocation,
                deliveryType: formData.deliveryType,
                deliveryAddress: formData.deliveryAddress
                  ? { id: 0, type: "shipping", ...formData.deliveryAddress, isDefault: false }
                  : undefined,
                items: formData.items
                  .filter((item) => item.productId && item.quantity > 0)
                  .map((item, idx) => ({
                    id: idx + 1,
                    orderId: 0,
                    productId: item.productId!,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: item.amount,
                    productionStatus: "pending",
                    notes: item.notes || undefined,
                    product: {
                      id: item.productId!,
                      name: item.productName || `Produit #${item.productId}`,
                      price: item.unitPrice
                    },
                    isPacked: false
                  })),
                subtotal: saved?.subtotal ?? formData.subtotal,
                taxAmount: saved?.taxAmount ?? formData.taxAmount,
                deliveryFee: saved?.deliveryFee ?? formData.deliveryFee,
                total: saved?.total ?? formData.total,
                depositAmount: saved?.depositAmount ?? formData.depositAmount,
                depositPaid: false,
                balancePaid: false,
                paymentStatus: "unpaid",
                status: "pending",
                source: "in_store",
                paymentMethod: formData.paymentMethod || "in_store",
                paymentLinkChannel: formData.paymentLinkChannel || "email",
                notes: formData.notes || undefined,
                createdAt: now,
                updatedAt: now,
              };

              if (newOrder.paymentMethod === "payment_link") {
                try {
                  const invoiceData = await sendPaymentLink(newOrder);
                  newOrder.squareInvoiceId = invoiceData?.invoiceId;
                  newOrder.notes = `${newOrder.notes ? `${newOrder.notes}\n` : ""}Square Invoice ID: ${invoiceData?.invoiceId}`;
                  alert(
                    newOrder.paymentLinkChannel === "sms"
                      ? "Lien de paiement envoye par SMS."
                      : "Lien de paiement envoye par courriel.",
                  );
                } catch (invoiceErr: any) {
                  console.error("Failed to send payment link:", invoiceErr);
                  alert(
                    "Commande creee, mais l'envoi du lien de paiement a echoue.",
                  );
                }
              }

              setOrders((prev) => [newOrder, ...prev]);
              setFilteredOrders((prev) => [newOrder, ...prev]);
              setIsCreateModalOpen(false);
            } catch (err: any) {
              console.error("Failed to create order:", err);
              alert(err.message || "Erreur lors de la creation de la commande");
            } finally {
              setIsSubmitting(false);
            }
          }}
          onCancel={() => {
            setIsCreateModalOpen(false);
          }}
          clients={clients}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        type="form"
        title="Modifier la Commande"
        description="Modifier les informations de la commande"
        icon={<Edit className="h-6 w-6 text-blue-500" />}
        size="xl"
        actions={{
          primary: {
            label: isSubmitting ? "Enregistrement..." : "Enregistrer les modifications",
            onClick: () => {
              const form = document.getElementById("order-form") as HTMLFormElement;
              if (form) form.requestSubmit();
            },
            disabled: isSubmitting,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsEditModalOpen(false);
              setSelectedOrder(null);
            },
            disabled: isSubmitting,
          },
        }}
      >
        <OrderForm
          onSubmit={async (formData) => {
            setIsSubmitting(true);
            try {
              console.log("Updating order:", formData);
              setTimeout(() => {
                setIsEditModalOpen(false);
                setSelectedOrder(null);
                setIsSubmitting(false);
              }, 500);
            } catch (err) {
              console.error(err);
              setIsSubmitting(false);
            }
          }}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedOrder(null);
          }}
          initialData={
            selectedOrder
              ? {
                  date: selectedOrder.orderDate.split("T")[0],
                  pickupTime: new Date(selectedOrder.pickupDate).toLocaleTimeString("fr-CA", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                  clientId: selectedOrder.clientId,
                  firstName: selectedOrder.client.firstName,
                  lastName: selectedOrder.client.lastName,
                  phone: selectedOrder.client.phone,
                  email: selectedOrder.client.email,
                  pickupLocation: selectedOrder.pickupLocation,
                  deliveryType: selectedOrder.deliveryType,
                  notes: selectedOrder.notes || "",
                  paymentMethod: selectedOrder.paymentMethod || "in_store",
                  paymentLinkChannel: selectedOrder.paymentLinkChannel || "email",
                  deliveryFee: selectedOrder.deliveryFee,
                  deliveryAddress: selectedOrder.deliveryAddress
                    ? {
                        street: selectedOrder.deliveryAddress.street,
                        city: selectedOrder.deliveryAddress.city,
                        province: selectedOrder.deliveryAddress.province,
                        postalCode: selectedOrder.deliveryAddress.postalCode,
                      }
                    : undefined,
                  items: selectedOrder.items.map(item => ({
                    id: `edit-${item.id}`,
                    productId: item.productId,
                    productName: item.product?.name || `Produit #${item.productId}`,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    amount: item.subtotal,
                    notes: item.notes || "",
                    isPacked: item.productionStatus === "ready"
                  }))
                }
              : undefined
          }
          clients={clients}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        type="warning"
        title="Confirmer la suppression"
        description="Cette action est irreversible"
        icon={<Trash2 className="h-6 w-6 text-red-600" />}
        actions={{
          primary: {
            label: "Supprimer",
            onClick: handleDelete,
            variant: "destructive",
            disabled: isSubmitting,
            loading: isSubmitting,
          },
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsDeleteModalOpen(false);
              setOrderToDelete(null);
            },
            disabled: isSubmitting,
          },
        }}
      >
        {orderToDelete && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Etes-vous sur de vouloir supprimer cette commande ?
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {formatOrderNumber(orderToDelete.orderNumber)}
                </p>
                <p className="text-sm text-gray-600">
                  Client: {orderToDelete.client.firstName}{" "}
                  {orderToDelete.client.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Total: {formatCurrency(orderToDelete.total)}
                </p>
                <p className="text-sm text-gray-600">
                  Statut: {getStatusBadge(orderToDelete.status)}
                </p>
                <p className="text-sm text-gray-600">
                  Paiement: {getPaymentBadge(orderToDelete.paymentStatus)}
                </p>
              </div>
            </div>
            <p className="text-sm text-red-600">
              Cette action est irreversible. Toutes les donnees associees a
              cette commande seront perdues.
            </p>
          </div>
        )}
      </Modal>

      {/* Refund Confirmation Modal */}
      <Modal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        type="warning"
        title="Rembourser la commande"
        description="Le remboursement sera execute via Square"
        icon={<XCircle className="h-6 w-6 text-amber-600" />}
        actions={{
          primary: {
            label: "Rembourser via Square",
            onClick: handleRefund,
            variant: "destructive",
            disabled: isSubmitting,
            loading: isSubmitting,
          },
          secondary: {
            label: "Retour",
            onClick: () => {
              setIsCancelModalOpen(false);
              setOrderToCancel(null);
            },
            disabled: isSubmitting,
          },
        }}
      >
        {orderToCancel && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Etes-vous sur de vouloir rembourser cette commande via Square ?
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {formatOrderNumber(orderToCancel.orderNumber)}
                </p>
                <p className="text-sm text-gray-600">
                  Client: {orderToCancel.client.firstName}{" "}
                  {orderToCancel.client.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Total: {formatCurrency(orderToCancel.total)}
                </p>
                <p className="text-sm text-gray-600">
                  Paiement: {getPaymentBadge(orderToCancel.paymentStatus)}
                </p>
              </div>
            </div>
            <p className="text-sm text-amber-600">
              Cette action est sensible. Le remboursement sera tente sur le paiement Square de la commande.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
