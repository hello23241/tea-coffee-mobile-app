import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load giỏ hàng từ AsyncStorage khi vừa mở app
  useEffect(() => {
    (async () => {
      try {
        const savedCart = await AsyncStorage.getItem('@cart_data');
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Lỗi đọc giỏ hàng:', e);
      }
    })();
  }, []);

  // Lưu giỏ hàng mỗi khi mảng cart thay đổi
  const saveCartToStorage = async (newCart) => {
    try {
      await AsyncStorage.setItem('@cart_data', JSON.stringify(newCart));
    } catch (e) {
      console.error('Lỗi lưu giỏ hàng:', e);
    }
  };

  const addToCart = (item) => {
    // Tạo key phân biệt theo ID món + size + topping đã chọn
    const toppingKeys = (item.toppings || []).map(t => t.id).sort().join('_');
    const itemKey = `${item.id}_${item.size.id}_${toppingKeys}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(i => i.customKey === itemKey);
      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += item.quantity;
      } else {
        updatedCart = [...prevCart, { ...item, customKey: itemKey }];
      }
      saveCartToStorage(updatedCart);
      return updatedCart;
    });
  };

  const updateQuantity = (customKey, delta) => {
    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((item) => {
          if (item.customKey === customKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
      saveCartToStorage(updatedCart);
      return updatedCart;
    });
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem('@cart_data');
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, totalAmount, totalItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);