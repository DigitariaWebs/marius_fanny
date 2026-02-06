import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search, X, Printer } from "lucide-react";
import { StaffLayout } from "../components/layout/StaffLayout";
import OrderForm from "../components/OrderForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  role: 'kitchen_staff' | 'customer_service';
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  phone: string;
  pickupDate: string;
  pickupLocation: string;
  total: number;
  status: string;
  items: number;
}

const now = new Date().toISOString();

const MOCK_SERVICE_USER: Staff = {
  id: 2,
  firstName: "Sophie",
  lastName: "Fanny",
  email: "service@mariusfanny.com",
  phone: "514-555-0200",
  location: "Montreal",
  role: "customer_service",
  status: "active",
  createdAt: now,
  updatedAt: now
};

// Données de test pour les commandes récentes
const generateRecentOrders = (): Order[] => {
  const names = [
    "Sophie Dubois", "Jean Martin", "Marie Bernard", 
    "Pierre Petit", "Isabelle Robert", "François Richard"
  ];
  
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `ord-${i}`,
    orderNumber: `CMD-${2000 + i}`,
    clientName: names[i % names.length],
    phone: `514-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    pickupDate: new Date().toLocaleDateString('fr-FR'),
    pickupLocation: i % 2 === 0 ? "Montreal" : "Laval",
    total: Math.random() * 150 + 50,
    status: ['pending', 'confirmed', 'ready'][i % 3],
    items: Math.floor(Math.random() * 5) + 2
  }));
};


export default function CustomerServicePage() {
  const navigate = useNavigate();
  const [user] = useState<Staff>(MOCK_SERVICE_USER);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orders, setOrders] = useState<Order[]>(generateRecentOrders());
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => navigate("/se-connecter");

  const handleOrderSubmit = (formData: any) => {
    console.log("Nouvelle commande:", formData);
    setShowOrderForm(false);
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Commande ${order.orderNumber}</title>
          <style>
            @page {
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .order-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-section h3 {
              font-size: 14px;
              color: #666;
              margin: 0 0 10px 0;
              text-transform: uppercase;
            }
            .info-section p {
              margin: 5px 0;
              font-size: 16px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            .items-table th {
              background: #f5f5f5;
              padding: 12px;
              text-align: left;
              border-bottom: 2px solid #000;
              font-size: 14px;
            }
            .items-table td {
              padding: 10px 12px;
              border-bottom: 1px solid #ddd;
              font-size: 14px;
            }
            .total-section {
              margin-top: 30px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              gap: 100px;
              padding: 10px 0;
              font-size: 18px;
            }
            .total-row.grand-total {
              font-weight: bold;
              font-size: 22px;
              border-top: 2px solid #000;
              padding-top: 15px;
              margin-top: 10px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-pending {
              background: #fef3c7;
              color: #92400e;
            }
            .status-confirmed {
              background: #dbeafe;
              color: #1e40af;
            }
            .status-ready {
              background: #d1fae5;
              color: #065f46;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MARIUS & FANNY</h1>
            <p>Boulangerie-Pâtisserie Artisanale</p>
            <p>514-555-0100 • info@mariusfanny.com</p>
          </div>

          <div class="order-info">
            <div class="info-section">
              <h3>Commande</h3>
              <p><strong>Numéro:</strong> ${order.orderNumber}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p>
                <strong>Statut:</strong> 
                <span class="status-badge status-${order.status}">
                  ${order.status === 'pending' ? 'En attente' : 
                    order.status === 'confirmed' ? 'Confirmé' : 'Prêt'}
                </span>
              </p>
            </div>

            <div class="info-section">
              <h3>Client</h3>
              <p><strong>Nom:</strong> ${order.clientName}</p>
              <p><strong>Téléphone:</strong> ${order.phone}</p>
              <p><strong>Retrait:</strong> ${order.pickupDate}</p>
              <p><strong>Lieu:</strong> ${order.pickupLocation}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Article</th>
                <th style="text-align: center;">Quantité</th>
                <th style="text-align: right;">Prix unitaire</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: order.items }).map((_, i) => `
                <tr>
                  <td>Article ${i + 1}</td>
                  <td style="text-align: center;">1</td>
                  <td style="text-align: right;">${(order.total / order.items).toFixed(2)} $</td>
                  <td style="text-align: right;">${(order.total / order.items).toFixed(2)} $</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Sous-total:</span>
              <span>${(order.total / 1.15).toFixed(2)} $</span>
            </div>
            <div class="total-row">
              <span>TPS + TVQ (14.975%):</span>
              <span>${(order.total - order.total / 1.15).toFixed(2)} $</span>
            </div>
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>${order.total.toFixed(2)} $</span>
            </div>
          </div>

          <div class="footer">
            <p>Merci pour votre commande !</p>
            <p>Marius & Fanny - Boulangerie Artisanale</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.includes(searchTerm)
  );

  const statusConfig = {
    pending: { label: "En attente", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    confirmed: { label: "Confirmé", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    ready: { label: "Prêt", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" }
  };

  return (
    <StaffLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">
              Service Client
            </h1>
            <p className="text-sm text-gray-500">
              Gestion et saisie des commandes
            </p>
          </div>
          
          <Button 
            onClick={() => setShowOrderForm(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Nouvelle Commande
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par numéro, nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Commandes Récentes
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">Aucune commande trouvée</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div 
                  key={order.id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border
                          ${statusConfig[order.status as keyof typeof statusConfig].bg}
                          ${statusConfig[order.status as keyof typeof statusConfig].text}
                          ${statusConfig[order.status as keyof typeof statusConfig].border}
                        `}>
                          {statusConfig[order.status as keyof typeof statusConfig].label}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Client:</span> {order.clientName}</p>
                        <p><span className="font-medium">Tél:</span> {order.phone}</p>
                        <p><span className="font-medium">Retrait:</span> {order.pickupDate} • {order.pickupLocation}</p>
                        <p><span className="font-medium">Articles:</span> {order.items}</p>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-3">
                      <div className="text-2xl font-bold text-gray-900">
                        {order.total.toFixed(2)} $
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintOrder(order)}
                        className="flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal du formulaire de commande */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="relative w-full max-w-4xl my-8">
            <div className="bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Nouvelle Commande
                </h2>
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <OrderForm
                onSubmit={handleOrderSubmit}
                onCancel={() => setShowOrderForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}