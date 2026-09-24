import { useEffect, useState, useRef } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Star from "../../assets/Icons/star.svg";
import StarFill from "../../assets/Icons/starFill.svg";
import StarHalf from "../../assets/Icons/starHalf.svg";
import Like from "../../assets/Icons/like.svg";
import LikeFill from "../../assets/Icons/likeFill.svg";
import CartIcon from "../../assets/Icons/cart.svg";
import Loader from "../../Components/Loader/loader";
import "./productInfo.css";

const API_URL = import.meta.env.VITE_API_URL;
const COMMENTS_URL = import.meta.env.COMMENTS_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

function scoreMatch(a, b) {
  let s = 0;
  if (a.brand && a.brand === b.brand) s += 3;
  if (a.category && a.category === b.category) s += 2;
  if (a.subcategory && a.subcategory === b.subcategory) s += 1;
  return s;
}

export default function ProductInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [recommended, setRecommended] = useState([]);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [comments, setComments] = useState([]);
  const [recLiked, setRecLiked] = useState({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(API_URL, {
        cache: "no-store",
        headers: { "x-api-key": API_KEY },
      }).then((r) => r.json()),
      fetch(`${COMMENTS_URL}?productId=${id}`, {
        headers: { "x-api-key": API_KEY },
      })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ])
      .then(([allProducts, commentsData]) => {
        const data = allProducts.find((p) => String(p.id) === id);
        if (!data) {
          setProduct(null);
          setLoading(false);
          return;
        }
        const likedItems = JSON.parse(localStorage.getItem("likedItems")) || [];
        setProduct(data);
        setMainImage(data.images?.[0] || "");
        setLiked(likedItems.includes(data.id));
        setComments(Array.isArray(commentsData) ? commentsData : []);
        const rec = allProducts
          .filter((p) => p.id !== data.id)
          .map((p) => ({ ...p, _score: scoreMatch(data, p) }))
          .filter((p) => p._score > 0)
          .sort((a, b) => b._score - a._score)
          .slice(0, 8)
          .map((p) => ({ ...p, image: p.images?.[0] || "" }));
        setRecommended(rec);
        const map = {};
        rec.forEach((p) => {
          map[p.id] = likedItems.includes(p.id);
        });
        setRecLiked(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const avgRating = comments.length
    ? comments.reduce((s, c) => s + Number(c.rating || 0), 0) / comments.length
    : null;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating))
        stars.push(<img key={i} src={StarFill} className="pi-star" alt="" />);
      else if (i - rating < 0.75 && i - rating >= 0.25)
        stars.push(<img key={i} src={StarHalf} className="pi-star" alt="" />);
      else stars.push(<img key={i} src={Star} className="pi-star" alt="" />);
    }
    return stars;
  };

  const toggleLike = () => {
    let items = JSON.parse(localStorage.getItem("likedItems")) || [];
    if (liked) items = items.filter((i) => i !== product.id);
    else items.push(product.id);
    localStorage.setItem("likedItems", JSON.stringify(items));
    setLiked(!liked);
    window.dispatchEvent(new Event("localStorageUpdate"));
  };

  const toggleRecLike = (pId) => {
    let items = JSON.parse(localStorage.getItem("likedItems")) || [];
    const exists = items.includes(pId);
    if (exists) items = items.filter((i) => i !== pId);
    else items.push(pId);
    localStorage.setItem("likedItems", JSON.stringify(items));
    window.dispatchEvent(new Event("localStorageUpdate"));
    setRecLiked((prev) => ({ ...prev, [pId]: !prev[pId] }));
  };

  const addToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      setShowSizeModal(true);
      return;
    }
    let items = JSON.parse(localStorage.getItem("cartItems")) || [];
    let total = JSON.parse(localStorage.getItem("totalPrice")) || 0;
    const existing = items.find(
      (i) => i.id === product.id && i.size === selectedSize,
    );
    if (existing) existing.quantity += quantity;
    else
      items.push({
        id: product.id,
        name: product.name,
        size: selectedSize,
        price: product.newPrice,
        quantity,
      });
    total += Number(product.newPrice) * quantity;
    localStorage.setItem("cartItems", JSON.stringify(items));
    localStorage.setItem("totalPrice", JSON.stringify(total));
    window.dispatchEvent(new Event("localStorageUpdate"));
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2000);
  };

  const buyNow = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      setShowSizeModal(true);
      return;
    }
    addToCart();
    navigate("/order");
  };

  if (loading) return <Loader />;
  if (!product)
    return (
      <div className="container pi-not-found">
        <Helmet>
          <title>Товар не знайдено — Lurelle</title>
        </Helmet>
        <p>Товар не знайдено 😔</p>
      </div>
    );

  const outOfStock = Number(product.inStock) === 0;
  const hasDiscount = product.oldPrice && product.oldPrice !== product.newPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - product.newPrice / product.oldPrice) * 100)
    : 0;
  const images = product.images?.slice(0, 4) || [];

  return (
    <div className="container pi-page">
      <Helmet>
        <title>{product.name} — купити в Lurelle</title>
        <meta
          name="description"
          content={`${product.name} за ціною ${product.newPrice} грн.`}
        />
        <link
          rel="canonical"
          href={`https://lurelle.netlify.app/product/${product.id}`}
        />
      </Helmet>

      {showSizeModal && (
        <div className="pi-overlay" onClick={() => setShowSizeModal(false)}>
          <div className="pi-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Оберіть розмір 🏷️</h3>
            <p>Щоб продовжити, потрібно вибрати розмір товару.</p>
            <button className="button" onClick={() => setShowSizeModal(false)}>
              Закрити
            </button>
          </div>
        </div>
      )}

      {showAddedToast && (
        <div className="pi-toast">✅ Товар додано в кошик!</div>
      )}

      <div className="pi-top">
        <div className="pi-gallery">
          <div className="pi-main-wrap">
            <img
              src={mainImage}
              alt={product.name}
              className={`pi-main-img${outOfStock ? " oos" : ""}`}
            />
            {outOfStock && (
              <div className="pi-oos-overlay">Немає в наявності</div>
            )}
          </div>
          <div className="pi-thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={`pi-thumb${mainImage === img ? " active" : ""}${outOfStock ? " oos" : ""}`}
                onClick={() => setMainImage(img)}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="pi-info">
          <span className={`pi-stock${outOfStock ? " out" : ""}`}>
            {outOfStock ? "● Немає в наявності" : "● В наявності"}
          </span>

          <h1 className="pi-name">{product.name}</h1>

          <div className="pi-rating-row">
            {avgRating !== null ? (
              <>
                <div className="pi-stars">{renderStars(avgRating)}</div>
                <span className="pi-rating-num">({avgRating.toFixed(1)})</span>
                <span className="pi-review-cnt">
                  {comments.length} відгуків
                </span>
              </>
            ) : (
              <span className="pi-no-reviews">Немає відгуків</span>
            )}
          </div>

          <div className="pi-price-row">
            <span className="pi-price-new">
              {product.newPrice?.toLocaleString("uk-UA")} грн
            </span>
            {hasDiscount && (
              <>
                <span className="pi-price-old">
                  {product.oldPrice?.toLocaleString("uk-UA")} грн
                </span>
                <span className="pi-discount">-{discountPct}%</span>
              </>
            )}
            <button
              className={`pi-like${liked ? " active" : ""}`}
              onClick={toggleLike}
              aria-label="До вподобаних"
            >
              <img src={liked ? LikeFill : Like} alt="" />
            </button>
          </div>

          {product.description && (
            <p
              className="pi-desc"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {product.sizes?.length > 0 && (
            <div className="pi-section">
              <span className="pi-label">Оберіть розмір:</span>
              <div className="pi-sizes">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`pi-size${selectedSize === size ? " active" : ""}${outOfStock ? " disabled" : ""}`}
                    onClick={() => !outOfStock && setSelectedSize(size)}
                    disabled={outOfStock}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="pi-section">
              <span className="pi-label">Колір:</span>
              <div className="pi-colors">
                {product.colors.map((c, i) => {
                  const hex = typeof c === "object" ? c.hex || c.color : null;
                  const name = typeof c === "object" ? c.name : c;
                  return (
                    <span
                      key={i}
                      className="pi-color-dot"
                      title={name}
                      style={hex ? { background: hex } : {}}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="pi-section">
            <span className="pi-label">Кількість:</span>
            <div className="pi-qty">
              <button
                className="pi-qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
              >
                −
              </button>
              <span className="pi-qty-val">{quantity}</span>
              <button
                className="pi-qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={outOfStock}
              >
                +
              </button>
            </div>
          </div>

          {product.sku && (
            <p className="pi-sku">
              Код товару: <span>{product.sku}</span>
            </p>
          )}

          <div className="pi-actions">
            <button
              className="pi-btn-cart"
              onClick={addToCart}
              disabled={outOfStock}
            >
              <img src={CartIcon} alt="" className="pi-btn-icon" />
              {outOfStock ? "Немає в наявності" : "Додати в кошик"}
            </button>
            <button
              className="pi-btn-buy"
              onClick={buyNow}
              disabled={outOfStock}
            >
              {outOfStock ? "Немає в наявності" : "Купити зараз"}
            </button>
          </div>
        </div>
      </div>

      {recommended.length > 0 && (
        <section className="pi-rec">
          <h2 className="pi-rec-title">Схожі товари</h2>
          <div className="pi-rec-grid">
            {recommended.map((item) => {
              const recOos = Number(item.inStock) === 0;
              const recDiscount =
                item.oldPrice && item.oldPrice !== item.newPrice;
              return (
                <NavLink
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="pi-rec-link"
                >
                  <div className={`pi-rec-card${recOos ? " oos" : ""}`}>
                    <div className="pi-rec-img-wrap">
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`pi-rec-img${recOos ? " oos" : ""}`}
                      />
                      {recOos && (
                        <div className="pi-rec-oos-badge">
                          Немає в наявності
                        </div>
                      )}
                      <button
                        className={`pi-rec-like${recLiked[item.id] ? " active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleRecLike(item.id);
                        }}
                        aria-label="До вподобаних"
                      >
                        <img src={recLiked[item.id] ? LikeFill : Like} alt="" />
                      </button>
                    </div>
                    <div className="pi-rec-body">
                      <h3 className="pi-rec-name">{item.name}</h3>
                      <div className="pi-rec-stars">
                        {renderStars(item.rating || 0)}
                      </div>
                      <div className="pi-rec-prices">
                        {recDiscount && (
                          <span className="pi-rec-old">
                            {item.oldPrice?.toLocaleString("uk-UA")} грн
                          </span>
                        )}
                        <span className="pi-rec-new">
                          {item.newPrice?.toLocaleString("uk-UA")} грн
                        </span>
                      </div>
                    </div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}