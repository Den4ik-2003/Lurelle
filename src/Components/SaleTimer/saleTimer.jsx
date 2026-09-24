

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./saleTimer.css";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;


const PRODUCT_KEY = "saleTimerProduct";
const TIMER_KEY = "saleTimerEnd";
const DURATION = 43200;

export default function SaleTimer() {
  const [product, setProduct] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [visible, setVisible] = useState(false);
  const [digits, setDigits] = useState({ h: "12", m: "00", s: "00" });
  const [flipping, setFlipping] = useState({ h: false, m: false, s: false });
  const prevDigits = useRef({ h: "12", m: "00", s: "00" });
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
        setProduct(JSON.parse(cachedProduct));
        setTimeLeft(secondsLeft);
        setTimeout(() => setVisible(true), 100);
      }
    }

    fetch(API_URL, { headers: { "x-api-key": API_KEY } })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const discounted = data.filter(
          p => p.oldPrice > p.newPrice && Number(p.inStock) > 0
        );
        allProductsRef.current = discounted;

        const end = Number(localStorage.getItem(TIMER_KEY));
        const secondsLeft = Math.floor((end - Date.now()) / 1000);

        if (!localStorage.getItem(PRODUCT_KEY) || secondsLeft <= 0) {
          const result = pickNewProduct(discounted);
          if (!result) return;
          setProduct(result.picked);
          setTimeLeft(DURATION);
          setTimeout(() => setVisible(true), 100);
        }
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const products = allProductsRef.current;
          const result = pickNewProduct(products);
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
    const h = Math.floor(timeLeft / 3600).toString().padStart(2, "0");
    const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");

    const newFlipping = {
      h: h !== prevDigits.current.h,
      m: m !== prevDigits.current.m,
      s: s !== prevDigits.current.s,
    };

    if (newFlipping.h || newFlipping.m || newFlipping.s) {
      setFlipping(newFlipping);
      setTimeout(() => setFlipping({ h: false, m: false, s: false }), 400);
    }

    prevDigits.current = { h, m, s };
    setDigits({ h, m, s });
  }, [timeLeft]);

  const discount = product
    ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)
    : 0;

  if (!product) return null;

  return (
    <section className="st-section container">
      <div className={`st-card ${visible ? "st-card--visible" : ""}`}>

        <div className="st-left">
          <div className="st-badge-hit">ХІТ ПРОДАЖІВ</div>
          <div className="st-badge-discount">−{discount}%</div>
          <img src={product.images?.[0]} alt={product.name} className="st-img" />
          <div className="st-img-glow" />
        </div>

        <div className="st-right">
          <div className="st-label">
            <span className="st-label__dot" />
            Обмежена пропозиція
          </div>

          <h2 className="st-headline">
            ЛИШЕ СЬОГОДНІ<br />
            <span className="st-headline--green">ЗНИЖКА {discount}%</span>
          </h2>

          <div className="st-product-name">{product.name}</div>
          {product.description && (
            <div className="st-product-desc" dangerouslySetInnerHTML={{ __html: product.description }} />
          )}

          {product.inStock && (
            <div className="st-stock">Залишилось: <strong>{product.inStock} шт.</strong></div>
          )}

          <div className="st-timer-row">
            <div className={`st-unit ${flipping.h ? "st-unit--flip" : ""}`}>
              <div className="st-digit">{digits.h}</div>
              <div className="st-unit-label">год</div>
            </div>
            <span className="st-sep">:</span>
            <div className={`st-unit ${flipping.m ? "st-unit--flip" : ""}`}>
              <div className="st-digit">{digits.m}</div>
              <div className="st-unit-label">хв</div>
            </div>
            <span className="st-sep">:</span>
            <div className={`st-unit ${flipping.s ? "st-unit--flip" : ""}`}>
              <div className="st-digit">{digits.s}</div>
              <div className="st-unit-label">сек</div>
            </div>
          </div>

          <div className="st-bottom-row">
            <button className="st-btn" onClick={() => navigate(`/product/${product.id}`)}>
              Купити зараз →
            </button>
            <div className="st-prices">
              <span className="st-old">{product.oldPrice} грн</span>
              <span className="st-new">{product.newPrice} грн</span>
            </div>
          </div>

          <div className="st-urgency">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#C8A27A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="#C8A27A" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="#C8A27A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Поспішай! Кількість обмежена
          </div>
        </div>

      </div>
    </section>
  );
}