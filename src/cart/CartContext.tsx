import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "tojtech_cart";

export interface CartItem {
  productUuid: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addItem: (productUuid: string, quantity?: number) => void;
  removeItem: (productUuid: string) => void;
  setQuantity: (productUuid: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item?.productUuid === "string" && typeof item?.quantity === "number",
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(productUuid: string, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productUuid === productUuid);
      if (existing) {
        return prev.map((i) =>
          i.productUuid === productUuid ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { productUuid, quantity }];
    });
  }

  function removeItem(productUuid: string) {
    setItems((prev) => prev.filter((i) => i.productUuid !== productUuid));
  }

  function setQuantity(productUuid: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productUuid);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productUuid === productUuid ? { ...i, quantity } : i)),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, itemCount, addItem, removeItem, setQuantity, clearCart }),
    [items, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
