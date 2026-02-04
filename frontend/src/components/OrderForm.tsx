import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
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
import type { Client, Address } from "../types";

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
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  depositAmount: number;
  balance: number;
}

interface OrderFormItem {
  id: string;
  quantity: number;
  description: string;
  unitPrice: number;
  amount: number;
}

const TAX_RATE = 0.14975; // QC tax rate (TPS + TVQ)

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
    items: initialData?.items || [
      { id: "1", quantity: 1, description: "", unitPrice: 0, amount: 0 },
    ],
    notes: initialData?.notes || "",
    pickupLocation: initialData?.pickupLocation || "Laval",
    deliveryType: initialData?.deliveryType || "pickup",
    deliveryAddress: initialData?.deliveryAddress,
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

  // Calculate totals whenever items or delivery fee change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * TAX_RATE;
    const total = subtotal + taxAmount + formData.deliveryFee;
    const depositAmount = total * 0.5; // 50% deposit
    const balance = total - depositAmount;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      taxAmount,
      total,
      depositAmount,
      balance,
    }));
  }, [formData.items, formData.deliveryFee]);

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // When delivery type changes, reset relevant fields and errors
      if (field === "deliveryType") {
        if (value === "pickup") {
          // Clear delivery-specific fields
          updated.deliveryAddress = undefined;
          updated.deliveryFee = 0;
          setSelectedAddressId(null);
        } else if (value === "delivery") {
          // Clear pickup location if switching to delivery
          // Keep it for now as it might be useful for internal tracking
        }
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear related errors when delivery type changes
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
          // Recalculate amount when quantity or unit price changes
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const addItem = () => {
    const newItem: OrderFormItem = {
      id: Date.now().toString(),
      quantity: 1,
      description: "",
      unitPrice: 0,
      amount: 0,
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

  // Filter clients by email search
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

    // Clear address when client changes
    setSelectedAddressId(null);
  };

  const handleEmailChange = (value: string) => {
    setEmailSearch(value);
    setFormData((prev) => ({ ...prev, email: value }));

    // If email doesn't match selected client, clear client selection
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
      if (!formData.deliveryAddress?.postalCode.trim()) {
        newErrors.deliveryPostalCode = "Le code postal est requis";
      }
    }

    const hasValidItem = formData.items.some(
      (item) => item.description.trim() && item.quantity > 0,
    );
    if (!hasValidItem) {
      newErrors.items = "Au moins un article est requis";
    }

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
    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-linear-to-r from-amber-50 to-orange-50 border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {initialData ? "Modifier la commande" : "Nouvelle commande"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel} type="button">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Form Body */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {/* Client Information */}
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

        {/* Pickup/Delivery Options */}
        <div className="pb-4 border-b border-gray-200">
          <div className="mb-4">
            <Label className="text-xs text-gray-600 mb-2">TYPE:</Label>
            <RadioGroup
              value={formData.deliveryType}
              onValueChange={(value) =>
                handleInputChange("deliveryType", value)
              }
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

          {/* Pickup Location - Only for pickup */}
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

        {/* Delivery Address - Only for delivery */}
        {formData.deliveryType === "delivery" && (
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <Label className="text-xs text-gray-600">
              ADRESSE DE LIVRAISON:
            </Label>

            {selectedClient && selectedClient.addresses.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">
                  Adresses enregistrées:
                </Label>
                <RadioGroup
                  value={selectedAddressId?.toString()}
                  onValueChange={(value) =>
                    handleAddressSelect(parseInt(value))
                  }
                  className="space-y-2"
                >
                  {selectedClient.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="flex items-start space-x-2"
                    >
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
                  placeholder="QC"
                />
                {errors.deliveryProvince && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.deliveryProvince}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode" className="text-xs text-gray-600">
                  CODE POSTAL:
                </Label>
                <Input
                  id="postalCode"
                  type="text"
                  value={formData.deliveryAddress?.postalCode || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deliveryAddress: {
                        ...prev.deliveryAddress,
                        street: prev.deliveryAddress?.street || "",
                        city: prev.deliveryAddress?.city || "",
                        province: prev.deliveryAddress?.province || "",
                        postalCode: e.target.value,
                      },
                    }))
                  }
                  className={errors.deliveryPostalCode ? "border-red-500" : ""}
                  placeholder="H2L 3Y5"
                />
                {errors.deliveryPostalCode && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.deliveryPostalCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
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
                  <TableHead className="w-12 text-xs">QTÉ</TableHead>
                  <TableHead className="text-xs">DESCRIPTION</TableHead>
                  <TableHead className="w-28 text-xs">PRIX</TableHead>
                  <TableHead className="w-28 text-xs">MONTANT</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "description",
                            e.target.value,
                          )
                        }
                        className="h-8 text-sm"
                        placeholder="Description de l'article"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-700">
                        ${item.amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Notes */}
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

        {/* Totals */}
        <div className="border-t border-gray-200 pt-4">
          <div className="ml-auto space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">SOUS-TOTAL:</span>
              <span className="font-medium">
                ${formData.subtotal.toFixed(2)}
              </span>
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
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deliveryFee}
                  onChange={(e) =>
                    handleInputChange(
                      "deliveryFee",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-24 h-8 text-sm text-right"
                />
              </div>
            )}
            <div className="flex justify-between items-center text-base font-semibold border-t border-gray-300 pt-2">
              <span className="text-gray-800">TOTAL:</span>
              <span className="text-amber-600">
                ${formData.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm bg-amber-50 p-2 rounded">
              <span className="text-gray-700">ACOMPTE (50%):</span>
              <span className="font-medium text-amber-700">
                ${formData.depositAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">BALANCE:</span>
              <span className="font-medium">
                ${formData.balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer la commande"
          )}
        </Button>
      </div>
    </div>
  );
}
