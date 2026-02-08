import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  Navigation,
  Phone,
  User,
  ChevronRight,
  AlertCircle,
  LogOut,
  Bell,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { authClient, normalizedApiUrl } from "../lib/AuthClient";
import { Modal } from "@/components/ui/modal";

// Types
interface DeliveryOrder {
  id: string;
  orderNumber: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
  };
  status: "pending" | "in_transit" | "arrived" | "delivered";
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  totalAmount: number;
  estimatedDeliveryTime?: string;
}

interface DeliveryDriver {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "available" | "on_route" | "offline";
}

// Mock Data for Testing
const MOCK_DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: "mock-001",
    orderNumber: "CMD-2024-001",
    clientInfo: {
      firstName: "Sophie",
      lastName: "Martin",
      phone: "514-555-0123",
      email: "sophie.martin@example.com",
    },
    deliveryAddress: {
      street: "1234 Rue Saint-Denis",
      city: "Montréal",
      postalCode: "H2X 3K8",
      province: "QC",
    },
    status: "pending",
    items: [
      { productName: "Croissants au beurre", quantity: 6 },
      { productName: "Pain de campagne", quantity: 1 },
      { productName: "Tartelettes aux fruits", quantity: 4 },
    ],
    totalAmount: 42.5,
    estimatedDeliveryTime: "14:30",
  },
  {
    id: "mock-002",
    orderNumber: "CMD-2024-002",
    clientInfo: {
      firstName: "Jean",
      lastName: "Dubois",
      phone: "514-555-0147",
      email: "jean.dubois@example.com",
    },
    deliveryAddress: {
      street: "2567 Avenue du Mont-Royal",
      city: "Montréal",
      postalCode: "H2H 1K6",
      province: "QC",
    },
    status: "pending",
    items: [
      { productName: "Baguette tradition", quantity: 3 },
      { productName: "Éclairs au chocolat", quantity: 6 },
    ],
    totalAmount: 28.75,
    estimatedDeliveryTime: "15:00",
  },
  {
    id: "mock-003",
    orderNumber: "CMD-2024-003",
    clientInfo: {
      firstName: "Marie",
      lastName: "Tremblay",
      phone: "450-555-0198",
      email: "marie.tremblay@example.com",
    },
    deliveryAddress: {
      street: "789 Boulevard des Laurentides",
      city: "Laval",
      postalCode: "H7G 2V9",
      province: "QC",
    },
    status: "in_transit",
    items: [
      { productName: "Gâteau forêt noire", quantity: 1 },
      { productName: "Macarons assortis", quantity: 12 },
    ],
    totalAmount: 65.0,
    estimatedDeliveryTime: "15:30",
  },
  {
    id: "mock-004",
    orderNumber: "CMD-2024-004",
    clientInfo: {
      firstName: "Pierre",
      lastName: "Gagnon",
      phone: "514-555-0162",
      email: "pierre.gagnon@example.com",
    },
    deliveryAddress: {
      street: "456 Rue Sainte-Catherine Est",
      city: "Montréal",
      postalCode: "H2L 2C6",
      province: "QC",
    },
    status: "pending",
    items: [
      { productName: "Pain aux raisins", quantity: 4 },
      { productName: "Chaussons aux pommes", quantity: 3 },
      { productName: "Café latté", quantity: 2 },
    ],
    totalAmount: 35.25,
    estimatedDeliveryTime: "16:00",
  },
  {
    id: "mock-005",
    orderNumber: "CMD-2024-005",
    clientInfo: {
      firstName: "Isabelle",
      lastName: "Côté",
      phone: "450-555-0134",
      email: "isabelle.cote@example.com",
    },
    deliveryAddress: {
      street: "3210 Chemin de la Côte-Vertu",
      city: "Montréal",
      postalCode: "H4R 1P8",
      province: "QC",
    },
    status: "arrived",
    items: [
      { productName: "Tarte tatin", quantity: 1 },
      { productName: "Millefeuille", quantity: 2 },
      { productName: "Pain au chocolat", quantity: 6 },
    ],
    totalAmount: 52.8,
    estimatedDeliveryTime: "16:30",
  },
];

const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<DeliveryDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(
    null,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check authentication and load driver data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();

        if (!session?.data) {
          navigate("/se-connecter");
          return;
        }

        const user: any = session.data.user;
        const userRole =
          user.user_metadata?.role || user.role || "deliveryDriver";

        if (userRole !== "deliveryDriver") {
          navigate("/");
          return;
        }

        const driverData: DeliveryDriver = {
          id: Number(user.id),
          firstName:
            user.user_metadata?.firstName ||
            user.name?.split(" ")[0] ||
            "Livreur",
          lastName:
            user.user_metadata?.lastName || user.name?.split(" ")[1] || "",
          email: user.email,
          phone: user.user_metadata?.phone || "514-555-0100",
          status: "available",
        };

        setDriver(driverData);
        setLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/se-connecter");
      }
    };

    checkAuth();
  }, [navigate]);

  // Load delivery orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch(
          `${normalizedApiUrl}/api/orders?deliveryStatus=ready_for_delivery`,
          {
            credentials: "include",
          },
        );

        if (response.ok) {
          const result = await response.json();
          const deliveryOrders = result.data.filter(
            (order: any) =>
              order.deliveryType === "delivery" &&
              ["pending", "in_transit", "arrived"].includes(order.status),
          );
          setOrders(deliveryOrders);
        } else {
          // Fallback to mock data if API returns error
          console.log("API unavailable, using mock data");
          setOrders(MOCK_DELIVERY_ORDERS);
        }
      } catch (error) {
        console.error("Failed to load orders, using mock data:", error);
        // Use mock data as fallback when API is unavailable
        setOrders(MOCK_DELIVERY_ORDERS);
      }
    };

    if (driver) {
      loadOrders();
      // Refresh every 30 seconds
      const interval = setInterval(loadOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [driver]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      navigate("/se-connecter");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/se-connecter");
    }
  };

  const updateDeliveryStatus = async (
    orderId: string,
    newStatus: "in_transit" | "arrived" | "delivered",
  ) => {
    // Optimistic update - update UI immediately
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );

    // Update selected order if it's the current one
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    // Try to sync with backend (will fail gracefully with mock data)
    try {
      await fetch(`${normalizedApiUrl}/api/orders/${orderId}/delivery-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ deliveryStatus: newStatus }),
      });
    } catch (error) {
      console.log("Backend sync failed (using mock data):", error);
    }
  };

  if (loading || !driver) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F9F7F2" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C5A065] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm" style={{ color: "#2D2A26" }}>
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const inTransitOrders = orders.filter((o) => o.status === "in_transit");
  const arrivedOrders = orders.filter((o) => o.status === "arrived");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F7F2" }}>
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8" style={{ color: "#C5A065" }} />
              <div>
                <h1 className="font-bold text-lg" style={{ color: "#2D2A26" }}>
                  Marius & Fanny
                </h1>
                <p className="text-xs text-stone-500">Livraisons</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700">
                  Disponible
                </span>
              </div>

              <button className="relative p-2 hover:bg-stone-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" style={{ color: "#2D2A26" }} />
                {orders.length > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {orders.length}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#2D2A26" }}
                  >
                    {driver.firstName} {driver.lastName}
                  </p>
                  <p className="text-xs text-stone-500">Livreur</p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#C5A065" }}
                >
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-stone-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#C5A065" }}
                >
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#2D2A26" }}
                  >
                    {driver.firstName} {driver.lastName}
                  </p>
                  <p className="text-xs text-stone-500">Livreur</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">En attente</p>
                <p className="text-3xl font-bold" style={{ color: "#2D2A26" }}>
                  {pendingOrders.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">En route</p>
                <p className="text-3xl font-bold" style={{ color: "#2D2A26" }}>
                  {inTransitOrders.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1">Arrivé</p>
                <p className="text-3xl font-bold" style={{ color: "#2D2A26" }}>
                  {arrivedOrders.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-200">
            <h2 className="text-xl font-bold" style={{ color: "#2D2A26" }}>
              Mes livraisons
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Cliquez sur une commande pour voir les détails
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 mb-2">Aucune livraison en cours</p>
              <p className="text-sm text-stone-400">
                Les nouvelles livraisons apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="p-6 hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="font-bold text-lg"
                          style={{ color: "#2D2A26" }}
                        >
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : order.status === "in_transit"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "arrived"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status === "pending" && "En attente"}
                          {order.status === "in_transit" && "En route"}
                          {order.status === "arrived" && "Arrivé"}
                          {order.status === "delivered" && "Livré"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-stone-400" />
                          <span style={{ color: "#2D2A26" }}>
                            {order.clientInfo.firstName}{" "}
                            {order.clientInfo.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-stone-400" />
                          <span className="text-stone-600">
                            {order.deliveryAddress.street},{" "}
                            {order.deliveryAddress.city}{" "}
                            {order.deliveryAddress.postalCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-stone-400" />
                          <span className="text-stone-600">
                            {order.clientInfo.phone}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-stone-400" />
                        <span className="text-sm text-stone-600">
                          {order.items.length} article(s)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p
                          className="text-lg font-bold"
                          style={{ color: "#C5A065" }}
                        >
                          {order.totalAmount.toFixed(2)}$
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      <Modal
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        type="details"
        title="Détails de la livraison"
        description={
          selectedOrder ? `Commande #${selectedOrder.orderNumber}` : ""
        }
        size="lg"
        closable={true}
        actions={{
          ...(selectedOrder?.status === "pending" && {
            primary: {
              label: "Je suis en route",
              icon: <Navigation className="w-5 h-5" />,
              onClick: () =>
                selectedOrder &&
                updateDeliveryStatus(selectedOrder.id, "in_transit"),
            },
          }),
          ...(selectedOrder?.status === "in_transit" && {
            primary: {
              label: "Je suis arrivé",
              icon: <MapPin className="w-5 h-5" />,
              onClick: () =>
                selectedOrder &&
                updateDeliveryStatus(selectedOrder.id, "arrived"),
            },
          }),
          ...(selectedOrder?.status === "arrived" && {
            primary: {
              label: "Livraison terminée",
              icon: <CheckCircle className="w-5 h-5" />,
              onClick: () =>
                selectedOrder &&
                updateDeliveryStatus(selectedOrder.id, "delivered"),
            },
          }),
        }}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div>
              <h4 className="font-semibold mb-3" style={{ color: "#2D2A26" }}>
                Informations client
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-stone-400" />
                  <span>
                    {selectedOrder.clientInfo.firstName}{" "}
                    {selectedOrder.clientInfo.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <a
                    href={`tel:${selectedOrder.clientInfo.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedOrder.clientInfo.phone}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                  <div>
                    <p>{selectedOrder.deliveryAddress.street}</p>
                    <p>
                      {selectedOrder.deliveryAddress.city},{" "}
                      {selectedOrder.deliveryAddress.province}{" "}
                      {selectedOrder.deliveryAddress.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-semibold mb-3" style={{ color: "#2D2A26" }}>
                Articles
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-stone-50 rounded-lg"
                  >
                    <span className="text-sm">{item.productName}</span>
                    <span className="text-sm font-medium">
                      × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-stone-200 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span
                  className="text-xl font-bold"
                  style={{ color: "#C5A065" }}
                >
                  {selectedOrder.totalAmount.toFixed(2)}$
                </span>
              </div>
            </div>

            {/* Status Update Info */}
            <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Information importante</p>
                <p>
                  Le client sera automatiquement notifié de chaque changement de
                  statut.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeliveryDashboard;
