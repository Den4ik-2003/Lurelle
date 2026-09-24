import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Like from "../../assets/Icons/likeHeader.svg";
import Basket from "../../assets/Icons/basket.svg";
import GoTopIcon from "../../assets/Icons/goTop.svg";
import "./header.css";

export default function Header({ openModal }) {
  const [likeCount, setLikeCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  const updateCounts = () => {
    const likedItems = JSON.parse(localStorage.getItem("likedItems")) || [];
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    setLikeCount(likedItems.length);
    setCartCount(cartItems.length);
  };

  useEffect(() => {
    updateCounts();
    const handleLocalUpdate = () => updateCounts();
    window.addEventListener("localStorageUpdate", handleLocalUpdate);
    return () =>
      window.removeEventListener("localStorageUpdate", handleLocalUpdate);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    document.documentElement.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const displayCount = (count) => (count > 9 ? "9+" : count);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };
  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="logo">
            <h1>Lurelle</h1>
          </div>

          <div className="mobile-actions">
            <button className="cart" onClick={() => handleNavigate("/like")}>
              <img src={Like} alt="Like" />
              <span className="cart-count">{displayCount(likeCount)}</span>
            </button>
            <button className="cart" onClick={() => handleNavigate("/cart")}>
              <img src={Basket} alt="Basket" />
              <span className="cart-count">{displayCount(cartCount)}</span>
            </button>
          </div>

          <div
            className={`burger ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <nav className={`nav ${menuOpen ? "open" : ""}`}>
            <NavLink
              className={linkClass}
              to="/home"
              onClick={() => setMenuOpen(false)}
            >
              Головна
            </NavLink>
            <NavLink
              className={linkClass}
              to="/products"
              onClick={() => setMenuOpen(false)}
            >
              Товари
            </NavLink>
            <NavLink
              className={linkClass}
              to="/about"
              onClick={() => setMenuOpen(false)}
            >
              Про нас
            </NavLink>
            
            <NavLink
              className={linkClass}
              to="/contact"
              onClick={() => setMenuOpen(false)}
            >
              Контакти
            </NavLink>
            <div className="mobile-menu-extra">
              <button
                className="button"
                onClick={() => handleNavigate("/products")}
              >
                Купити
              </button>
            </div>
          </nav>

          <div className="header-actions">
            <button className="cart" onClick={() => handleNavigate("/like")}>
              <img src={Like} alt="Like" />
              <span className="cart-count">{displayCount(likeCount)}</span>
            </button>
            <button className="cart" onClick={() => handleNavigate("/cart")}>
              <img src={Basket} alt="Basket" />
              <span className="cart-count">{displayCount(cartCount)}</span>
            </button>
            <button
              className="button"
              onClick={() => handleNavigate("/products")}
            >
              Купити
            </button>
          </div>
        </div>
      </header>

      {showScrollTop && (
        <button
          className="scroll-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img src={GoTopIcon} alt="Go Top" />
        </button>
      )}
    </>
  );
}