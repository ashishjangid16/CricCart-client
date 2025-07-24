import { useEffect, useState } from "react";
import axios from "axios";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/orders/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="mb-6 border p-4 rounded shadow">
            <div className="mb-2">
              <span className="font-semibold">Order ID:</span> {order._id}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Status:</span> {order.status}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Total:</span> ₹{order.totalAmount}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleString()}
            </div>
            <div className="mt-2">
              <h2 className="font-semibold mb-1">Items:</h2>
              <ul className="pl-4 list-disc">
                {order.products.map((item, i) => (
                  <li key={i}>
                    {item.productId?.title || "Product"} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
