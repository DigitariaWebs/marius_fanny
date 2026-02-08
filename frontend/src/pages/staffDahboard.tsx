import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package,
  AlertCircle
} from "lucide-react";
import { StaffLayout } from "../components/layout/StaffLayout"; 

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productionStatus: 'pending' | 'in_production' | 'ready';
}

interface Order {
  id: string;
  orderNumber: string;
  clientId: number;
  client: Client;
  orderDate: string;
  pickupDate: string;
  pickupLocation: string;
  deliveryType: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  depositAmount: number;
  depositPaid: boolean;
  balancePaid: boolean;
  paymentStatus: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'cancelled' | 'completed';
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  role: 'kitchen_staff' | 'customer_service' | 'delivery_driver';
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductionItem {
  productName: string;
  totalQuantity: number;
  targetTime: string;
  orders: string[];
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
}

const now = new Date().toISOString();

/**
 * DONNÉES DE TEST
 */
const FRENCH_BAKERY_PRODUCTS = [
  "Croissant au Beurre", "Pain au Chocolat", "Baguette Tradition", 
  "Pain de Campagne", "Brioche Dorée", "Éclair au Café",
  "Tarte au Citron Meringuée", "Mille-feuille Vanille", "Paris-Brest",
  "Gâteau Forêt Noire", "Charlotte aux Framboises", "Macaron Pistache",
  "Financier Amande", "Kouign-Amann", "Cannelé de Bordeaux",
  "Chausson aux Pommes", "Religieuse Chocolat", "Saint-Honoré",
  "Opéra", "Tarte Tatin", "Savarin au Rhum", "Flan Pâtissier"
];

const FIRST_NAMES = [
  "Sophie", "Jean", "Marie", "Pierre", "Isabelle", "François",
  "Catherine", "Michel", "Nathalie", "Philippe", "Céline", "Laurent"
];

const LAST_NAMES = [
  "Dubois", "Martin", "Bernard", "Petit", "Robert", "Richard",
  "Durand", "Lefebvre", "Moreau", "Simon", "Laurent", "Michel"
];

const PICKUP_TIMES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30", "15:00", "16:00"
];

const LOCATIONS = ["Montreal", "Laval"];

const generateMockOrders = (count: number = 20): Order[] => {
  return Array.from({ length: count }).map((_, i) => {
    const randomProducts = Math.floor(Math.random() * 3) + 1;
    const items: OrderItem[] = Array.from({ length: randomProducts }).map((_, j) => {
      const product: Product = {
        id: 100 + (i * 10) + j,
        name: FRENCH_BAKERY_PRODUCTS[Math.floor(Math.random() * FRENCH_BAKERY_PRODUCTS.length)],
        category: "Boulangerie",
        price: Math.random() * 30 + 5,
        available: true,
        minOrderQuantity: 1,
        maxOrderQuantity: 20,
        createdAt: now,
        updatedAt: now
      };
      
      const quantity = Math.floor(Math.random() * 8) + 1;
      
      return {
        id: (i * 10) + j,
        orderId: i,
        productId: product.id,
        product,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
        productionStatus: (['pending', 'in_production', 'ready'] as const)[Math.floor(Math.random() * 3)]
      };
    });

    const client: Client = {
      id: i + 1,
      firstName: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
      lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
      email: `client${i}@example.com`,
      phone: `514-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: "active",
      createdAt: now,
      updatedAt: now
    };

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const taxAmount = subtotal * 0.15;
    const total = subtotal + taxAmount;

    const statuses: Order['status'][] = ['pending', 'confirmed', 'in_production'];
    
    return {
      id: `ord-${i}`,
      orderNumber: `CMD-${1000 + i}`,
      clientId: client.id,
      client,
      orderDate: now,
      pickupDate: now,
      pickupLocation: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      deliveryType: "pickup",
      items,
      subtotal,
      taxAmount,
      deliveryFee: 0,
      total,
      depositAmount: 0,
      depositPaid: Math.random() > 0.3,
      balancePaid: Math.random() > 0.5,
      paymentStatus: Math.random() > 0.4 ? "paid" : "unpaid",
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: "online",
      createdAt: now,
      updatedAt: now
    };
  });
};

const MOCK_KITCHEN_USER: Staff = {
  id: 1,
  firstName: "Chef",
  lastName: "Marius",
  email: "chef@mariusfanny.com",
  phone: "514-555-0100",
  location: "Montreal",
  role: "kitchen_staff",
  status: "active",
  createdAt: now,
  updatedAt: now
};

/**
 * COMPOSANT PRINCIPAL - DASHBOARD CUISINE
 */
export default function StaffDashboardPage() {
  const navigate = useNavigate();
  const [user] = useState<Staff>(MOCK_KITCHEN_USER);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockOrders = generateMockOrders(20);
    setOrders(mockOrders);
    
    // Générer la liste de production
    const productMap = new Map<string, ProductionItem>();
    
    mockOrders
      .filter(o => o.status === 'pending' || o.status === 'in_production' || o.status === 'confirmed')
      .forEach(order => {
        order.items.forEach(item => {
          const existing = productMap.get(item.product.name);
          if (existing) {
            existing.totalQuantity += item.quantity;
            if (!existing.orders.includes(order.orderNumber)) {
              existing.orders.push(order.orderNumber);
            }
          } else {
            productMap.set(item.product.name, {
              productName: item.product.name,
              totalQuantity: item.quantity,
              targetTime: PICKUP_TIMES[Math.floor(Math.random() * PICKUP_TIMES.length)],
              orders: [order.orderNumber],
              priority: item.quantity > 10 ? 'high' : item.quantity > 5 ? 'medium' : 'low',
              isCompleted: false
            });
          }
        });
      });
    
    setProductionItems(
      Array.from(productMap.values()).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
    );
    
    setLoading(false);
  }, []);

  const handleLogout = () => navigate("/se-connecter");
  
  const toggleProductionComplete = (productName: string) => {
    setProductionItems(prev => 
      prev.map(item => 
        item.productName === productName 
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      )
    );
  };

  // Statistiques
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    inProduction: orders.filter(o => o.status === 'in_production').length,
    completedItems: productionItems.filter(p => p.isCompleted).length,
    totalProduction: productionItems.reduce((acc, p) => acc + p.totalQuantity, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <StaffLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">
              Production du Jour
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Commandes Actives" 
            value={stats.totalOrders} 
            icon={<Package className="w-5 h-5"/>} 
          />
          <StatCard 
            title="À Démarrer" 
            value={stats.pendingOrders} 
            icon={<Clock className="w-5 h-5"/>} 
          />
          <StatCard 
            title="En Production" 
            value={stats.inProduction} 
            icon={<ChefHat className="w-5 h-5"/>} 
          />
          <StatCard 
            title="Items Complétés" 
            value={stats.completedItems} 
            icon={<CheckCircle className="w-5 h-5"/>} 
          />
        </div>

        {/* Liste de production */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">File de Production</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {productionItems.length} produits à préparer • {stats.totalProduction} unités totales
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {productionItems.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Tout est prêt</h3>
                <p className="text-sm text-gray-500">Aucune commande en attente de production</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productionItems.map((item) => (
                  <ProductionCard 
                    key={item.productName}
                    item={item}
                    onToggle={() => toggleProductionComplete(item.productName)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </StaffLayout>
  );
}

/**
 * COMPOSANT CARTE DE STATISTIQUE
 */
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/**
 * COMPOSANT CARTE DE PRODUCTION
 */
interface ProductionCardProps {
  item: ProductionItem;
  onToggle: () => void;
}

function ProductionCard({ item, onToggle }: ProductionCardProps) {
  const priorityConfig = {
    high: {
      badge: "bg-red-50 text-red-700 border-red-200",
      label: "URGENT",
      icon: <AlertCircle className="w-3.5 h-3.5" />
    },
    medium: {
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      label: "PRIORITAIRE",
      icon: <Clock className="w-3.5 h-3.5" />
    },
    low: {
      badge: "bg-gray-50 text-gray-600 border-gray-200",
      label: "STANDARD",
      icon: null
    }
  };

  const config = priorityConfig[item.priority];

  return (
    <div className={`
      border rounded-lg p-4 transition-all
      ${item.isCompleted 
        ? 'bg-gray-50 border-gray-200 opacity-60' 
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }
    `}>
      <div className="flex items-start gap-4">
        
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`
            shrink-0 w-6 h-6 rounded border-2 transition-all
            ${item.isCompleted 
              ? 'bg-gray-900 border-gray-900' 
              : 'bg-white border-gray-300 hover:border-gray-400'
            }
            flex items-center justify-center
          `}
        >
          {item.isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
        </button>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${item.isCompleted ? 'line-through' : ''}`}>
                {item.productName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium ${config.badge}`}>
                  {config.icon}
                  {config.label}
                </span>
                <span className="text-gray-600 text-xs">
                  Pour {item.targetTime}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{item.totalQuantity}</div>
              <div className="text-xs text-gray-500 uppercase font-medium">unités</div>
            </div>
          </div>

          {/* Commandes */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-500 uppercase">
              {item.orders.length} commande{item.orders.length > 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {item.orders.slice(0, 8).map(orderNum => (
                <span 
                  key={orderNum}
                  className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs font-medium border border-gray-200"
                >
                  {orderNum}
                </span>
              ))}
              {item.orders.length > 8 && (
                <span className="text-xs text-gray-500 self-center">
                  +{item.orders.length - 8} autres
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}