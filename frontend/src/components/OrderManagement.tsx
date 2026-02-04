import { useState } from "react";
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
import OrderForm from "./OrderForm";
import type { Order } from "../types";

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
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
      items: [],
      subtotal: 85.0,
      taxAmount: 12.73,
      deliveryFee: 0,
      total: 97.73,
      depositAmount: 48.87,
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
      id: 2,
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
      items: [],
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
      id: 3,
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
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique clients from orders
  const clients = orders
    .map((order) => order.client)
    .filter(
      (client, index, self) =>
        index === self.findIndex((c) => c.id === client.id),
    );

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: {
        label: "En attente",
        className: "bg-yellow-100 text-yellow-800",
      },
      confirmed: {
        label: "Confirmée",
        className: "bg-blue-100 text-blue-800",
      },
      in_production: {
        label: "En production",
        className: "bg-purple-100 text-purple-800",
      },
      ready: { label: "Prête", className: "bg-green-100 text-green-800" },
      completed: {
        label: "Complétée",
        className: "bg-gray-100 text-gray-800",
      },
      cancelled: { label: "Annulée", className: "bg-red-100 text-red-800" },
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
      unpaid: { label: "Non payé", className: "bg-red-100 text-red-800" },
      deposit_paid: {
        label: "Dépôt payé",
        className: "bg-yellow-100 text-yellow-800",
      },
      paid: { label: "Payé", className: "bg-green-100 text-green-800" },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const filters = [
    {
      key: "status",
      label: "Statut de commande",
      options: [
        { value: "all", label: "Tous les statuts" },
        { value: "pending", label: "En attente" },
        { value: "confirmed", label: "Confirmée" },
        { value: "in_production", label: "En production" },
        { value: "ready", label: "Prête" },
        { value: "completed", label: "Complétée" },
        { value: "cancelled", label: "Annulée" },
      ],
    },
    {
      key: "paymentStatus",
      label: "Paiement",
      options: [
        { value: "all", label: "Tous les paiements" },
        { value: "unpaid", label: "Non payé" },
        { value: "deposit_paid", label: "Dépôt payé" },
        { value: "paid", label: "Payé" },
      ],
    },
    {
      key: "pickupLocation",
      label: "Lieu",
      options: [
        { value: "all", label: "Tous les lieux" },
        { value: "Montreal", label: "Montréal" },
        { value: "Laval", label: "Laval" },
      ],
    },
    {
      key: "source",
      label: "Source",
      options: [
        { value: "all", label: "Toutes les sources" },
        { value: "online", label: "En ligne" },
        { value: "phone", label: "Téléphone" },
        { value: "in_store", label: "En magasin" },
      ],
    },
  ];

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!orderToDelete) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setOrders(orders.filter((o) => o.id !== orderToDelete.id));
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
      setIsSubmitting(false);
    }, 500);
  };

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleCancel = () => {
    if (!orderToCancel) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setOrders(
        orders.map((o) =>
          o.id === orderToCancel.id ? { ...o, status: "cancelled" } : o,
        ),
      );
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
      setIsSubmitting(false);
    }, 500);
  };

  const handleUpdateStatus = (orderId: number, newStatus: Order["status"]) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
  };

  const columns = [
    {
      key: "orderNumber",
      label: "Numéro",
      sortable: true,
      render: (order: Order) => order.orderNumber,
    },
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (order: Order) =>
        `${order.client.firstName} ${order.client.lastName}`,
    },
    {
      key: "orderDate",
      label: "Date de commande",
      sortable: true,
      render: (order: Order) => formatDate(order.orderDate),
    },
    {
      key: "pickupDate",
      label: "Date de retrait",
      sortable: true,
      render: (order: Order) => formatDate(order.pickupDate),
    },
    {
      key: "pickupLocation",
      label: "Lieu",
      sortable: true,
      render: (order: Order) => order.pickupLocation,
    },
    {
      key: "deliveryType",
      label: "Type",
      sortable: true,
      render: (order: Order) =>
        order.deliveryType === "pickup" ? "Ramassage" : "Livraison",
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (order: Order) => formatCurrency(order.total),
    },
    {
      key: "paymentStatus",
      label: "Paiement",
      sortable: true,
      render: (order: Order) => getPaymentBadge(order.paymentStatus),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (order: Order) => getStatusBadge(order.status),
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
      render: (order: Order) => {
        const sourceLabels = {
          online: "En ligne",
          phone: "Téléphone",
          in_store: "En magasin",
        };
        return (
          sourceLabels[order.source as keyof typeof sourceLabels] ||
          order.source
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (order: Order) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(order)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
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
                    Marquer prête
                  </DropdownMenuItem>
                )}
                {order.status === "ready" && (
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(order.id, "completed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer complétée
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleCancelClick(order)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler
                </DropdownMenuItem>
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

  const getSearchValue = (order: Order) => {
    return `${order.orderNumber} ${order.client.firstName} ${order.client.lastName} ${order.client.phone}`;
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#2D2A26]">
              Gestion des Commandes
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Gérer toutes les commandes (en ligne, téléphone, en magasin)
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#2D2A26] hover:bg-[#C5A065] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Nouvelle Commande</span>
          </button>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <DataTable
          data={orders}
          columns={columns}
          filters={filters}
          searchPlaceholder="Rechercher par numéro, client ou téléphone..."
          getSearchValue={getSearchValue}
          itemsPerPage={10}
          selectable={false}
        />
      </div>

      {/* Details Modal */}
      <Modal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        type="details"
        title="Détails de la Commande"
        description="Informations complètes sur la commande"
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
                  <Package className="w-8 h-8 text-[#C5A065]" />
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
                  <DollarSign className="w-8 h-8 text-[#C5A065]" />
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
                  <CheckCircle className="w-8 h-8 text-[#C5A065]" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="items">
                  Articles ({selectedOrder.items.length})
                </TabsTrigger>
                <TabsTrigger value="payments">Paiements</TabsTrigger>
                <TabsTrigger value="delivery">Livraison</TabsTrigger>
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
                          {selectedOrder.orderNumber}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getPaymentBadge(selectedOrder.paymentStatus)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-(--bakery-text-secondary)">
                      <p>Commandée le</p>
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
                              Téléphone
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
                          Quantité
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
                              {item.product.name}
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
                                  ? "Prêt"
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
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Dépôt (50%)
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatCurrency(selectedOrder.depositAmount)}
                        </div>
                      </div>
                      <div className="text-right">
                        {selectedOrder.depositPaid ? (
                          <>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Payé
                            </span>
                            {selectedOrder.depositPaidAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(selectedOrder.depositPaidAt)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            Non payé
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
                              Payé
                            </span>
                            {selectedOrder.balancePaidAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(selectedOrder.balancePaidAt)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            Dû au retrait
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
                          Créneau horaire
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
                                Cette commande sera livrée de Laval à Montréal
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
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal - Placeholder for now */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <OrderForm
            onSubmit={(formData) => {
              console.log("Order form submitted:", formData);
              // TODO: Implement actual order creation/update
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedOrder(null);
            }}
            onCancel={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedOrder(null);
            }}
            initialData={
              selectedOrder
                ? {
                    date: selectedOrder.orderDate.split("T")[0],
                    clientId: selectedOrder.clientId,
                    firstName: selectedOrder.client.firstName,
                    lastName: selectedOrder.client.lastName,
                    phone: selectedOrder.client.phone,
                    email: selectedOrder.client.email,
                    pickupLocation: selectedOrder.pickupLocation,
                    deliveryType: selectedOrder.deliveryType,
                    notes: selectedOrder.notes || "",
                    deliveryFee: selectedOrder.deliveryFee,
                    deliveryAddress: selectedOrder.deliveryAddress
                      ? {
                          street: selectedOrder.deliveryAddress.street,
                          city: selectedOrder.deliveryAddress.city,
                          province: selectedOrder.deliveryAddress.province,
                          postalCode: selectedOrder.deliveryAddress.postalCode,
                        }
                      : undefined,
                  }
                : undefined
            }
            clients={clients}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        type="warning"
        title="Confirmer la suppression"
        description="Cette action est irréversible"
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
              Êtes-vous sûr de vouloir supprimer cette commande ?
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {orderToDelete.orderNumber}
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
              Cette action est irréversible. Toutes les données associées à
              cette commande seront perdues.
            </p>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        type="warning"
        title="Annuler la commande"
        description="Le statut de la commande sera changé en annulé"
        icon={<XCircle className="h-6 w-6 text-amber-600" />}
        actions={{
          primary: {
            label: "Annuler la commande",
            onClick: handleCancel,
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
              Êtes-vous sûr de vouloir annuler cette commande ?
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {orderToCancel.orderNumber}
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
              La commande restera dans le système mais ne sera plus traitée.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
