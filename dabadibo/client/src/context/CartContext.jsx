import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "dabadibo_cart";

const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, quantity = 1) => {
    const productId = product.id;
    const image = Array.isArray(product.images)
      ? product.images[0]
      : product.image;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId);
      if (idx === -1) {
        return [
          ...prev,
          {
            productId,
            name: product.name,
            price: Number(product.price),
            image: image || "",
            quantity: quantity,
          },
        ];
      }
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        quantity: next[idx].quantity + quantity,
      };
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const q = Math.max(1, parseInt(quantity, 10) || 1);
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: q } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartCount = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );

  const cartTotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart داخل CartProvider");
  return ctx;
}
