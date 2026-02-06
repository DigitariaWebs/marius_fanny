/**
 * Cart Persistence Utility
 * Manages cart storage that persists across tabs but clears when browser closes
 */

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'marius_fanny_cart';
const SESSION_MARKER_KEY = 'marius_fanny_session';

/**
 * Initialize cart session
 * Clears cart if this is a new browser session
 */
export const initializeCartSession = (): void => {
  // Check if this is a new browser session
  const hasSession = sessionStorage.getItem(SESSION_MARKER_KEY);
  
  if (!hasSession) {
    // New browser session - clear old cart
    localStorage.removeItem(CART_STORAGE_KEY);
    // Mark this session
    sessionStorage.setItem(SESSION_MARKER_KEY, 'active');
  }
};

/**
 * Save cart to localStorage
 */
export const saveCart = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
};

/**
 * Load cart from localStorage
 */
export const loadCart = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Failed to load cart:', error);
  }
  return [];
};

/**
 * Clear cart from storage
 */
export const clearCart = (): void => {
  localStorage.removeItem(CART_STORAGE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart:updated"));
  }
};

/**
 * Get cart item count
 */
export const getCartCount = (): number => {
  const cart = loadCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};
