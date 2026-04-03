import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem('carrito');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (p) => {
    setCarrito(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, cantidad: i.cantidad + 1} : i);
      return [...prev, {...p, cantidad: 1}];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(i => i.id !== id));
  };

const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) return;
    setCarrito(prev => prev.map(i => i.id === id ? {...i, cantidad} : i));
};

  const limpiarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem('carrito');
  };

  const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, limpiarCarrito, actualizarCantidad, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);