export const CART_STORAGE_KEY = "techstore_cart";
export const CART_UPDATED_EVENT = "techstore-cart-updated";

export type CartProduct = {
  id: string;
  title: string;
  price: number;
  stock: number;
  image: string;
  categoryName: string;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
};

const EMPTY_CART_ITEMS: CartItem[] = [];
let cachedCartValue: string | null = null;
let cachedCartItems: CartItem[] = EMPTY_CART_ITEMS;

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART_ITEMS;
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
      cachedCartValue = null;
      cachedCartItems = EMPTY_CART_ITEMS;
      return cachedCartItems;
    }

    if (storedCart === cachedCartValue) {
      return cachedCartItems;
    }

    const parsed = JSON.parse(storedCart) as CartItem[];
    if (!Array.isArray(parsed)) {
      cachedCartValue = storedCart;
      cachedCartItems = EMPTY_CART_ITEMS;
      return cachedCartItems;
    }

    cachedCartValue = storedCart;
    cachedCartItems = parsed.filter(isCartItem);
    return cachedCartItems;
  } catch {
    return cachedCartItems;
  }
}

export function addCartItem(product: CartProduct, quantity = 1): CartItem[] {
  const items = getCartItems();
  const existingItem = items.find((item) => item.product.id === product.id);
  const safeQuantity = normalizeQuantity(quantity, product.stock);

  if (existingItem) {
    existingItem.product = product;
    existingItem.quantity = normalizeQuantity(
      existingItem.quantity + safeQuantity,
      product.stock
    );
  } else {
    items.push({ product, quantity: safeQuantity });
  }

  saveCartItems(items);
  return items;
}

export function updateCartItemQuantity(productId: string, quantity: number): CartItem[] {
  const items = getCartItems()
    .map((item) =>
      item.product.id === productId
        ? {
            ...item,
            quantity: normalizeQuantity(quantity, item.product.stock),
          }
        : item
    )
    .filter((item) => item.quantity > 0);

  saveCartItems(items);
  return items;
}

export function removeCartItem(productId: string): CartItem[] {
  const items = getCartItems().filter((item) => item.product.id !== productId);
  saveCartItems(items);
  return items;
}

export function clearCartItems(): CartItem[] {
  saveCartItems([]);
  return [];
}

export function getCartSummary(items: CartItem[]) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return { subtotal, totalQuantity };
}

export function subscribeToCartUpdates(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(CART_UPDATED_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function saveCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  const cartValue = JSON.stringify(items);
  cachedCartValue = cartValue;
  cachedCartItems = items;
  window.localStorage.setItem(CART_STORAGE_KEY, cartValue);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

function normalizeQuantity(quantity: number, stock: number) {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  const maxQuantity = Math.max(1, stock);
  return Math.min(Math.max(0, Math.floor(quantity)), maxQuantity);
}

function isCartItem(value: unknown): value is CartItem {
  const item = value as Partial<CartItem>;
  const product = item.product as Partial<CartProduct> | undefined;

  return (
    !!product &&
    typeof product.id === "string" &&
    typeof product.title === "string" &&
    typeof product.price === "number" &&
    typeof product.stock === "number" &&
    typeof product.image === "string" &&
    typeof product.categoryName === "string" &&
    typeof item.quantity === "number"
  );
}
