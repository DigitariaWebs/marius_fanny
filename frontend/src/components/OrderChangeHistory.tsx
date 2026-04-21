import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  FileEdit, 
  Package, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Clock,
  User,
  FileText
} from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface OrderChange {
  changedAt: string;
  changedBy?: string;
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'created' | 'updated' | 'status_changed' | 'payment_updated' | 'items_modified';
  notes?: string;
}

interface OrderChangeHistoryProps {
  orderId: string;
  orderNumber?: string;
}

const changeTypeConfig = {
  created: {
    label: 'Créé',
    icon: FileText,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600',
  },
  updated: {
    label: 'Modifié',
    icon: FileEdit,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600',
  },
  status_changed: {
    label: 'Statut',
    icon: AlertCircle,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    iconColor: 'text-purple-600',
  },
  payment_updated: {
    label: 'Paiement',
    icon: DollarSign,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600',
  },
  items_modified: {
    label: 'Articles',
    icon: Package,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconColor: 'text-orange-600',
  },
};

const formatValue = (value: any, field?: string): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';

  if (field === 'items' && Array.isArray(value)) {
    if (value.length === 0) return 'Aucun produit';

    return value
      .map((item: any) => {
        const productName = item?.productName || (item?.productId ? `Produit #${item.productId}` : 'Produit');
        const quantity = Number(item?.quantity || 0);
        const unitPrice = Number(item?.unitPrice || 0);
        return `• ${productName} × ${quantity} (${unitPrice.toFixed(2)} $)`;
      })
      .join('\n');
  }

  if (typeof value === 'object') {
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      return new Date(value).toLocaleDateString('fr-CA');
    }
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const formatFieldName = (field: string): string => {
  const fieldNames: Record<string, string> = {
    status: 'Statut',
    depositPaid: 'Dépôt payé',
    balancePaid: 'Solde payé',
    items: 'Articles',
    clientInfo: 'Info client',
    pickupDate: 'Date de ramassage',
    pickupLocation: 'Lieu de ramassage',
    deliveryType: 'Type de livraison',
    deliveryAddress: 'Adresse de livraison',
    notes: 'Notes',
    squarePaymentId: 'ID paiement Square',
    squareInvoiceId: 'ID facture Square',
    total: 'Total',
    subtotal: 'Sous-total',
    taxAmount: 'Taxes',
    deliveryFee: 'Frais de livraison',
  };
  return fieldNames[field] || field;
};

export default function OrderChangeHistory({ orderId, orderNumber }: OrderChangeHistoryProps) {
  const [history, setHistory] = useState<OrderChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('bearer_token');
        const response = await fetch(`${apiUrl}/api/orders/${orderId}/history`, {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          throw new Error(`Failed to fetch order history (${response.status}) ${errBody.slice(0, 200)}`);
        }

        const result = await response.json();
        setHistory(result.data?.changeHistory || []);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('Impossible de charger l\'historique des modifications');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchHistory();
    }
  }, [orderId]);

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(change => change.changeType === filter);

  const changeTypeCounts = {
    all: history.length,
    created: history.filter(c => c.changeType === 'created').length,
    status_changed: history.filter(c => c.changeType === 'status_changed').length,
    payment_updated: history.filter(c => c.changeType === 'payment_updated').length,
    items_modified: history.filter(c => c.changeType === 'items_modified').length,
    updated: history.filter(c => c.changeType === 'updated').length,
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des modifications</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des modifications</CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des modifications</CardTitle>
          <CardDescription>Aucune modification enregistrée pour cette commande</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historique des modifications
        </CardTitle>
        <CardDescription>
          {orderNumber && `Commande ${orderNumber} • `}
          {history.length} modification{history.length > 1 ? 's' : ''} enregistrée{history.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">
              Tout ({changeTypeCounts.all})
            </TabsTrigger>
            <TabsTrigger value="created">
              <FileText className="h-4 w-4 mr-1" />
              {changeTypeCounts.created}
            </TabsTrigger>
            <TabsTrigger value="status_changed">
              <AlertCircle className="h-4 w-4 mr-1" />
              {changeTypeCounts.status_changed}
            </TabsTrigger>
            <TabsTrigger value="payment_updated">
              <DollarSign className="h-4 w-4 mr-1" />
              {changeTypeCounts.payment_updated}
            </TabsTrigger>
            <TabsTrigger value="items_modified">
              <Package className="h-4 w-4 mr-1" />
              {changeTypeCounts.items_modified}
            </TabsTrigger>
            <TabsTrigger value="updated">
              <FileEdit className="h-4 w-4 mr-1" />
              {changeTypeCounts.updated}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-125 w-full pr-4">
              <div className="space-y-4">
                {filteredHistory.map((change, index) => {
                  const config = changeTypeConfig[change.changeType];
                  const Icon = config.icon;

                  return (
                    <div
                      key={index}
                      className="border-l-4 border-gray-200 pl-4 py-3 hover:border-[#C5A065] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${config.color}`}>
                            <Icon className={`h-4 w-4 ${config.iconColor}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {formatFieldName(change.field)}
                              </span>
                              <Badge variant="outline" className={config.color}>
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(change.changedAt).toLocaleString('fr-CA', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {change.changedBy && (
                                <>
                                  <User className="h-3 w-3 ml-2" />
                                  <span>{change.changedBy}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {change.notes && (
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {change.notes}
                        </div>
                      )}

                      {change.changeType !== 'created' && (
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-red-50 p-3 rounded border border-red-100">
                            <div className="font-medium text-red-900 mb-1">Ancienne valeur</div>
                            <div className="text-red-700 whitespace-pre-wrap wrap-break-word">
                              {formatValue(change.oldValue, change.field)}
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded border border-green-100">
                            <div className="font-medium text-green-900 mb-1">Nouvelle valeur</div>
                            <div className="text-green-700 whitespace-pre-wrap wrap-break-word">
                              {formatValue(change.newValue, change.field)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
