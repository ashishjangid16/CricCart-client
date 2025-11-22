// src/context/CartContext.js
import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("cartItems");
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      return exists
        ? prev.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { ...product, quantity: 1 }];
    });
    try{
      const token = localStorage.getItem("token")
      const res = await axios.post("http://localhost:8000/api/cart/add",cartItems,{
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send token here
            "Content-Type": "application/json",
          },
        });
    }
    catch(error)
    {
      console.log(error);
    }
  };

  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) =>
    setCartItems((prev) => prev.filter((item) => item._id !== id));

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  ); {/*important*/}
};   


export const useCart = () => useContext(CartContext);
