/**
 * Delivery Zones Configuration for Marius et Fanny
 * Based on postal codes in the Montreal/Laval region
 */

export interface DeliveryZone {
  name: string;
  postalCodes: string[];
  deliveryFee: number;
  minimumOrder: number;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    name: "Zone 1",
    postalCodes: ["H7X", "H7Y"],
    deliveryFee: 15.0,
    minimumOrder: 50.0,
  },
  {
    name: "Zone 2",
    postalCodes: ["H7R", "H7P", "H7T", "H7W", "H7V"],
    deliveryFee: 25.0,
    minimumOrder: 100.0,
  },
  {
    name: "Zone 3",
    postalCodes: ["H7L", "H7M", "H7S", "H7G", "H7N", "J7P", "J7G"],
    deliveryFee: 30.0,
    minimumOrder: 125.0,
  },
  {
    name: "Zone 4",
    postalCodes: [
      "H8Z",
      "H8Y",
      "H9B",
      "H4S",
      "H4Y",
      "H9P",
      "H8T",
      "H8S",
      "H4T",
      "H4M",
      "H4R",
      "H4K",
      "H4J",
      "H4L",
      "J7A",
      "J7E",
      "J7H",
      "J7R",
    ],
    deliveryFee: 30.0,
    minimumOrder: 200.0,
  },
  {
    name: "Zone 5",
    postalCodes: [
      "H2L",
      "H2J",
      "H2T",
      "H2W",
      "H2X",
      "H2Y",
      "H2K",
      "H2H",
      "H2Z",
      "J7C",
      "J7B",
      "J6Z",
    ],
    deliveryFee: 40.0,
    minimumOrder: 200.0,
  },
  {
    name: "Hors Zone",
    postalCodes: [
      "H9K",
      "H9J",
      "H9W",
      "H3M",
      "H4N",
      "H3L",
      "H2C",
      "H2B",
      "H2M",
      "H1Z",
      "H2N",
      "H2P",
      "H2R",
      "H2E",
      "H2A",
      "H3P",
      "H3N",
      "H2S",
      "H2G",
      "H1Y",
      "H1W",
      "H3R",
      "H3S",
      "H2V",
      "H3T",
      "H3W",
      "H4P",
      "H3X",
      "H3Y",
      "H3V",
      "H3H",
      "H3G",
      "H3A",
      "H3B",
      "H3C",
      "H3J",
      "H3K",
      "H3Z",
      "H4C",
      "H4E",
      "H4G",
      "H4H",
      "H8N",
      "H8P",
      "H8R",
      "H4A",
      "H4B",
      "H4X",
      "H4V",
      "H4W",
      "H7H",
      "H7B",
      "H7E",
      "H7C",
    ],
    deliveryFee: 40.0,
    minimumOrder: 400.0,
  },
];

/**
 * Extract the first 3 characters from a postal code (e.g., "H7X 1A1" => "H7X")
 */
export function normalizePostalCode(postalCode: string): string {
  return postalCode.replace(/\s/g, "").toUpperCase().substring(0, 3);
}

/**
 * Find the delivery zone for a given postal code
 */
export function findDeliveryZone(
  postalCode: string,
): DeliveryZone | undefined {
  const normalized = normalizePostalCode(postalCode);
  return DELIVERY_ZONES.find((zone) =>
    zone.postalCodes.includes(normalized),
  );
}

/**
 * Calculate delivery fee based on postal code
 * Returns an object with fee, minimum order, and zone info
 */
export function calculateDeliveryFee(postalCode: string): {
  fee: number;
  minimumOrder: number;
  zoneName: string;
  isValid: boolean;
} {
  const zone = findDeliveryZone(postalCode);

  if (!zone) {
    return {
      fee: 0,
      minimumOrder: 0,
      zoneName: "Zone non trouvée",
      isValid: false,
    };
  }

  return {
    fee: zone.deliveryFee,
    minimumOrder: zone.minimumOrder,
    zoneName: zone.name,
    isValid: true,
  };
}

/**
 * Validate if the subtotal meets the minimum order requirement for the postal code
 */
export function validateMinimumOrder(
  postalCode: string,
  subtotal: number,
): {
  isValid: boolean;
  minimumOrder: number;
  postalCode: string;
  shortfall: number;
} {
  const deliveryInfo = calculateDeliveryFee(postalCode);

  if (!deliveryInfo.isValid) {
    return {
      isValid: false,
      minimumOrder: 0,
      postalCode: postalCode,
      shortfall: 0,
    };
  }

  const shortfall = Math.max(0, deliveryInfo.minimumOrder - subtotal);

  return {
    isValid: subtotal >= deliveryInfo.minimumOrder,
    minimumOrder: deliveryInfo.minimumOrder,
    postalCode: postalCode,
    shortfall,
  };
}

/**
 * Get all zones information for API responses
 */
export function getAllDeliveryZones(): DeliveryZone[] {
  return DELIVERY_ZONES;
}
