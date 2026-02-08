import { useState } from "react";
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Package,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Navigation,
  DollarSign,
  MapPinned,
  Eye,
  MoreVertical,
} from "lucide-react";
import { DataTable } from "./ui/DataTable";
import { Modal } from "./ui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { Order } from "../types";

interface Driver {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  status: "available" | "on_delivery" | "offline";
  currentOrders: number;
  maxOrders: number;
  location: "Montreal" | "Laval";
}

interface Assignment {
  id: number;
  orderId: string;
  driverId: number;
  assignedAt: string;
  status: "assigned" | "in_transit" | "delivered";
  estimatedTime?: string;
  actualDeliveryTime?: string;
}

const MOCK_DRIVERS: Driver[] = [
  {
    id: 1,
    name: "Pierre Dubois",
    phone: "+1 514 555 0101",
    vehicle: "Toyota Corolla - ABC 123",
    status: "available",
    currentOrders: 0,
    maxOrders: 5,
    location: "Montreal",
  },
  {
    id: 2,
    name: "Marie Tremblay",
    phone: "+1 514 555 0102",
    vehicle: "Honda Civic - XYZ 789",
    status: "on_delivery",
    currentOrders: 2,
    maxOrders: 5,
    location: "Montreal",
  },
  {
    id: 3,
    name: "Jean Lavoie",
    phone: "+1 450 555 0103",
    vehicle: "Ford Transit - DEF 456",
    status: "available",
    currentOrders: 1,
    maxOrders: 8,
    location: "Laval",
  },
  {
    id: 4,
    name: "Sophie Martin",
    phone: "+1 450 555 0104",
    vehicle: "Nissan Sentra - GHI 321",
    status: "offline",
    currentOrders: 0,
    maxOrders: 5,
    location: "Laval",
  },
];

const MOCK_ORDERS: Order[] = [
  {
    id: "ord_001",
    orderNumber: "ORD-2024-001",
    clientId: 1,
    client: {
      id: 1,
      firstName: "Alice",
      lastName: "Dupont",
      email: "alice@example.com",
      phone: "+1 514 555 1234",
      status: "active",
      orders: [],
      addresses: [],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    orderDate: "2024-02-08T10:00:00",
    pickupDate: "2024-02-09T14:00:00",
    pickupLocation: "Montreal",
    deliveryType: "delivery",
    deliveryAddress: {
      id: 1,
      type: "shipping",
      street: "123 Rue Saint-Denis",
      city: "Montreal",
      province: "QC",
      postalCode: "H2X 1K5",
      isDefault: true,
    },
    deliverySlot: "14:00-16:00",
    items: [],
    subtotal: 45.0,
    taxAmount: 6.75,
    deliveryFee: 10.0,
    total: 61.75,
    depositAmount: 30.88,
    depositPaid: true,
    balancePaid: false,
    paymentStatus: "deposit_paid",
    status: "ready",
    source: "online",
    createdAt: "2024-02-08T10:00:00",
    updatedAt: "2024-02-08T10:00:00",
  },
  {
    id: "ord_002",
    orderNumber: "ORD-2024-002",
    clientId: 2,
    client: {
      id: 2,
      firstName: "Bob",
      lastName: "Smith",
      email: "bob@example.com",
      phone: "+1 514 555 5678",
      status: "active",
      orders: [],
      addresses: [],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    orderDate: "2024-02-08T11:00:00",
    pickupDate: "2024-02-09T16:00:00",
    pickupLocation: "Montreal",
    deliveryType: "delivery",
    deliveryAddress: {
      id: 2,
      type: "shipping",
      street: "456 Avenue du Parc",
      city: "Montreal",
      province: "QC",
      postalCode: "H2W 2N2",
      isDefault: true,
    },
    deliverySlot: "16:00-18:00",
    items: [],
    subtotal: 67.5,
    taxAmount: 10.13,
    deliveryFee: 10.0,
    total: 87.63,
    depositAmount: 43.82,
    depositPaid: true,
    balancePaid: false,
    paymentStatus: "deposit_paid",
    status: "ready",
    source: "phone",
    createdAt: "2024-02-08T11:00:00",
    updatedAt: "2024-02-08T11:00:00",
  },
  {
    id: "ord_003",
    orderNumber: "ORD-2024-003",
    clientId: 3,
    client: {
      id: 3,
      firstName: "Claire",
      lastName: "Gagnon",
      email: "claire@example.com",
      phone: "+1 450 555 9012",
      status: "active",
      orders: [],
      addresses: [],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    orderDate: "2024-02-08T09:00:00",
    pickupDate: "2024-02-09T12:00:00",
    pickupLocation: "Laval",
    deliveryType: "delivery",
    deliveryAddress: {
      id: 3,
      type: "shipping",
      street: "789 Boulevard Chomedey",
      city: "Laval",
      province: "QC",
      postalCode: "H7V 3Z2",
      isDefault: true,
    },
    deliverySlot: "12:00-14:00",
    items: [],
    subtotal: 52.0,
    taxAmount: 7.8,
    deliveryFee: 10.0,
    total: 69.8,
    depositAmount: 34.9,
    depositPaid: true,
    balancePaid: false,
    paymentStatus: "deposit_paid",
    status: "ready",
    source: "online",
    createdAt: "2024-02-08T09:00:00",
    updatedAt: "2024-02-08T09:00:00",
  },
];

export default function DeliveryAssignment() {
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} $`;
  };

  const handleAssignClick = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleAssignDriver = () => {
    if (!selectedOrder || !selectedDriver) return;

    const assignment: Assignment = {
      id: assignments.length + 1,
      orderId: selectedOrder.id,
      driverId: selectedDriver,
      assignedAt: new Date().toISOString(),
      status: "assigned",
    };

    setAssignments([...assignments, assignment]);

    // Update driver's current orders
    setDrivers(
      drivers.map((driver) =>
        driver.id === selectedDriver
          ? { ...driver, currentOrders: driver.currentOrders + 1 }
          : driver
      )
    );

    setIsAssignModalOpen(false);
    setSelectedOrder(null);
    setSelectedDriver(null);
  };

  const getDriverStatusBadge = (status: Driver["status"]) => {
    const statusConfig = {
      available: {
        label: "Disponible",
        className: "bg-green-100 text-green-800",
      },
      on_delivery: {
        label: "En livraison",
        className: "bg-blue-100 text-blue-800",
      },
      offline: { label: "Hors ligne", className: "bg-gray-100 text-gray-800" },
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

  const getAssignmentForOrder = (orderId: string) => {
    return assignments.find((a) => a.orderId === orderId);
  };

  const getDriverById = (driverId: number) => {
    return drivers.find((d) => d.id === driverId);
  };

  const orderColumns = [
    {
      key: "orderNumber",
      label: "Numéro",
      sortable: true,
      render: (order: Order) => (
        <span className="font-medium text-[#2D2A26]">{order.orderNumber}</span>
      ),
    },
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (order: Order) => (
        <div>
          <div className="font-medium text-[#2D2A26]">
            {order.client.firstName} {order.client.lastName}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Phone size={12} />
            {order.client.phone}
          </div>
        </div>
      ),
    },
    {
      key: "address",
      label: "Adresse",
      sortable: false,
      render: (order: Order) => (
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-[#C5A065] mt-1" />
          <div className="text-sm">
            <div className="text-[#2D2A26]">{order.deliveryAddress?.street}</div>
            <div className="text-xs text-gray-500">
              {order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "deliverySlot",
      label: "Créneau",
      sortable: true,
      render: (order: Order) => (
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} className="text-gray-400" />
          <span>{order.deliverySlot}</span>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (order: Order) => (
        <span className="font-medium text-[#2D2A26]">
          {formatCurrency(order.total)}
        </span>
      ),
    },
    {
      key: "driver",
      label: "Livreur",
      sortable: false,
      render: (order: Order) => {
        const assignment = getAssignmentForOrder(order.id);
        if (assignment) {
          const driver = getDriverById(assignment.driverId);
          return (
            <div className="flex items-center gap-2">
              <User size={14} className="text-[#C5A065]" />
              <span className="text-sm font-medium">{driver?.name}</span>
            </div>
          );
        }
        return <span className="text-xs text-gray-400 italic">Non assigné</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (order: Order) => {
        const assignment = getAssignmentForOrder(order.id);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </DropdownMenuItem>
              {!assignment && (
                <DropdownMenuItem onClick={() => handleAssignClick(order)}>
                  <Truck className="w-4 h-4 mr-2" />
                  Assigner livreur
                </DropdownMenuItem>
              )}
              {assignment && (
                <DropdownMenuItem>
                  <Navigation className="w-4 h-4 mr-2" />
                  Suivre livraison
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const availableDrivers = drivers.filter(
    (d) => d.status !== "offline" && d.currentOrders < d.maxOrders
  );

  return (
    <div className="h-full overflow-auto">
      <header className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2
              className="text-4xl md:text-5xl mb-2"
              style={{ fontFamily: '"Great Vibes", cursive', color: "#C5A065" }}
            >
              Attribution des livraisons
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
              Assignez les commandes aux livreurs
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6">
        {/* Drivers Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white p-4 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#C5A065] bg-opacity-20 flex items-center justify-center">
                    <User size={20} className="text-[#C5A065]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#2D2A26] text-sm">
                      {driver.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={10} />
                      {driver.location}
                    </div>
                  </div>
                </div>
                {getDriverStatusBadge(driver.status)}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={12} className="text-gray-400" />
                  {driver.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck size={12} className="text-gray-400" />
                  {driver.vehicle}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Package size={12} className="text-gray-400" />
                  <span>
                    {driver.currentOrders} / {driver.maxOrders} commandes
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#C5A065] h-2 rounded-full transition-all"
                    style={{
                      width: `${(driver.currentOrders / driver.maxOrders) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A065] bg-opacity-20 flex items-center justify-center">
                <Truck size={20} className="text-[#C5A065]" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#2D2A26]">
                  Commandes prêtes pour livraison
                </h3>
                <p className="text-xs text-gray-500">
                  {orders.length} commande(s) en attente
                </p>
              </div>
            </div>
          </div>

          <DataTable
            data={orders}
            columns={orderColumns}
            itemsPerPage={10}
            searchKeys={["orderNumber"]}
          />
        </div>
      </div>

      {/* Assign Driver Modal */}
      <Modal
        open={isAssignModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAssignModalOpen(false);
            setSelectedOrder(null);
            setSelectedDriver(null);
          }
        }}
        title="Assigner un livreur"
        size="lg"
        type="form"
        actions={{
          secondary: {
            label: "Annuler",
            onClick: () => {
              setIsAssignModalOpen(false);
              setSelectedOrder(null);
              setSelectedDriver(null);
            },
          },
          primary: {
            label: "Assigner",
            onClick: handleAssignDriver,
            disabled: !selectedDriver,
          },
        }}
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Order Info */}
            <div className="bg-stone-50 rounded-xl p-4">
              <h4 className="font-semibold text-[#2D2A26] mb-2">
                Commande: {selectedOrder.orderNumber}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span>
                    {selectedOrder.client.firstName}{" "}
                    {selectedOrder.client.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span>
                    {selectedOrder.deliveryAddress?.street},{" "}
                    {selectedOrder.deliveryAddress?.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span>{selectedOrder.deliverySlot}</span>
                </div>
              </div>
            </div>

            {/* Available Drivers */}
            <div>
              <h4 className="font-semibold text-[#2D2A26] mb-3">
                Livreurs disponibles ({availableDrivers.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableDrivers
                  .filter((d) => d.location === selectedOrder.pickupLocation)
                  .map((driver) => (
                    <label
                      key={driver.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedDriver === driver.id
                          ? "border-[#C5A065] bg-[#C5A065] bg-opacity-10"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="driver"
                        value={driver.id}
                        checked={selectedDriver === driver.id}
                        onChange={() => setSelectedDriver(driver.id)}
                        className="accent-[#C5A065]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-[#2D2A26]">
                            {driver.name}
                          </div>
                          {getDriverStatusBadge(driver.status)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {driver.vehicle} • {driver.currentOrders}/
                          {driver.maxOrders} commandes
                        </div>
                      </div>
                    </label>
                  ))}
                {availableDrivers.filter(
                  (d) => d.location === selectedOrder.pickupLocation
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-2" />
                    <p>Aucun livreur disponible pour {selectedOrder.pickupLocation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Order Details Modal */}
      <Modal
        open={isDetailsModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDetailsModalOpen(false);
            setSelectedOrder(null);
          }
        }}
        title="Détails de la commande"
        size="lg"
        type="details"
        actions={{
          primary: {
            label: "Fermer",
            onClick: () => {
              setIsDetailsModalOpen(false);
              setSelectedOrder(null);
            },
          },
        }}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Commande
                </h4>
                <p className="font-semibold text-[#2D2A26]">
                  {selectedOrder.orderNumber}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(selectedOrder.orderDate)}
                </p>
              </div>

              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Client
                </h4>
                <p className="font-semibold text-[#2D2A26]">
                  {selectedOrder.client.firstName} {selectedOrder.client.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedOrder.client.phone}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-2">
                <MapPinned size={14} />
                Adresse de livraison
              </h4>
              <p className="text-[#2D2A26]">{selectedOrder.deliveryAddress?.street}</p>
              <p className="text-sm text-gray-600">
                {selectedOrder.deliveryAddress?.city},{" "}
                {selectedOrder.deliveryAddress?.province}{" "}
                {selectedOrder.deliveryAddress?.postalCode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-2">
                  <Clock size={14} />
                  Créneau
                </h4>
                <p className="font-semibold text-[#2D2A26]">
                  {selectedOrder.deliverySlot}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(selectedOrder.pickupDate)}
                </p>
              </div>

              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-2">
                  <DollarSign size={14} />
                  Total
                </h4>
                <p className="font-semibold text-[#2D2A26] text-lg">
                  {formatCurrency(selectedOrder.total)}
                </p>
                <p className="text-xs text-gray-500">
                  Frais de livraison: {formatCurrency(selectedOrder.deliveryFee)}
                </p>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Notes
                </h4>
                <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
              </div>
            )}

            {getAssignmentForOrder(selectedOrder.id) && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <h4 className="text-sm font-bold text-green-800">
                    Livreur assigné
                  </h4>
                </div>
                <p className="text-sm text-green-700">
                  {
                    getDriverById(
                      getAssignmentForOrder(selectedOrder.id)!.driverId
                    )?.name
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
