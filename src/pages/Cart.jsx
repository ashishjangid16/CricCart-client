import { useCart } from "../context/CartContext";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

function Cart() {
  const { cartItems, increaseQty, decreaseQty, removeFromCart, clearCart } = useCart();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState("");
  const [pincode, setPincode] = useState("");
  const [instructions, setInstructions] = useState("");

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const shippingAddress = {
        name,
        phone,
        address1,
        address2,
        city,
        state: stateField,
        pincode,
        instructions,
      };

      const res = await axios.post(
        "http://localhost:8000/api/orders",
        {
          items: cartItems,
          totalAmount: total,
          shippingAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(res.data);
      setOrderSuccess(true);
      clearCart();
      setShowCheckout(false);

      setName("");
      setPhone("");
      setAddress1("");
      setAddress2("");
      setCity("");
      setStateField("");
      setPincode("");
      setInstructions("");
    } catch (err) {
      console.error("Order failed:", err.response?.data || err.message);
      alert("Something went wrong while placing the order!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", paddingTop: "20px" }}>
      <div className="container py-4">   {/* OPENED HERE */}

        <h2 className="text-center mb-4" style={{ color: "#1a472a", fontSize: "32px" }}>
          🛒 Your Shopping Cart
        </h2>

        {orderSuccess && (
          <div className="alert alert-success text-center">
            ✅ Order placed successfully!
          </div>
        )}

        <div className="mb-3 d-flex justify-content-between align-items-center">
          <div className="w-50">
            <input
              type="text"
              className="form-control"
              placeholder="Search items in cart..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => setShowCheckout((s) => !s)}
            >
              {showCheckout ? "Hide Checkout" : "Checkout"}
            </button>
            <button className="btn btn-danger" onClick={clearCart}>
              Clear Cart 🗑️
            </button>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-center">No items in cart.</p>
        ) : (
          <>
            {/* Cart Items */}
            <div className="row g-4 mb-4">
              {cartItems
                .filter((item) => {
                  if (!searchTerm) return true;
                  const q = searchTerm.toLowerCase();
                  return (
                    item.title?.toLowerCase().includes(q) ||
                    item.description?.toLowerCase().includes(q) ||
                    item.category?.toLowerCase().includes(q)
                  );
                })
                .map((item) => (
                  <div key={item._id} className="col-md-4">
                    <div className="card h-100 shadow-sm">
                      <div style={{ height: "180px", overflow: "hidden", backgroundColor: "#f0f0f0" }}>
                        {(() => {
                          const placeholder = "https://via.placeholder.com/600x400?text=Cricket+Product";
                          const imgSrc = item.image || item.imageUrl || (item.imageUrl && item.imageUrl.secure_url) || placeholder;
                          return (
                            <img
                              src={imgSrc}
                              className="card-img-top"
                              alt={item.title}
                              style={{ height: "100%", objectFit: "cover" }}
                            />
                          );
                        })()}
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{item.title}</h5>
                        <p className="card-text text-muted small">{item.description}</p>
                        <div className="mb-2">
                          <p className="mb-1"><strong>Category:</strong> {item.category || "-"}</p>
                          <p className="mb-1"><strong>Stock:</strong> {item.stock ?? "-"}</p>
                        </div>
                        <p className="fw-bold text-success" style={{ fontSize: "20px" }}>
                          ₹{item.price}
                        </p>

                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="btn-group">
                            <button
                              onClick={() => decreaseQty(item._id)}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              −
                            </button>
                            <span className="btn btn-light btn-sm">{item.quantity}</span>
                            <button
                              onClick={() => increaseQty(item._id)}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              +
                            </button>
                          </div>
                          <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="btn btn-outline-danger w-100 btn-sm mt-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Order Summary & Checkout */}
            <div className="row">
              <div className="col-md-8"></div>
              <div className="col-md-4">
                <div className="card shadow" style={{ backgroundColor: "#f0fdf4", borderColor: "#4ade80" }}>
                  <div className="card-body">
                    <h5 className="card-title" style={{ color: "#1a472a" }}>
                      Order Summary
                    </h5>
                    <hr />
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span className="text-success">Free</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Discount:</span>
                      <span>₹0.00</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold" style={{ fontSize: "18px" }}>
                      <span>Total:</span>
                      <span style={{ color: "#4ade80" }}>₹{total.toFixed(2)}</span>
                    </div>

                    {showCheckout && (
                      <form onSubmit={handlePlaceOrder} className="mt-4">
                        <h6 className="mb-3">Delivery Address</h6>

                        <div className="mb-2">
                          <input
                            required
                            className="form-control form-control-sm"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>

                        <div className="mb-2">
                          <input
                            required
                            className="form-control form-control-sm"
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>

                        <div className="mb-2">
                          <input
                            required
                            className="form-control form-control-sm"
                            placeholder="Address line 1"
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                          />
                        </div>

                        <div className="mb-2">
                          <input
                            className="form-control form-control-sm"
                            placeholder="Address line 2 (optional)"
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                          />
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-6">
                            <input
                              required
                              className="form-control form-control-sm"
                              placeholder="City"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                            />
                          </div>
                          <div className="col-6">
                            <input
                              required
                              className="form-control form-control-sm"
                              placeholder="State"
                              value={stateField}
                              onChange={(e) => setStateField(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="mb-2">
                          <input
                            required
                            className="form-control form-control-sm"
                            placeholder="Pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <textarea
                            className="form-control form-control-sm"
                            placeholder="Delivery instructions (optional)"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows="2"
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn w-100"
                          style={{ backgroundColor: "#4ade80", color: "white", fontWeight: "bold" }}
                          disabled={loading}
                        >
                          {loading ? "⏳ Placing Order..." : "✅ Place Order"}
                        </button>
                      </form>
                    )}

                    {!showCheckout && (
                      <button
                        className="btn w-100 mt-3"
                        style={{ backgroundColor: "#4ade80", color: "white", fontWeight: "bold" }}
                        onClick={() => setShowCheckout(true)}
                        disabled={loading}
                      >
                        🔐 Proceed to Checkout
                      </button>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>  
    </div>
  );
}

export default Cart;
