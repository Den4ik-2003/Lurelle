import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import HeartIcon from "../../assets/Icons/likeFill.svg";
import TrashIcon from "../../assets/Icons/trash.svg";
import StarIcon from "../../assets/Icons/starNew.svg";
import StarFillIcon from "../../assets/Icons/starFill.svg";
import StarHalfIcon from "../../assets/Icons/starHalf.svg";
import Loader from "../../Components/Loader/loader";
import "./liked.css";

const API_URL = import.meta.env.VITE_API_URL;
const COMMENTS_URL = import.meta.env.VITE_COMMENTS_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

function getAgeInDays(createdAt) {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (isNaN(created.getTime())) return null;
  const now = new Date();
  return (now - created) / (1000 * 60 * 60 * 24);
}

function getBadge(product) {
  const ageDays = getAgeInDays(
    product.createdAt || product.uploadedAt || product.dateAdded,
  );

  if (ageDays !== null && ageDays < 2) {
    return { text: "Новинка", cls: "pc-badge-new", icon: "ti-sparkles" };
  }

  if (ageDays !== null && ageDays >= 2 && ageDays <= 7) {
    return { text: "Хіт", cls: "pc-badge-hit", icon: "ti-flame" };
  }

  if (
    product.oldPrice &&
    product.newPrice &&
    product.newPrice < product.oldPrice
  ) {
    const discount = Math.round(
      ((product.oldPrice - product.newPrice) / product.oldPrice) * 100,
    );
    return { text: `-${discount}%`, cls: "pc-badge-sale", icon: "ti-tag" };
  }

  return null;
}

function calcAvgRating(comments) {
  if (!Array.isArray(comments) || comments.length === 0) return null;
  const sum = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
  return sum / comments.length;
}

function StarRow({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push("fill");
    else if (i - rating < 1 && i - rating >= 0.5) stars.push("half");
    else stars.push("empty");
  }
  return (
    <div className="pc-stars">
      {stars.map((type, i) => (
        <img
          key={i}
          src={
            type === "fill"
              ? StarFillIcon
              : type === "half"
                ? StarHalfIcon
                : StarIcon
          }
          alt=""
          width={14}
          height={14}
        />
      ))}
    </div>
  );
}

function LikedCard({ product, onRemove }) {
  const images =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const mainImage = images[0];

  const available = Number(product.inStock) > 0;
  const badge = getBadge(product);

  const hasComments =
    Array.isArray(product.comments) && product.comments.length > 0;
  const avgRating = calcAvgRating(product.comments) ?? product.rating ?? 0;
  const reviewCount = hasComments ? product.comments.length : 0;

  const hasDiscount = product.oldPrice && product.newPrice < product.oldPrice;

  return (
    <div className={`pc-card ${!available ? "pc-card--oos" : ""}`}>
      {badge && (
        <span className={`pc-badge ${badge.cls}`}>
          {badge.icon && <i className={`ti ${badge.icon}`} />}
          {badge.text}
        </span>
      )}

      <button
        className="pc-wishlist active"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(product.id);
        }}
        aria-label="Видалити з вподобаних"
      >
        <img src={HeartIcon} alt="" width={20} height={20} />
      </button>

      <div className="pc-img-wrap">
        {mainImage ? (
          <img src={mainImage} alt={product.name} className="pc-img" />
        ) : (
          <div className="pc-img-placeholder">
            <i className="ti ti-photo" />
          </div>
        )}

        {!available && (
          <div className="pc-out-overlay">
            <span>Немає в наявності</span>
          </div>
        )}
      </div>

      <div className="pc-body">
        <div className="pc-label-row">
          {product.category && (
            <span className="pc-label pc-label-cat">{product.category}</span>
          )}
          {product.brand && (
            <span className="pc-label pc-label-brand">{product.brand}</span>
          )}
        </div>

        <h3 className="pc-name">{product.name}</h3>
        {product.description && (
          <p className="pc-desc">
            {product.description.replace(/<br\s*\/?>/gi, " ")}
          </p>
        )}

        <div className="pc-rating-row">
          {hasComments ? (
            <>
              <StarRow rating={avgRating} />
              <span className="pc-rating-val">{avgRating.toFixed(1)}</span>
              <span className="pc-review-count">({reviewCount} відгуків)</span>
            </>
          ) : (
            <span className="pc-review-count pc-no-reviews">
              Поки немає відгуків
            </span>
          )}
        </div>

        <div className="pc-price-row">
          {hasDiscount && (
            <span className="pc-price-old">
              {product.oldPrice.toLocaleString("uk-UA")} грн
            </span>
          )}
          <span className="pc-price-new">
            {product.newPrice.toLocaleString("uk-UA")} грн
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Liked() {
  const [products, setProducts] = useState([]);
  const [likedIds, setLikedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("likedItems")) || [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const likedItems = JSON.parse(localStorage.getItem("likedItems")) || [];

    Promise.all([
      fetch(API_URL, {
        cache: "no-store",
        headers: { "x-api-key": API_KEY },
      }).then((res) => {
        if (!res.ok) throw new Error("error");
        return res.json();
      }),
      fetch(COMMENTS_URL, {
        cache: "no-store",
        headers: { "x-api-key": API_KEY },
      })
        .then((res) => {
          if (!res.ok) throw new Error("error");
          return res.json();
        })
        .catch(() => []),
    ])
      .then(([data, commentsData]) => {
        const commentsByProductId = {};
        (Array.isArray(commentsData) ? commentsData : []).forEach((c) => {
          if (!commentsByProductId[c.productId]) {
            commentsByProductId[c.productId] = [];
          }
          commentsByProductId[c.productId].push(c);
        });

        const likedProducts = data
          .filter((item) => likedItems.includes(item.id))
          .map((p) => ({
            ...p,
            comments: commentsByProductId[p.id] || [],
          }));
        setProducts(likedProducts);
        setLoading(false);
      })
      .catch(() => setLoading(true));
  }, []);

  const toggleLike = (id) => {
    const current = JSON.parse(localStorage.getItem("likedItems")) || [];
    const next = current.filter((x) => x !== id);
    localStorage.setItem("likedItems", JSON.stringify(next));

    setLikedIds(next);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    window.dispatchEvent(new Event("localStorageUpdate"));
  };

  const clearAll = () => {
    localStorage.setItem("likedItems", JSON.stringify([]));
    window.dispatchEvent(new Event("localStorageUpdate"));
    setLikedIds([]);
    setProducts([]);
  };

  return (
    <section className="lk-page container">
      <Helmet>
        <title>Вподобані товари — Lurelle</title>
        <meta
          name="description"
          content="Ваш список вподобаних товарів Lurelle."
        />
        <meta property="og:title" content="Вподобані товари — Lurelle" />
        <meta property="og:url" content="https://lurelle.netlify.app/liked" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://lurelle.netlify.app/liked" />
      </Helmet>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="lk-empty">
          <h2 className="lk-empty-title">Вподобані товари</h2>
          <p className="lk-empty-text">У вас поки немає вподобаних товарів</p>
          <NavLink to="/products" className="lk-empty-btn">
            Перейти до товарів
          </NavLink>
        </div>
      ) : (
        <>
          <div className="lk-header">
            <div className="lk-header__left">
              <div className="lk-title-row">
                <h2 className="lk-title">Вподобані товари</h2>
                <span className="lk-count">{products.length}</span>
              </div>
              <p className="lk-subtitle">Товари, які вам сподобались</p>
            </div>
            <button className="lk-clear-btn" onClick={clearAll}>
              <img src={TrashIcon} alt="" className="lk-clear-btn__icon" />
              Очистити всі
            </button>
          </div>

          <div className="lk-grid">
            {products.map((item) => (
              <NavLink
                key={item.id}
                to={`/product/${item.id}`}
                className="pc-card-link"
              >
                <LikedCard product={item} onRemove={toggleLike} />
              </NavLink>
            ))}
          </div>
        </>
      )}
    </section>
  );
}