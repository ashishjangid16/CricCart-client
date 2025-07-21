import { useCart } from "../context/CartContext";
import axios from "axios";
import { useState } from "react";

function Cart() {
  const { cartItems, increaseQty, decreaseQty, removeFromCart, clearCart } = useCart();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token"); // ✅ get token

      const res = await axios.post(
        "http://localhost:8000/api/orders", // ✅ correct route
        {
          items: cartItems,
          totalAmount: total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send token here
            "Content-Type": "application/json",
          },
        }
      );

      console.log(res.data);
      setOrderSuccess(true);
      clearCart();
    } catch (err) {
  console.error("Order failed:", err.response?.data || err.message);
  alert("Something went wrong while placing the order!");
}
finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Your Cart 🛒</h2>

      {orderSuccess && (
        <div className="alert alert-success text-center">
          ✅ Order placed successfully!
        </div>
      )}

      {cartItems.length === 0 ? (
        <p className="text-center">No items in cart.</p>
      ) : (
        <>
          <div className="text-end mb-3">
            <button className="btn btn-danger" onClick={clearCart}>
              Clear Cart 🗑️
            </button>
          </div>

          <div className="row">
            {cartItems.map((item) => (
              <div key={item._id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <img src={item.image} className="card-img-top" alt={item.title} />
                  <div className="card-body">
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text">{item.description}</p>
                    <p className="fw-bold text-success">₹{item.price}</p>

                    <div className="d-flex align-items-center mb-2">
                      <button onClick={() => decreaseQty(item._id)} className="btn btn-outline-secondary me-2">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQty(item._id)} className="btn btn-outline-secondary ms-2">+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="btn btn-outline-danger w-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-end">
            <h4>Total: ₹{total.toFixed(2)}</h4>
            <button className="btn btn-success mt-2" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? "Placing Order..." : "Place Order 🔐"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
