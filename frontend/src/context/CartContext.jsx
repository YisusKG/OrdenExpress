import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (producto) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.iD_Producto === producto.iD_Producto);
      if (existing) {
        return prev.map((p) =>
          p.iD_Producto === producto.iD_Producto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((p) => p.iD_Producto !== id));
  };

  const updateQuantity = (id, cantidad) => {
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((p) => (p.iD_Producto === id ? { ...p, cantidad } : p))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, p) => sum + p.cantidad * p.precio_Venta, 0);
  const count = items.reduce((sum, p) => sum + p.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

