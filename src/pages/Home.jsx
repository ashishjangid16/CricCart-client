import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/products");

        const fetchedProducts = Array.isArray(res.data) ? res.data : [];

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

  // Get unique categories
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || category === "All" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div className="container py-5">
        {/* Hero Section */}
        <div className="text-center mb-5" style={{ backgroundColor: "#4ade80", padding: "30px", borderRadius: "10px", color: "white" }}>
          <h1 className="display-4 fw-bold">🏪 Welcome to CricCart</h1>
          <p className="lead">Your one-stop shop for the best products</p>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Search & Filter Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🔍 Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat === "All" ? "" : cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Count */}
            <p className="text-muted mb-4">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>

            {/* Products Grid */}
            <div className="row g-4">
              {filteredProducts.map((product) => (
                <div key={product._id} className="col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm" style={{ transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ overflow: "hidden", height: "200px", backgroundColor: "#f0f0f0" }}>
                      <img
                        src={
                          product.imageUrl ||
                          "https://res.cloudinary.com/dipl3qujh/image/upload/v1752663541/Ecommerce/sye8hf3szdgx8rezpy29.png"
                        }
                        className="card-img-top"
                        alt={product.title}
                        style={{ height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title" style={{ minHeight: "50px" }}>
                        {product.title}
                      </h5>
                      <p className="card-text text-muted small">
                        {product.description?.slice(0, 50)}...
                      </p>
                      <div className="mb-2">
                        <span className="badge bg-info me-2">{product.category}</span>
                        {product.stock && product.stock > 0 ? (
                          <span className="badge bg-success">In Stock</span>
                        ) : (
                          <span className="badge bg-danger">Out of Stock</span>
                        )}
                      </div>
                      <p className="fw-bold text-success" style={{ fontSize: "18px" }}>
                        ₹{product.price}
                      </p>
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-success w-100 mt-auto"
                        style={{ backgroundColor: "#4ade80", borderColor: "#4ade80" }}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-5">
                <h4 className="text-muted">No products found</h4>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
