import "./footer.css";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Instagram from "../../assets/Icons/instagram.webp";
import Telegram from "../../assets/Icons/telegram.webp";

const ChevronIcon =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
  );

const NAV_FILTER_KEY = "footerNavFilter";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const ONLINE_URL = import.meta.env.VITE_ONLINE_API_URL;

export default function Footer() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  // Отримуємо категорії та бренди
  useEffect(() => {
    fetch(API_URL, {
      headers: {
        "x-api-key": API_KEY,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        // Унікальні категорії
        const uniqueCats = [];
        const seenCats = new Set();

        for (const p of data) {
          if (p.category && !seenCats.has(p.category)) {
            seenCats.add(p.category);
            uniqueCats.push(p.category);

            if (uniqueCats.length === 5) break;
          }
        }

        // Унікальні бренди
        const uniqueBrands = [];
        const seenBrands = new Set();

        for (const p of data) {
          if (p.brand && !seenBrands.has(p.brand)) {
            seenBrands.add(p.brand);
            uniqueBrands.push(p.brand);

            if (uniqueBrands.length === 5) break;
          }
        }

        setCategories(uniqueCats);
        setBrands(uniqueBrands);
      })
      .catch(() => {});
  }, []);

  // Отримуємо кількість онлайн-користувачів
  useEffect(() => {
    const fetchOnline = () => {
      fetch(`${ONLINE_URL}/api/online-count`)
        .then((r) => r.json())
        .then((data) => {
          setOnlineCount(data.online || 0);
        })
        .catch(() => {});
    };

    fetchOnline();

    const interval = setInterval(fetchOnline, 10000);

    return () => clearInterval(interval);
  }, []);

  // Перехід у каталог із фільтром
  const handleFilterLink = (filter) => {
    if (filter) {
      localStorage.setItem(NAV_FILTER_KEY, JSON.stringify(filter));
    } else {
      localStorage.removeItem(NAV_FILTER_KEY);
    }

    window.dispatchEvent(new Event("footerNavFilter"));

    window.scrollTo(0, 0);

    navigate("/products");
  };

  // Відкрити налаштування Cookie
  const openCookieSettings = () => {
    window.dispatchEvent(new Event("open-cookie-settings"));
  };

  const aboutLinks = [
    {
      label: "Про нас",
      to: "/about",
    },
    {
      label: "Контакти",
      to: "/contact",
    },
  ];

  return (
    <footer className="footer">
      <div className="container footer-inner">
        {/* Про магазин */}
        <div className="footer-col about">
          <h3>Lurelle</h3>

          <p>
            Стиль, якість і увага до деталей. Жіночі сумки для тих, хто обирає
            найкраще.
          </p>

          {/* Онлайн */}
          <div className="online-indicator">
            <span className="online-dot"></span>

            <span className="online-text">
              Онлайн: {onlineCount}
            </span>
          </div>

          {/* Соціальні мережі */}
          <div className="social-icons">
            <a
              href="https://instagram.com/lurelle.store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={Instagram} alt="Instagram" />
            </a>

            <a
              href="https://t.me/lurellestore"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={Telegram} alt="Telegram" />
            </a>
          </div>
        </div>

        {/* Каталог */}
        <div className="footer-col">
          <h4>Каталог</h4>

          <ul>
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  className="footer-nav-btn"
                  onClick={() =>
                    handleFilterLink({
                      type: "category",
                      value: cat,
                    })
                  }
                >
                  <span>{cat}</span>

                  <img
                    src={ChevronIcon}
                    alt=""
                    className="footer-chevron"
                  />
                </button>
              </li>
            ))}

            {/* Новинки */}
            <li>
              <button
                className="footer-nav-btn footer-link-accent"
                onClick={() =>
                  handleFilterLink({
                    type: "sort",
                    value: "new",
                  })
                }
              >
                <span>Новинки</span>

                <img
                  src={ChevronIcon}
                  alt=""
                  className="footer-chevron"
                />
              </button>
            </li>
          </ul>
        </div>

        {/* Бренди */}
        <div className="footer-col">
          <h4>Бренди</h4>

          <ul>
            {brands.map((brand) => (
              <li key={brand}>
                <button
                  className="footer-nav-btn"
                  onClick={() =>
                    handleFilterLink({
                      type: "brand",
                      value: brand,
                    })
                  }
                >
                  <span>{brand}</span>

                  <img
                    src={ChevronIcon}
                    alt=""
                    className="footer-chevron"
                  />
                </button>
              </li>
            ))}

            {/* Всі бренди */}
            <li>
              <button
                className="footer-nav-btn footer-link-accent"
                onClick={() => handleFilterLink(null)}
              >
                <span>Всі бренди</span>

                <img
                  src={ChevronIcon}
                  alt=""
                  className="footer-chevron"
                />
              </button>
            </li>
          </ul>
        </div>

        {/* Про нас */}
        <div className="footer-col">
          <h4>Про нас</h4>

          <ul>
            {aboutLinks.map((item) => (
              <li key={item.label}>
                <NavLink to={item.to}>
                  <span>{item.label}</span>

                  <img
                    src={ChevronIcon}
                    alt=""
                    className="footer-chevron"
                  />
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Нижня частина Footer */}
      <div className="footer-bottom container">
        <p>
          © {new Date().getFullYear()} Lurelle. Всі права захищені.
        </p>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openCookieSettings();
          }}
        >
          Налаштування cookie
        </a>
      </div>
    </footer>
  );
}