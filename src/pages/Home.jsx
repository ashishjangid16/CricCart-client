import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const goToOrders = () => {
    navigate("/my-orders");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/products");

        const fetchedProducts = Array.isArray(res.data)
          ? res.data
          : [];

        setProducts(fetchedProducts);
        setError("");
      } catch (err) {
        console.error("Product fetch failed:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div
      className="container py-5"
      style={{
        //backgroundImage: "url('/Background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <h1 className="text-2xl font-bold mb-4">Welcome to Our Store!</h1>

      {isLoggedIn && (
        <div className="mb-4 text-end">
          <button
            onClick={goToOrders}
            className="bg-yellow-1000 text-white-300 px-4 py-2 rounded shadow hover:bg-gray-900"
          >
            My Orders
          </button>
        </div>
      )}

      <div className="text-end mb-4">
        <Link to="/cart" className="btn btn-outline-secondary ms-2">
          View Cart 🛒
        </Link>

        {!isLoggedIn ? (
          <Link to="/login" className="btn btn-outline-secondary ms-2">
            Login
          </Link>
        ) : (
          <div className="d-inline-flex align-items-center gap-2 ms-2">
            <img
              src="./profile-icon-design-free-vector.jpg"
              alt="Profile"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
            <button onClick={handleLogout} className="btn btn-outline-danger">
              Logout
            </button>
          </div>
        )}
      </div>

      {loading && <div className="text-center">Loading products...</div>}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      <h2 className="text-center mb-4">All Products</h2>

      <div className="row">
        {products.map((product) => (
          <div key={product._id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <img
                src={
                  product.imageUrl ||
                  "https://res.cloudinary.com/dipl3qujh/image/upload/v1752663541/Ecommerce/sye8hf3szdgx8rezpy29.png"
                }
                className="card-img-top"
                alt={product.title}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">
                  {product.description?.slice(0, 60)}...
                </p>
                <p className="fw-bold text-success">₹{product.price}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="btn btn-primary w-100"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
