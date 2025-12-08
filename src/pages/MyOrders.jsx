import { useEffect, useState } from "react";
import axios from "axios";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/orders/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "#ffc107";
      case "Confirmed": return "#17a2b8";
      case "Shipped": return "#007bff";
      case "Delivered": return "#28a745";
      case "Cancelled": return "#dc3545";
      default: return "#6c757d";
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", paddingTop: "20px" }}>
      <div className="container py-4">
        <h2 className="text-center mb-4" style={{ color: "#1a472a", fontSize: "32px" }}>
          📦 My Orders
        </h2>

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-5">
            <h4 style={{ color: "#666" }}>No orders yet</h4>
            <p className="text-muted">You haven't placed any orders. Start shopping!</p>
          </div>
        ) : (
          <div className="row g-3">
            {orders.map((order) => (
              <div key={order._id} className="col-12">
                <div className="card shadow-sm">
                  <div
                    className="card-header"
                    style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6", cursor: "pointer" }}
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  >
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <div className="fw-bold">Order #{order._id.slice(-8)}</div>
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="col-md-3">
                        <div className="text-muted">Items: {order.items?.length || 0}</div>
                      </div>
                      <div className="col-md-3">
                        <div className="fw-bold">₹{order.totalAmount?.toFixed(2) || "0.00"}</div>
                      </div>
                      <div className="col-md-3 text-end">
                        <span
                          className="badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order._id && (
                    <div className="card-body">
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <h6 style={{ color: "#1a472a" }}>Delivery Address</h6>
                          <p className="mb-1">
                            <strong>{order.shippingAddress?.name}</strong>
                          </p>
                          <p className="mb-1 text-muted">{order.shippingAddress?.phone}</p>
                          <p className="mb-1 text-muted">{order.shippingAddress?.address1}</p>
                          {order.shippingAddress?.address2 && (
                            <p className="mb-1 text-muted">{order.shippingAddress?.address2}</p>
                          )}
                          <p className="mb-1 text-muted">
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                          </p>
                          {order.shippingAddress?.instructions && (
                            <p className="text-muted small mt-2 fst-italic">
                              📝 {order.shippingAddress?.instructions}
                            </p>
                          )}
                        </div>
                        <div className="col-md-6">
                          <h6 style={{ color: "#1a472a" }}>Order Summary</h6>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>₹{order.totalAmount?.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Shipping:</span>
                            <span className="text-success">Free</span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span>₹{order.totalAmount?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <h6 style={{ color: "#1a472a" }} className="mb-3">
                        Order Items
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Product</th>
                              <th>Price</th>
                              <th>Qty</th>
                              <th className="text-end">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.title}</td>
                                <td>₹{item.price?.toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td className="text-end">₹{(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
