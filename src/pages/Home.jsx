import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import "./Home.css";

const getCategoryIcon = (category) => {
  const name = String(category).toLowerCase();
  if (name.includes("bat")) return "🏏";
  if (name.includes("glove")) return "🧤";
  if (name.includes("helmet")) return "🪖";
  if (name.includes("ball")) return "🥎";
  if (name.includes("shoe")) return "👟";
  if (name.includes("pad")) return "🦵";
  if (name.includes("gaurd")) return "🛡️";
  return "🏏";
};

function ProductCard({ product, onAddToCart, featured = false }) {
  const imageUrl =
    product.imageUrl?.secure_url ||
    product.imageUrl ||
    product.image ||
    "https://via.placeholder.com/600x400?text=Cricket+Product";
  const inStock = Number(product.stock) > 0;

  return (
    <article className={`cc-product-card${featured ? " cc-product-card-featured" : ""}`}>
      <div className="cc-product-image-wrap">
        <img
          className="cc-product-image"
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "https://via.placeholder.com/600x400?text=No+Image";
          }}
        />
        <span className="cc-product-category">{product.category}</span>
      </div>
      <div className="cc-product-info">
        <h3>{product.title}</h3>
        {!featured && <p>{product.description?.slice(0, 90) || "Cricket gear for your next innings."}</p>}
        <div className="cc-product-meta">
          <strong>₹{product.price}</strong>
          <span className={inStock ? "cc-stock-in" : "cc-stock-out"}>
            {inStock ? `${product.stock} in stock` : "Sold out"}
          </span>
        </div>
        <button type="button" onClick={() => onAddToCart(product)} disabled={!inStock}>
          {inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </article>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const hasLoadedProducts = useRef(false);

  // Search and category filters
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // AI Assistant
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


  /* =========================================================
     FETCH PRODUCTS
     ========================================================= */

  useEffect(() => {
    let isCurrentRequest = true;
    if (!hasLoadedProducts.current) setLoading(true);

    const timeoutId = setTimeout(async () => {
      const params = new URLSearchParams({ page: String(currentPage) });
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (category) params.set("category", category);

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products?${params.toString()}`
        );
        if (!isCurrentRequest) return;

        setProducts(Array.isArray(response.data.products) ? response.data.products : []);
        const categoryProducts =
          Array.isArray(response.data.featuredProducts)
            ? response.data.featuredProducts
            : response.data.products?.slice(0, 4) || [];
        const mrfBat = response.data.heroProduct;
        setFeaturedProducts(
          mrfBat
            ? [mrfBat, ...categoryProducts.filter((product) => product.category !== mrfBat.category)]
            : categoryProducts,
        );
        setHeroIndex(0);
        setTotalPages(response.data.totalPages || 1);
        setTotalProducts(response.data.totalProducts || 0);
        setCategoryOptions(Array.isArray(response.data.categories) ? response.data.categories : []);
        setError("");
      } catch (requestError) {
        if (!isCurrentRequest) return;
        console.error("Product fetch failed:", requestError);
        setError("Failed to load products");
      } finally {
        if (isCurrentRequest) {
          hasLoadedProducts.current = true;
          setLoading(false);
        }
      }
    }, searchTerm.trim() ? 500 : 0);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeoutId);
    };
  }, [currentPage, searchTerm, category]);

  useEffect(() => {
    if (featuredProducts.length < 2 || heroPaused) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const rotationTimer = setInterval(() => {
      setHeroIndex((index) => (index + 1) % featuredProducts.length);
    }, 6000);

    return () => clearInterval(rotationTimer);
  }, [featuredProducts.length, heroPaused]);


  /* =========================================================
     CATEGORIES
     ========================================================= */

  const categoryOrder = ["Bats", "Gloves", "Helmets", "Balls", "Cricket Shoes", "Shoes", "Pads"];
  const displayCategories = [...categoryOptions].sort((left, right) => {
    const leftIndex = categoryOrder.indexOf(left);
    const rightIndex = categoryOrder.indexOf(right);
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
  const categories = ["All", ...categoryOptions];
  const selectedHeroProduct = featuredProducts[heroIndex] || products[0];

  const moveHero = (direction) => {
    setHeroIndex((index) =>
      (index + direction + featuredProducts.length) % featuredProducts.length,
    );
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setCurrentPage(1);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };


  /* =========================================================
     SEARCH + CATEGORY FILTER
     ========================================================= */

  const filteredProducts = products;


  /* =========================================================
     AI ASSISTANT
     ========================================================= */

  const sendAssistantMessage = async () => {
    const trimmedMessage = assistantInput.trim();

    if (!trimmedMessage || assistantLoading) return;

    const userMessage = {
      sender: "user",
      text: trimmedMessage,
    };

    setChatMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setAssistantInput("");
    setAssistantLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/assistant/chat`,
        {
          message: trimmedMessage,

          conversationHistory: chatMessages
            .slice(-20)
            .map((entry) => ({
              role:
                entry.sender === "bot"
                  ? "assistant"
                  : "user",
              text: entry.text,
            })),
        }
      );

      const reply =
        response?.data?.reply ||
        "I’m sorry, I couldn’t answer that right now.";

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: reply,
        },
      ]);
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message;

      const backendError =
        err?.response?.data?.error;

      const detailedError =
        typeof backendError === "string"
          ? backendError
          : typeof backendMessage === "string"
            ? backendMessage
            : "";

      let userMessage =
        "I’m having trouble connecting to the AI service. Please try again in a moment.";

      if (
        detailedError.includes(
          "API_KEY_SERVICE_BLOCKED"
        ) ||
        detailedError.includes(
          "PERMISSION_DENIED"
        )
      ) {
        userMessage =
          "The Gemini API key is blocked or disabled in Google Cloud. Please enable the Generative Language API and use a valid key in the backend .env file.";
      } else if (backendMessage) {
        userMessage = backendMessage;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: userMessage,
        },
      ]);

      console.error(
        "Assistant chat failed:",
        err
      );
    } finally {
      setAssistantLoading(false);
    }
  };


  const handleAssistantSubmit = (event) => {
    event.preventDefault();
    sendAssistantMessage();
  };


  /* =========================================================
     UI
     ========================================================= */

  return (
    <main className="cc-home">
      <div className="cc-home-shell">
        {selectedHeroProduct && (
          <section className="cc-hero" aria-label="Featured cricket products" aria-roledescription="carousel">
            <div className="cc-hero-copy" key={`copy-${selectedHeroProduct._id}`}>
              <p className="cc-eyebrow">Featured {selectedHeroProduct.category}</p>
              <h1>{selectedHeroProduct.title}</h1>
              <p>{selectedHeroProduct.description || "Find the right equipment for your next innings."}</p>
              <p className="cc-hero-price">Featured pick <strong>₹{selectedHeroProduct.price?.toLocaleString("en-IN")}</strong></p>
              <div className="cc-hero-actions">
                <a href="#products">Shop now</a>
                <a className="cc-hero-secondary" href="#categories">Explore gear</a>
              </div>
            </div>
            <div className="cc-hero-media" key={`media-${selectedHeroProduct._id}`}>
              <img
                src={selectedHeroProduct.imageUrl?.secure_url || selectedHeroProduct.imageUrl || selectedHeroProduct.image}
                alt={selectedHeroProduct.title}
                fetchPriority="high"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "https://via.placeholder.com/900x700?text=CricCart+Gear";
                }}
              />
              {featuredProducts.length > 1 && (
                <div className="cc-hero-controls" aria-label="Featured product controls">
                  <button type="button" onClick={() => moveHero(-1)} aria-label="Previous featured product">‹</button>
                  <span>{String(heroIndex + 1).padStart(2, "0")} / {String(featuredProducts.length).padStart(2, "0")}</span>
                  <button
                    type="button"
                    onClick={() => setHeroPaused((paused) => !paused)}
                    aria-label={heroPaused ? "Resume product rotation" : "Pause product rotation"}
                    title={heroPaused ? "Resume rotation" : "Pause rotation"}
                  >
                    {heroPaused ? "▶" : "Ⅱ"}
                  </button>
                  <button type="button" onClick={() => moveHero(1)} aria-label="Next featured product">›</button>
                </div>
              )}
            </div>
          </section>
        )}


        {/* LOADING */}

        {loading && (
          <div className="text-center py-5">
            <div
              className="spinner-border text-success"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="mt-2">
              Loading products...
            </p>
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div
            className="alert alert-danger text-center"
            role="alert"
          >
            {error}
          </div>
        )}


        {!loading && (
          <>

            <section className="cc-home-section" id="categories">
              <div className="cc-section-heading">
                <div>
                  <h2>Shop by category</h2>
                  <p>Choose your gear and find the right fit for your game.</p>
                </div>
              </div>
              <div className="cc-category-grid">
                {displayCategories.slice(0, 6).map((item) => (
                  <button
                    type="button"
                    className="cc-category-tile"
                    key={item}
                    onClick={() => selectCategory(item)}
                  >
                    <span className="cc-category-icon" aria-hidden="true">{getCategoryIcon(item)}</span>
                    <strong>{item.replace(/^Cricket\s+/i, "")}</strong>
                  </button>
                ))}
              </div>
            </section>

            <section className="cc-home-section cc-assistant-panel">
              <div className="cc-assistant-copy">
                <span className="cc-assistant-icon" aria-hidden="true">🤖</span>
                <div>
                  <p className="cc-eyebrow">Need a hand choosing?</p>
                  <h2>AI shopping assistant</h2>
                  <p>Tell us what you play and what you need. We’ll help find the right gear.</p>
                </div>
              </div>
              <button type="button" onClick={() => setAssistantOpen(true)}>Ask the assistant</button>
            </section>

            {featuredProducts.length > 0 && (
              <section className="cc-home-section">
                <div className="cc-section-heading">
                  <div>
                    <h2>Trending products</h2>
                    <p>Popular picks from the CricCart catalogue.</p>
                  </div>
                  <a href="#products" className="text-decoration-none">View all products</a>
                </div>
                <div className="cc-product-grid">
                  {featuredProducts.map((product) => (
                    <ProductCard key={`featured-${product._id}`} product={product} onAddToCart={addToCart} featured />
                  ))}
                </div>
              </section>
            )}

            <section className="cc-home-section cc-catalogue" id="products">
              <div className="cc-section-heading">
                <div>
                  <p className="cc-eyebrow">Build your kit</p>
                  <h2>All products</h2>
                </div>
                <span className="text-muted">{totalProducts} items</span>
              </div>

              <div className="cc-catalogue-tools">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search products..."
                      aria-label="Search products"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    <select
                      className="form-select"
                      value={category}
                      aria-label="Filter by category"
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      {categories.map((cat) => (
                        <option
                          key={cat}
                          value={cat === "All" ? "" : cat}
                        >
                          {cat}
                        </option>
                      ))}
                    </select>

              </div>
              <div className="text-muted small mb-3" aria-live="polite">
                Showing {totalProducts} product{totalProducts === 1 ? "" : "s"}
              </div>
              <div className="cc-product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
                ))}
            </div>


            {/* NO PRODUCTS */}

            {filteredProducts.length === 0 && (
              <div className="text-center py-5">

                <h4 className="text-muted">
                  No products found
                </h4>

                <p>
                  Try adjusting your search
                  or filters
                </p>

              </div>
            )}


            {/* =================================================
                PAGINATION BUTTONS
            ================================================= */}

            {filteredProducts.length > 0 &&
              totalPages > 1 && (
                <div className="cc-pagination">

                  {/* PREVIOUS */}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        currentPage - 1
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                  >
                    ← Previous
                  </button>


                  {/* PAGE NUMBER */}

                  <span className="fw-bold">
                    Page {currentPage} of{" "}
                    {totalPages}
                  </span>


                  {/* NEXT */}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        currentPage + 1
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                  >
                    Next →
                  </button>

                </div>
              )}

            </section>
          </>
        )}

      </div>


      {/* =====================================================
          AI ASSISTANT
      ===================================================== */}

      <div className="cc-chat-launcher">

        {!assistantOpen ? (

          <button
            type="button"
            className="btn btn-primary rounded-pill shadow"
            style={{
              backgroundColor: "#2563eb",
              borderColor: "#2563eb",
              padding: "12px 18px",
            }}
            onClick={() =>
              setAssistantOpen(true)
            }
          >
            🤖 AI Assistant
          </button>

        ) : (

          <div className="cc-chat-window">

            {/* ASSISTANT HEADER */}

            <div className="cc-chat-header">

              <strong>
                AI Shopping Assistant
              </strong>

              <button
                type="button"
                className="btn btn-link text-white p-0"
                onClick={() =>
                  setAssistantOpen(false)
                }
                aria-label="Close assistant"
              >
                ✕
              </button>

            </div>


            {/* CHAT MESSAGES */}

            <div
              style={{
                height: "280px",
                overflowY: "auto",
                padding: "12px",
                backgroundColor:
                  "#f8fafc",
              }}
            >

              {chatMessages.map(
                (message, index) => (

                  <div
                    key={`${message.sender}-${index}`}
                    className="mb-2 d-flex"
                    style={{
                      justifyContent:
                        message.sender ===
                        "user"
                          ? "flex-end"
                          : "flex-start",
                    }}
                  >

                    <div
                      style={{
                        maxWidth: "85%",
                        padding:
                          "10px 12px",
                        borderRadius:
                          "12px",
                        backgroundColor:
                          message.sender ===
                          "user"
                            ? "#2563eb"
                            : "#e2e8f0",
                        color:
                          message.sender ===
                          "user"
                            ? "#fff"
                            : "#0f172a",
                        whiteSpace:
                          "pre-line",
                      }}
                    >
                      {message.text}
                    </div>

                  </div>

                )
              )}


              {assistantLoading && (
                <div className="d-flex justify-content-start mb-2">

                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      backgroundColor:
                        "#e2e8f0",
                      color: "#0f172a",
                    }}
                  >
                    Thinking...
                  </div>

                </div>
              )}

            </div>


            {/* CHAT INPUT */}

            <form
              onSubmit={
                handleAssistantSubmit
              }
              style={{
                padding: "12px",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            >

              <div className="input-group">

                <input
                  type="text"
                  className="form-control"
                  value={assistantInput}
                  onChange={(e) =>
                    setAssistantInput(
                      e.target.value
                    )
                  }
                  placeholder="Ask for product suggestions..."
                  disabled={
                    assistantLoading
                  }
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    assistantLoading ||
                    !assistantInput.trim()
                  }
                  style={{
                    backgroundColor:
                      "#2563eb",
                    borderColor:
                      "#2563eb",
                  }}
                >
                  Send
                </button>

              </div>

            </form>

          </div>

        )}

      </div>

    </main>
  );
}

export default Home;