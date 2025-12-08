import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Header() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-dark" style={{ backgroundColor: "#1a472a" }}>
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold" style={{ fontSize: "24px", color: "#4ade80 !important" }}>
          🏏 CricCart
        </Link>

        <div className="d-flex align-items-center gap-2">
          <Link to="/" className="btn btn-outline-light btn-sm">
            🏠 Home
          </Link>

          <Link to="/cart" className="btn btn-outline-light btn-sm position-relative">
            🛒 Cart
            {cartItems.length > 0 && (
              <span className="badge bg-danger ms-2 position-absolute top-0 start-100 translate-middle">
                {cartItems.length}
              </span>
            )}
          </Link>

          {token ? (
            <>
              <Link to="/my-orders" className="btn btn-outline-light btn-sm">
                📦 My Orders
              </Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                🚪 Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-success btn-sm">
              🔐 Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
