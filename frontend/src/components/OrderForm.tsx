import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Client, Address, Product } from "../types";
import { TAX_RATE } from "../data";
import { productAPI } from "../lib/ProductAPI";
import {
  calculateDeliveryFee,
  validateMinimumOrder,
  DELIVERY_ZONES,
} from "../utils/deliveryZones";

interface OrderFormProps {
  onSubmit: (formData: OrderFormData) => void;
  onCancel: () => void;
  initialData?: Partial<OrderFormData>;
  isSubmitting?: boolean;
  clients?: Client[];
}

interface OrderFormData {
  date: string;
  clientId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  items: OrderFormItem[];
  notes: string;
  pickupLocation: "Montreal" | "Laval";
  deliveryType: "pickup" | "delivery";
  deliveryAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  // AJOUT: Adresse de facturation
  billingAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    sameAsDelivery?: boolean;
  };
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  depositAmount: number;
  balance: number;
}

interface OrderFormItem {
  id: string;
  productId: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  notes: string;
}

export default function OrderForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
  clients = [],
}: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    clientId: initialData?.clientId,
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    items: initialData?.items || [],
    notes: initialData?.notes || "",
    pickupLocation: initialData?.pickupLocation || "Laval",
    deliveryType: initialData?.deliveryType || "pickup",
    deliveryAddress: initialData?.deliveryAddress,
    // AJOUT: Initialisation de l'adresse de facturation
    billingAddress: initialData?.billingAddress || {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      sameAsDelivery: true,
    },
    subtotal: 0,
    taxAmount: 0,
    deliveryFee: initialData?.deliveryFee || 0,
    total: 0,
    depositAmount: 0,
    balance: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  // AJOUT: État pour l'adresse de facturation sélectionnée
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<
    number | null
  >(null);
  const [deliveryZoneInfo, setDeliveryZoneInfo] = useState<{
    zoneName: string;
    fee: number;
    minimumOrder: number;
    isValid: boolean;
  } | null>(null);
  const [minimumOrderError, setMinimumOrderError] = useState<string>("");

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productAPI.getAllProducts();
      setProducts(response.data.products.filter(p => p.available));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * TAX_RATE;
    const total = subtotal + taxAmount + formData.deliveryFee;
    const depositAmount = total * 0.5;
    const balance = total - depositAmount;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      taxAmount,
      total,
      depositAmount,
      balance,
    }));

    if (
      formData.deliveryType === "delivery" &&
      deliveryZoneInfo?.isValid &&
      subtotal > 0
    ) {
      if (subtotal < deliveryZoneInfo.minimumOrder) {
        const shortfall = deliveryZoneInfo.minimumOrder - subtotal;
        setMinimumOrderError(
          `Minimum de commande de ${deliveryZoneInfo.minimumOrder.toFixed(2)}$ requis pour ${formData.deliveryAddress?.postalCode}. Il manque ${shortfall.toFixed(2)}$.`,
        );
      } else {
        setMinimumOrderError("");
      }
    } else {
      setMinimumOrderError("");
    }
  }, [
    formData.items,
    formData.deliveryFee,
    deliveryZoneInfo,
    formData.deliveryType,
  ]);

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "deliveryType") {
        if (value === "pickup") {
          updated.deliveryAddress = undefined;
          updated.deliveryFee = 0;
          setSelectedAddressId(null);
        }
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "deliveryType") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (value === "pickup") {
          delete newErrors.deliveryAddress;
          delete newErrors.deliveryCity;
          delete newErrors.deliveryProvince;
          delete newErrors.deliveryPostalCode;
        } else if (value === "delivery") {
          delete newErrors.pickupLocation;
        }
        return newErrors;
      });
    }
  };

  const handleItemChange = (
    id: string,
    field: keyof OrderFormItem,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const handleProductSelect = (itemId: string, productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          const quantity = Math.max(product.minOrderQuantity, 1);
          return {
            ...item,
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
            amount: quantity * product.price,
          };
        }
        return item;
      }),
    }));
  };

  const getAvailableProducts = (currentItemId: string): Product[] => {
    const selectedProductIds = formData.items
      .filter((item) => item.id !== currentItemId && item.productId)
      .map((item) => item.productId);

    return products.filter(
      (product) =>
        product.available && !selectedProductIds.includes(product.id),
    );
  };

  const getProductById = (productId: number | null): Product | null => {
    if (!productId) return null;
    return products.find((p) => p.id === productId) || null;
  };

  const validatePreparationTime = (orderDate: string, productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.preparationTimeHours) return true;

    const orderDateTime = new Date(orderDate);
    const now = new Date();
    const timeDiff = orderDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    return hoursDiff >= product.preparationTimeHours;
  };

  const getPreparationTimeWarning = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.preparationTimeHours) return null;

    if (product.preparationTimeHours >= 24) {
      return `Ce produit nécessite ${product.preparationTimeHours / 24} jour${product.preparationTimeHours / 24 > 1 ? "s" : ""} de préparation.`;
    } else if (product.preparationTimeHours >= 12) {
      return `Ce produit nécessite ${product.preparationTimeHours} heures de préparation.`;
    } else {
      return `Ce produit nécessite ${product.preparationTimeHours} heure${product.preparationTimeHours > 1 ? "s" : ""} de préparation.`;
    }
  };

  const addItem = () => {
    const newItem: OrderFormItem = {
      id: Date.now().toString(),
      productId: null,
      productName: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
    }
  };

  const filteredClients = clients.filter((client) =>
    client.email.toLowerCase().includes(emailSearch.toLowerCase()),
  );

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData((prev) => ({
      ...prev,
      clientId: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
    }));
    setEmailSearch(client.email);
    setEmailOpen(false);
    setSelectedAddressId(null);
    setSelectedBillingAddressId(null);
  };

  const handleEmailChange = (value: string) => {
    setEmailSearch(value);
    setFormData((prev) => ({ ...prev, email: value }));

    if (selectedClient && value !== selectedClient.email) {
      setSelectedClient(null);
      setFormData((prev) => ({ ...prev, clientId: undefined }));
    }
  };

  const handleAddressSelect = (addressId: number) => {
    if (!selectedClient) return;

    const address = selectedClient.addresses.find(
      (addr) => addr.id === addressId,
    );
    if (address) {
      setSelectedAddressId(addressId);
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: {
          street: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
        },
      }));
    }
  };

  // AJOUT: Fonction pour sélectionner l'adresse de facturation
  const handleBillingAddressSelect = (addressId: number) => {
    if (!selectedClient) return;

    const address = selectedClient.addresses.find(
      (addr) => addr.id === addressId,
    );
    if (address) {
      setSelectedBillingAddressId(addressId);
      setFormData((prev) => ({
        ...prev,
        billingAddress: {
          street: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          sameAsDelivery: false,
        },
      }));
    }
  };

  // AJOUT: Fonction pour copier l'adresse de livraison
  const copyDeliveryToBilling = () => {
    if (formData.deliveryAddress) {
      setFormData((prev) => ({
        ...prev,
        billingAddress: {
          ...prev.deliveryAddress!,
          sameAsDelivery: true,
        },
      }));
      setSelectedBillingAddressId(null);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom de famille est requis";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    }
    if (!formData.date) {
      newErrors.date = "La date est requise";
    }

    if (formData.deliveryType === "pickup") {
      if (!formData.pickupLocation) {
        newErrors.pickupLocation = "Le lieu de ramassage est requis";
      }
    }

    if (formData.deliveryType === "delivery") {
      if (!formData.deliveryAddress?.street.trim()) {
        newErrors.deliveryAddress = "L'adresse de livraison est requise";
      }
      if (!formData.deliveryAddress?.city.trim()) {
        newErrors.deliveryCity = "La ville est requise";
      }
      if (!formData.deliveryAddress?.province.trim()) {
        newErrors.deliveryProvince = "La province est requise";
      }
      if (!deliveryZoneInfo?.isValid) {
        newErrors.deliveryZone =
          "Veuillez sélectionner un code postal de livraison valide";
      }
      if (minimumOrderError) {
        newErrors.minimumOrder = minimumOrderError;
      }
    }

    // AJOUT: Validation de l'adresse de facturation
    if (!formData.billingAddress?.street.trim()) {
      newErrors.billingAddress = "L'adresse de facturation est requise";
    }
    if (!formData.billingAddress?.city.trim()) {
      newErrors.billingCity = "La ville de facturation est requise";
    }
    if (!formData.billingAddress?.province.trim()) {
      newErrors.billingProvince = "La province de facturation est requise";
    }
    if (!formData.billingAddress?.postalCode.trim()) {
      newErrors.billingPostalCode = "Le code postal de facturation est requis";
    }

    const hasValidItem = formData.items.some(
      (item) => item.productId && item.quantity > 0,
    );
    if (!hasValidItem) {
      newErrors.items = "Au moins un article est requis";
    }

    formData.items.forEach((item, index) => {
      if (item.productId) {
        const product = getProductById(item.productId);
        if (product) {
          if (item.quantity < product.minOrderQuantity) {
            newErrors[`item_${index}_quantity`] =
              `Minimum ${product.minOrderQuantity}`;
          }
          if (item.quantity > product.maxOrderQuantity) {
            newErrors[`item_${index}_quantity`] =
              `Maximum ${product.maxOrderQuantity}`;
          }
        }
      }
    });

    formData.items.forEach((item, index) => {
      if (item.productId) {
        if (!validatePreparationTime(formData.date, item.productId)) {
          const warning = getPreparationTimeWarning(item.productId);
          newErrors[`item_${index}_preparation`] =
            warning || "Temps de préparation insuffisant";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1: Informations client */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
        <div>
          <Label htmlFor="date" className="text-xs text-gray-600">
            DATE:
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className={errors.date ? "border-red-500" : ""}
          />
          {errors.date && (
            <p className="text-xs text-red-500 mt-1">{errors.date}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-xs text-gray-600">
            EMAIL:
          </Label>
          <Popover open={emailOpen} onOpenChange={setEmailOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={emailOpen}
                className={`w-full justify-start text-left font-normal ${
                  errors.email ? "border-red-500" : ""
                }`}
              >
                {emailSearch || "Rechercher un client..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Rechercher par email..."
                  value={emailSearch}
                  onValueChange={handleEmailChange}
                />
                <CommandList>
                  <CommandEmpty>Aucun client trouvé</CommandEmpty>
                  <CommandGroup>
                    {filteredClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.email}
                        onSelect={() => handleClientSelect(client)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {client.firstName} {client.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {client.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="firstName" className="text-xs text-gray-600">
            PRÉNOM:
          </Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className={errors.firstName ? "border-red-500" : ""}
            placeholder="Prénom"
          />
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName" className="text-xs text-gray-600">
            NOM DE FAMILLE:
          </Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className={errors.lastName ? "border-red-500" : ""}
            placeholder="Nom de famille"
          />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-xs text-gray-600">
            TÉL:
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={errors.phone ? "border-red-500" : ""}
            placeholder="(___) ___-____"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="col-span-2">
          {selectedClient && (
            <div className="text-xs bg-green-50 text-green-700 p-2 rounded-md">
              Client existant: {selectedClient.firstName}{" "}
              {selectedClient.lastName}
            </div>
          )}
          {!selectedClient && emailSearch && (
            <div className="text-xs bg-blue-50 text-blue-700 p-2 rounded-md">
              Nouveau client
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Type de commande (Ramassage/Livraison) */}
      <div className="pb-4 border-b border-gray-200">
        <div className="mb-4">
          <Label className="text-xs text-gray-600 mb-2">TYPE:</Label>
          <RadioGroup
            value={formData.deliveryType}
            onValueChange={(value) => handleInputChange("deliveryType", value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup" className="text-sm font-normal">
                Ramassage
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery" className="text-sm font-normal">
                Livraison
              </Label>
            </div>
          </RadioGroup>
        </div>

        {formData.deliveryType === "pickup" && (
          <div>
            <Label className="text-xs text-gray-600 mb-2">
              LIEU DE RAMASSAGE:
            </Label>
            <RadioGroup
              value={formData.pickupLocation}
              onValueChange={(value) =>
                handleInputChange("pickupLocation", value)
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Laval" id="laval" />
                <Label htmlFor="laval" className="text-sm font-normal">
                  Laval
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Montreal" id="montreal" />
                <Label htmlFor="montreal" className="text-sm font-normal">
                  Montréal
                </Label>
              </div>
            </RadioGroup>
            {errors.pickupLocation && (
              <p className="text-xs text-red-500 mt-1">
                {errors.pickupLocation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: Adresse de livraison (uniquement pour livraison) */}
      {formData.deliveryType === "delivery" && (
        <div className="space-y-4 pb-4 border-b border-gray-200">
          <Label className="text-xs text-gray-600">ADRESSE DE LIVRAISON:</Label>

          {selectedClient && selectedClient.addresses.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">
                Adresses enregistrées:
              </Label>
              <RadioGroup
                value={selectedAddressId?.toString()}
                onValueChange={(value) => handleAddressSelect(parseInt(value))}
                className="space-y-2"
              >
                {selectedClient.addresses.map((address) => (
                  <div key={address.id} className="flex items-start space-x-2">
                    <RadioGroupItem
                      value={address.id.toString()}
                      id={`address-${address.id}`}
                    />
                    <Label
                      htmlFor={`address-${address.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      <div>
                        <div>{address.street}</div>
                        <div className="text-xs text-gray-500">
                          {address.city}, {address.province}{" "}
                          {address.postalCode}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="text-xs text-gray-500 mt-2">
                Ou entrez une nouvelle adresse:
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="street" className="text-xs text-gray-600">
                RUE:
              </Label>
              <Input
                id="street"
                type="text"
                value={formData.deliveryAddress?.street || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryAddress: {
                      ...prev.deliveryAddress,
                      street: e.target.value,
                      city: prev.deliveryAddress?.city || "",
                      province: prev.deliveryAddress?.province || "",
                      postalCode: prev.deliveryAddress?.postalCode || "",
                    },
                  }))
                }
                className={errors.deliveryAddress ? "border-red-500" : ""}
                placeholder="123 Rue Example"
              />
              {errors.deliveryAddress && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.deliveryAddress}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="city" className="text-xs text-gray-600">
                VILLE:
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.deliveryAddress?.city || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryAddress: {
                      ...prev.deliveryAddress,
                      street: prev.deliveryAddress?.street || "",
                      city: e.target.value,
                      province: prev.deliveryAddress?.province || "",
                      postalCode: prev.deliveryAddress?.postalCode || "",
                    },
                  }))
                }
                className={errors.deliveryCity ? "border-red-500" : ""}
                placeholder="Montréal"
              />
              {errors.deliveryCity && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.deliveryCity}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="province" className="text-xs text-gray-600">
                PROVINCE:
              </Label>
              <Input
                id="province"
                type="text"
                value={formData.deliveryAddress?.province || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryAddress: {
                      ...prev.deliveryAddress,
                      street: prev.deliveryAddress?.street || "",
                      city: prev.deliveryAddress?.city || "",
                      province: e.target.value,
                      postalCode: prev.deliveryAddress?.postalCode || "",
                    },
                  }))
                }
                className={errors.deliveryProvince ? "border-red-500" : ""}
                placeholder="Québec"
              />
              {errors.deliveryProvince && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.deliveryProvince}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="deliveryPostalCode"
                className="text-xs text-gray-600"
              >
                CODE POSTAL:
              </Label>
              <Input
                id="deliveryPostalCode"
                type="text"
                value={formData.deliveryAddress?.postalCode || ""}
                onChange={(e) => {
                  const postalCode = e.target.value.toUpperCase();
                  const zoneInfo = calculateDeliveryFee(postalCode);
                  if (zoneInfo.isValid) {
                    setDeliveryZoneInfo({
                      zoneName: zoneInfo.zoneName,
                      fee: zoneInfo.fee,
                      minimumOrder: zoneInfo.minimumOrder,
                      isValid: true,
                    });
                  } else {
                    setDeliveryZoneInfo(null);
                  }
                  setFormData((prev) => ({
                    ...prev,
                    deliveryAddress: {
                      ...prev.deliveryAddress,
                      street: prev.deliveryAddress?.street || "",
                      city: prev.deliveryAddress?.city || "",
                      province: prev.deliveryAddress?.province || "",
                      postalCode,
                    },
                    deliveryFee: zoneInfo.isValid ? zoneInfo.fee : 0,
                  }));
                }}
                className={errors.deliveryPostalCode ? "border-red-500" : ""}
                placeholder="H1A 1A1"
              />
              {errors.deliveryPostalCode && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.deliveryPostalCode}
                </p>
              )}
              {deliveryZoneInfo && (
                <div
                  className={`text-xs mt-1 p-2 rounded ${
                    deliveryZoneInfo.isValid
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {deliveryZoneInfo.isValid ? (
                    <>
                      <div className="font-semibold">
                        Zone: {deliveryZoneInfo.zoneName}
                      </div>
                      <div>
                        Frais de livraison: {deliveryZoneInfo.fee.toFixed(2)}$
                      </div>
                      <div>
                        Minimum requis:{" "}
                        {deliveryZoneInfo.minimumOrder.toFixed(2)}$
                      </div>
                    </>
                  ) : (
                    <div>Code postal invalide</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== SECTION 4: ADRESSE DE FACTURATION ===== */}
      {/* C'EST ICI QUE TU LA TROUVES !!! */}
      <div className="space-y-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-gray-700 uppercase">
            ADRESSE DE FACTURATION:
          </Label>
          {formData.deliveryAddress && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyDeliveryToBilling}
              className="text-xs text-[#C5A065] hover:text-[#B38F55]"
            >
              <Check className="w-3 h-3 mr-1" />
              Identique à la livraison
            </Button>
          )}
        </div>

        {/* Checkbox "Identique à la livraison" */}
        {formData.deliveryAddress && (
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              id="sameAsDelivery"
              checked={formData.billingAddress?.sameAsDelivery || false}
              onChange={(e) => {
                if (e.target.checked) {
                  copyDeliveryToBilling();
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    billingAddress: {
                      street: "",
                      city: "",
                      province: "",
                      postalCode: "",
                      sameAsDelivery: false,
                    },
                  }));
                }
              }}
              className="rounded border-gray-300 text-[#C5A065] focus:ring-[#C5A065]"
            />
            <Label htmlFor="sameAsDelivery" className="text-sm font-normal">
              Identique à l'adresse de livraison
            </Label>
          </div>
        )}

        {/* Adresses enregistrées pour facturation */}
        {selectedClient &&
          selectedClient.addresses.length > 0 &&
          !formData.billingAddress?.sameAsDelivery && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">
                Adresses de facturation enregistrées:
              </Label>
              <RadioGroup
                value={selectedBillingAddressId?.toString()}
                onValueChange={(value) =>
                  handleBillingAddressSelect(parseInt(value))
                }
                className="space-y-2"
              >
                {selectedClient.addresses.map((address) => (
                  <div
                    key={`billing-${address.id}`}
                    className="flex items-start space-x-2"
                  >
                    <RadioGroupItem
                      value={address.id.toString()}
                      id={`billing-address-${address.id}`}
                    />
                    <Label
                      htmlFor={`billing-address-${address.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      <div>
                        <div>{address.street}</div>
                        <div className="text-xs text-gray-500">
                          {address.city}, {address.province}{" "}
                          {address.postalCode}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="text-xs text-gray-500 mt-2">
                Ou entrez une nouvelle adresse de facturation:
              </div>
            </div>
          )}

        {/* Champs pour nouvelle adresse de facturation */}
        {!formData.billingAddress?.sameAsDelivery && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="billingStreet" className="text-xs text-gray-600">
                RUE:
              </Label>
              <Input
                id="billingStreet"
                type="text"
                value={formData.billingAddress?.street || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    billingAddress: {
                      ...prev.billingAddress,
                      street: e.target.value,
                      city: prev.billingAddress?.city || "",
                      province: prev.billingAddress?.province || "",
                      postalCode: prev.billingAddress?.postalCode || "",
                      sameAsDelivery: false,
                    },
                  }))
                }
                className={errors.billingAddress ? "border-red-500" : ""}
                placeholder="123 Rue Example"
              />
              {errors.billingAddress && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.billingAddress}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="billingCity" className="text-xs text-gray-600">
                VILLE:
              </Label>
              <Input
                id="billingCity"
                type="text"
                value={formData.billingAddress?.city || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    billingAddress: {
                      ...prev.billingAddress,
                      street: prev.billingAddress?.street || "",
                      city: e.target.value,
                      province: prev.billingAddress?.province || "",
                      postalCode: prev.billingAddress?.postalCode || "",
                      sameAsDelivery: false,
                    },
                  }))
                }
                className={errors.billingCity ? "border-red-500" : ""}
                placeholder="Montréal"
              />
              {errors.billingCity && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.billingCity}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="billingProvince"
                className="text-xs text-gray-600"
              >
                PROVINCE:
              </Label>
              <Input
                id="billingProvince"
                type="text"
                value={formData.billingAddress?.province || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    billingAddress: {
                      ...prev.billingAddress,
                      street: prev.billingAddress?.street || "",
                      city: prev.billingAddress?.city || "",
                      province: e.target.value,
                      postalCode: prev.billingAddress?.postalCode || "",
                      sameAsDelivery: false,
                    },
                  }))
                }
                className={errors.billingProvince ? "border-red-500" : ""}
                placeholder="Québec"
              />
              {errors.billingProvince && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.billingProvince}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="billingPostalCode"
                className="text-xs text-gray-600"
              >
                CODE POSTAL:
              </Label>
              <Input
                id="billingPostalCode"
                type="text"
                value={formData.billingAddress?.postalCode || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    billingAddress: {
                      ...prev.billingAddress,
                      street: prev.billingAddress?.street || "",
                      city: prev.billingAddress?.city || "",
                      province: prev.billingAddress?.province || "",
                      postalCode: e.target.value.toUpperCase(),
                      sameAsDelivery: false,
                    },
                  }))
                }
                className={errors.billingPostalCode ? "border-red-500" : ""}
                placeholder="H1A 1A1"
              />
              {errors.billingPostalCode && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.billingPostalCode}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Affichage quand c'est identique */}
        {formData.billingAddress?.sameAsDelivery && formData.deliveryAddress && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-green-800">
                  Adresse de facturation identique à l'adresse de livraison
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {formData.deliveryAddress.street}, {formData.deliveryAddress.city},{" "}
                  {formData.deliveryAddress.province}{" "}
                  {formData.deliveryAddress.postalCode}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Articles */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-600">ARTICLES:</Label>
          <Button
            type="button"
            onClick={addItem}
            variant="ghost"
            size="sm"
            className="text-xs text-amber-600 hover:text-amber-700"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>

        {errors.items && (
          <p className="text-xs text-red-500 mb-2">{errors.items}</p>
        )}

        <div className="border border-gray-300 rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">PRODUIT</TableHead>
                <TableHead className="w-24 text-xs">QTÉ</TableHead>
                <TableHead className="w-28 text-xs">PRIX</TableHead>
                <TableHead className="w-28 text-xs">MONTANT</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.items.map((item, index) => {
                const product = item.productId
                  ? getProductById(item.productId)
                  : null;
                const availableProducts = getAvailableProducts(item.id);
                const quantityError = errors[`item_${index}_quantity`];

                return (
                  <React.Fragment key={item.id}>
                    <TableRow>
                      <TableCell>
                        <Select
                          value={item.productId?.toString() || ""}
                          onValueChange={(value) =>
                            handleProductSelect(item.id, parseInt(value))
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Sélectionner un produit" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name} - ${p.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={product?.minOrderQuantity || 1}
                          max={product?.maxOrderQuantity}
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          disabled={!item.productId}
                          className={`h-8 text-sm ${quantityError ? "border-red-500" : ""}`}
                        />
                        {quantityError && (
                          <p className="text-xs text-red-500 mt-1">
                            {quantityError}
                          </p>
                        )}
                        {errors[`item_${index}_preparation`] && (
                          <p className="text-xs text-orange-600 mt-1 bg-orange-50 p-1 rounded">
                            ⚠️ {errors[`item_${index}_preparation`]}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-700">
                          ${item.unitPrice.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-700">
                          ${item.amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {item.productId && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-gray-50 py-2">
                          <Textarea
                            value={item.notes}
                            onChange={(e) =>
                              handleItemChange(item.id, "notes", e.target.value)
                            }
                            placeholder="Notes pour cet article..."
                            rows={2}
                            className="text-xs"
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {errors.items && (
          <p className="text-xs text-red-500 mt-2">{errors.items}</p>
        )}
      </div>

      {minimumOrderError && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          ⚠️ {minimumOrderError}
        </div>
      )}

      {/* SECTION 6: Notes */}
      <div>
        <Label htmlFor="notes" className="text-xs text-gray-600">
          NOTE:
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
          placeholder="Notes supplémentaires..."
        />
      </div>

      {/* SECTION 7: Totaux */}
      <div className="border-t border-gray-200 pt-4">
        <div className="ml-auto space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">SOUS-TOTAL:</span>
            <span className="font-medium">${formData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">TPS + TVQ (14.975%):</span>
            <span className="font-medium">
              ${formData.taxAmount.toFixed(2)}
            </span>
          </div>
          {formData.deliveryType === "delivery" && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">LIVRAISON:</span>
              <span className="font-medium">
                ${formData.deliveryFee.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-base font-semibold border-t border-gray-300 pt-2">
            <span className="text-gray-800">TOTAL:</span>
            <span className="text-amber-600">${formData.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm bg-amber-50 p-2 rounded">
            <span className="text-gray-700">ACOMPTE (50%):</span>
            <span className="font-medium text-amber-700">
              ${formData.depositAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">BALANCE:</span>
            <span className="font-medium">${formData.balance.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </form>
  );
}