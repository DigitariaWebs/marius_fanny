/**
 * Cart Persistence Utility
 * Manages cart storage that persists across page reloads but clears when browser closes
 */

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  preparationTimeHours?: number;
}

const CART_STORAGE_KEY = 'marius_fanny_cart';

/**
 * Save cart to localStorage
 */
export const saveCart = (items: CartItem[]): void => {
  try {
    console.log('💾 [PERSISTENCE] Saving cart:', items);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    console.log('✅ [PERSISTENCE] Cart saved to localStorage');
  } catch (error) {
    console.error('❌ [PERSISTENCE] Failed to save cart:', error);
  }
};

/**
 * Load cart from localStorage
 */
export const loadCart = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    console.log('📖 [PERSISTENCE] Raw localStorage data:', savedCart);
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      console.log('✅ [PERSISTENCE] Loaded cart from localStorage:', parsed);
      return parsed;
    }
    console.log('ℹ️ [PERSISTENCE] No cart found in localStorage');
  } catch (error) {
    console.error('❌ [PERSISTENCE] Failed to load cart:', error);
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

/**
 * Initialize cart session (deprecated - cart now persists across reloads)
 * @deprecated Use loadCart() directly instead
 */
export const initializeCartSession = (): void => {
  // Cart now persists across page reloads by default
  // Only clears when browser is closed (localStorage behavior)
};
