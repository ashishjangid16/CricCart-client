import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";

function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I can help you find the right cricket gear, accessories, and best deals.",
    },
  ]);
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

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const q = (searchTerm || "").trim().toLowerCase();

    const matchesSearch =
      !q ||
      product.title?.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q);

    const matchesCategory = !category || category === "All" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const sendAssistantMessage = async () => {
    const trimmedMessage = assistantInput.trim();
    if (!trimmedMessage || assistantLoading) return;

    const userMessage = { sender: "user", text: trimmedMessage };
    setChatMessages((prev) => [...prev, userMessage]);
    setAssistantInput("");
    setAssistantLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/assistant/chat", {
        message: trimmedMessage,
        conversationHistory: chatMessages.slice(-20).map((entry) => ({
          role: entry.sender === "bot" ? "assistant" : "user",
          text: entry.text,
        })),
      });

      const reply = response?.data?.reply || "I’m sorry, I couldn’t answer that right now.";
      setChatMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      const backendError = err?.response?.data?.error;
      const detailedError =
        typeof backendError === "string"
          ? backendError
          : typeof backendMessage === "string"
            ? backendMessage
            : "";

      let userMessage =
        "I’m having trouble connecting to the AI service. Please try again in a moment.";

      if (detailedError.includes("API_KEY_SERVICE_BLOCKED") || detailedError.includes("PERMISSION_DENIED")) {
        userMessage =
          "The Gemini API key is blocked or disabled in Google Cloud. Please enable the Generative Language API and use a valid key in the backend .env file.";
      } else if (backendMessage) {
        userMessage = backendMessage;
      }

      setChatMessages((prev) => [...prev, { sender: "bot", text: userMessage }]);
      console.error("Assistant chat failed:", err);
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleAssistantSubmit = (event) => {
    event.preventDefault();
    sendAssistantMessage();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div className="container py-5">
        <div
          className="text-center mb-5"
          style={{ backgroundColor: "#4ade80", padding: "30px", borderRadius: "10px", color: "white" }}
        >
          <h1 className="display-4 fw-bold">🏏 Welcome to CricCart</h1>
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

            <p className="text-muted mb-4">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>

            <div className="row g-4">
              {filteredProducts.map((product) => (
                <div key={product._id} className="col-md-4 col-lg-3">
                  <div
                    className="card h-100 shadow-sm"
                    style={{ transition: "transform 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <div style={{ overflow: "hidden", height: "200px", backgroundColor: "#f0f0f0" }}>
                      {(() => {
                        const placeholder = "https://via.placeholder.com/600x400?text=Cricket+Product";
                        const imgSrc =
                          product.imageUrl ||
                          product.image ||
                          (product.imageUrl && product.imageUrl.secure_url) ||
                          placeholder;

                        return (
                          <img
                            src={imgSrc}
                            className="card-img-top"
                            alt={product.title}
                            style={{ height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://via.placeholder.com/600x400?text=No+Image";
                            }}
                          />
                        );
                      })()}
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
                          <span className="badge bg-success">In stock: {product.stock}</span>
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
                        disabled={!product.stock || product.stock < 1}
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

      <div style={{ position: "fixed", right: "20px", bottom: "20px", zIndex: 1000 }}>
        {!assistantOpen ? (
          <button
            type="button"
            className="btn btn-primary rounded-pill shadow"
            style={{ backgroundColor: "#2563eb", borderColor: "#2563eb", padding: "12px 18px" }}
            onClick={() => setAssistantOpen(true)}
          >
            🤖 AI Assistant
          </button>
        ) : (
          <div
            className="shadow-lg"
            style={{
              width: "360px",
              background: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-between"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", padding: "12px 16px" }}
            >
              <strong>AI Shopping Assistant</strong>
              <button
                type="button"
                className="btn btn-link text-white p-0"
                onClick={() => setAssistantOpen(false)}
                aria-label="Close assistant"
              >
                ✕
              </button>
            </div>

            <div style={{ height: "280px", overflowY: "auto", padding: "12px", backgroundColor: "#f8fafc" }}>
              {chatMessages.map((message, index) => (
                <div
                  key={`${message.sender}-${index}`}
                  className="mb-2 d-flex"
                  style={{ justifyContent: message.sender === "user" ? "flex-end" : "flex-start" }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      backgroundColor: message.sender === "user" ? "#2563eb" : "#e2e8f0",
                      color: message.sender === "user" ? "#fff" : "#0f172a",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {assistantLoading && (
                <div className="d-flex justify-content-start mb-2">
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      backgroundColor: "#e2e8f0",
                      color: "#0f172a",
                    }}
                  >
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAssistantSubmit} style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask for product suggestions..."
                  disabled={assistantLoading}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={assistantLoading || !assistantInput.trim()}
                  style={{ backgroundColor: "#2563eb", borderColor: "#2563eb" }}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
