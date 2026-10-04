import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./saleTimer.css";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const PRODUCT_KEY = "saleTimerProduct";
const TIMER_KEY = "saleTimerEnd";
const DURATION = 43200;

const getImage = (product) => {
  if (!product) return null;

  let src = product.images ?? product.image ?? product.img ?? product.photo;

  if (typeof src === "string") {
    const trimmed = src.trim();
    if (trimmed.startsWith("[")) {
      try {
        src = JSON.parse(trimmed);
      } catch {
        src = trimmed;
      }
    } else {
      src = trimmed;
    }
  }

  let first = Array.isArray(src) ? src[0] : src;

  if (first && typeof first === "object") {
    first = first.url || first.src || first.secure_url || first.path;
  }

  if (typeof first !== "string" || !first.trim()) return null;
  first = first.trim();

  if (/^(https?:|data:|blob:)/i.test(first)) return first;
  if (first.startsWith("//")) return `https:${first}`;

  try {
    return new URL(first, new URL(API_URL).origin + "/").href;
  } catch {
    return first;
  }
};

const pad = (n) => String(n).padStart(2, "0");

export default function SaleTimer() {
  const [product, setProduct] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [visible, setVisible] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const navigate = useNavigate();
  const allProductsRef = useRef([]);

  const pickNewProduct = (products) => {
    if (!products.length) return null;
    const picked = products[Math.floor(Math.random() * products.length)];
    const endTime = Date.now() + DURATION * 1000;
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(picked));
    localStorage.setItem(TIMER_KEY, String(endTime));
    return { picked, endTime };
  };

  useEffect(() => {
    const cachedProduct = localStorage.getItem(PRODUCT_KEY);
    const cachedEnd = localStorage.getItem(TIMER_KEY);

    if (cachedProduct && cachedEnd) {
      const secondsLeft = Math.floor((Number(cachedEnd) - Date.now()) / 1000);
      if (secondsLeft > 0) {
        try {
          setProduct(JSON.parse(cachedProduct));
          setTimeLeft(secondsLeft);
          setTimeout(() => setVisible(true), 100);
        } catch {
          localStorage.removeItem(PRODUCT_KEY);
          localStorage.removeItem(TIMER_KEY);
        }
      }
    }

    fetch(API_URL, { headers: { "x-api-key": API_KEY } })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const discounted = data.filter(
          (p) => p.oldPrice > p.newPrice && Number(p.inStock) > 0
        );
        allProductsRef.current = discounted;

        const end = Number(localStorage.getItem(TIMER_KEY));
        const secondsLeft = Math.floor((end - Date.now()) / 1000);

        if (!localStorage.getItem(PRODUCT_KEY) || !(secondsLeft > 0)) {
          const result = pickNewProduct(discounted);
          if (!result) return;
          setProduct(result.picked);
          setTimeLeft(DURATION);
          setTimeout(() => setVisible(true), 100);
        } else {
          const fresh = discounted.find(
            (p) => String(p.id) === String(JSON.parse(localStorage.getItem(PRODUCT_KEY)).id)
          );
          if (fresh) setProduct(fresh);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const result = pickNewProduct(allProductsRef.current);
          if (result) {
            setProduct(result.picked);
            setVisible(false);
            setTimeout(() => setVisible(true), 100);
          }
          return DURATION;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setImgFailed(false);
  }, [product]);

  if (!product) return null;

  const discount = Math.round(
    ((product.oldPrice - product.newPrice) / product.oldPrice) * 100
  );

  const h = pad(Math.floor(timeLeft / 3600));
  const m = pad(Math.floor((timeLeft % 3600) / 60));
  const s = pad(timeLeft % 60);

  const image = getImage(product);

  return (
    <section className="st-section container">
      <div className={`st-card ${visible ? "st-card--visible" : ""}`}>
        <div className="st-left">
          <div className="st-badge-hit">ХІТ ПРОДАЖІВ</div>
          <div className="st-badge-discount">−{discount}%</div>

          {image && !imgFailed ? (
            <img
              src={image}
              alt={product.name}
              className="st-img"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="st-img st-img--placeholder">{product.name}</div>
          )}

          <div className="st-img-glow" />
        </div>

        <div className="st-right">
          <div className="st-label">
            <span className="st-label__dot" />
            Обмежена пропозиція
          </div>

          <h2 className="st-headline">
            ЛИШЕ СЬОГОДНІ
            <br />
            <span className="st-headline--green">ЗНИЖКА {discount}%</span>
          </h2>

          <div className="st-product-name">{product.name}</div>

          {product.description && (
            <div
              className="st-product-desc"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {product.inStock && (
            <div className="st-stock">
              Залишилось: <strong>{product.inStock} шт.</strong>
            </div>
          )}

          <div className="st-timer-row">
            <div className="st-unit st-unit--flip">
              <div className="st-digit" key={`h${h}`}>{h}</div>
              <div className="st-unit-label">год</div>
            </div>
            <span className="st-sep">:</span>
            <div className="st-unit st-unit--flip">
              <div className="st-digit" key={`m${m}`}>{m}</div>
              <div className="st-unit-label">хв</div>
            </div>
            <span className="st-sep">:</span>
            <div className="st-unit st-unit--flip">
              <div className="st-digit" key={`s${s}`}>{s}</div>
              <div className="st-unit-label">сек</div>
            </div>
          </div>

          <div className="st-bottom-row">
            <button
              className="st-btn"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              Купити зараз →
            </button>
            <div className="st-prices">
              <span className="st-old">{product.oldPrice} грн</span>
              <span className="st-new">{product.newPrice} грн</span>
            </div>
          </div>

          <div className="st-urgency">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                stroke="#C8A27A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
                stroke="#C8A27A"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M16 10a4 4 0 01-8 0"
                stroke="#C8A27A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Поспішай! Кількість обмежена
          </div>
        </div>
      </div>
    </section>
  );
}