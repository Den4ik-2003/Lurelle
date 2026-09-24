import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./basket.css";
import Loader from "../../Components/Loader/loader";
import TrashIcon from "../../assets/Icons/trash.svg";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export default function Basket() {
  const [cartProducts, setCartProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    if (cartItems.length === 0) {
      setCartProducts([]);
      setTotalPrice(0);
      localStorage.setItem("totalPrice", JSON.stringify(0));
      setLoading(false);
      return;
    }

    fetch(API_URL, {
      cache: "no-store",
      headers: { "x-api-key": API_KEY },
    })
      .then((res) => {
        if (!res.ok) throw new Error("error");
        return res.json();
      })
      .then((data) => {
        const filtered = cartItems
          .map((cartItem) => {
            const product = data.find((p) => p.id === cartItem.id);
            if (!product) return null;
            return {
              ...product,
              size: cartItem.size,
              quantity: cartItem.quantity || 1,
              image: product.images?.[0] || "",
            };
          })
          .filter(Boolean);

        setCartProducts(filtered);
        calculateTotal(filtered);
        setLoading(false);
      })
      .catch(() => {
        setLoading(true);
      });
  }, []);

  const calculateTotal = (products) => {
    const total = products.reduce(
      (acc, item) => acc + Number(item.newPrice) * (item.quantity || 1),
      0,
    );
    setTotalPrice(total);
    localStorage.setItem("totalPrice", JSON.stringify(total));
  };

  const updateLocalStorage = (items) => {
    localStorage.setItem("cartItems", JSON.stringify(items));
    window.dispatchEvent(new Event("localStorageUpdate"));
  };

  const changeQuantity = (id, size, delta) => {
    setCartProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id && p.size === size) {
          const q = (p.quantity || 1) + delta;
          return { ...p, quantity: q > 0 ? q : 1 };
        }
        return p;
      });
      updateLocalStorage(
        updated.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.newPrice,
          size: p.size,
          quantity: p.quantity,
          sezon: p.sezon,
        })),
      );
      calculateTotal(updated);
      return updated;
    });
  };

  const removeFromCart = (id, size) => {
    const updated = cartProducts.filter(
      (p) => !(p.id === id && p.size === size),
    );
    setCartProducts(updated);
    calculateTotal(updated);
    updateLocalStorage(updated);
  };

  const clearCart = () => {
    setCartProducts([]);
    setTotalPrice(0);
    updateLocalStorage([]);
    localStorage.setItem("totalPrice", JSON.stringify(0));
  };

  return (
    <section className="basket2 container">
      <Helmet>
        <title>Кошик — Lurelle | Жіночі сумки</title>
        <meta
          name="description"
          content="Перегляньте товари у вашому кошику та оформіть замовлення на жіночі сумки від Lurelle."
        />
        <meta
          property="og:title"
          content="Кошик — Lurelle | Жіночі сумки"
        />
        <meta
          property="og:description"
          content="Оформіть замовлення на жіночі сумки від Lurelle."
        />
        <meta property="og:url" content="https://lurelle.netlify.app/basket" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://lurelle.netlify.app/basket" />
      </Helmet>

      <h2>Ваш кошик</h2>

      {loading ? (
        <Loader />
      ) : cartProducts.length === 0 ? (
        <div className="basket-empty2">
          <p>Ваш кошик порожній</p>
          <NavLink to="/products" className="basket-btn2">
            Перейти до товарів
          </NavLink>
        </div>
      ) : (
        <div className="basket-layout">
          <div className="basket-table">
            <div className="basket-row basket-row--head">
              <span className="col-product">Товар</span>
              <span className="col-size">Розмір</span>
              <span className="col-qty">Кількість</span>
              <span className="col-sum">Сума</span>
              <span className="col-del" />
            </div>

            {cartProducts.map((item) => (
              <div key={`${item.id}-${item.size}`} className="basket-row">
                <div className="col-product">
                  <NavLink
                    to={`/product/${item.id}`}
                    className="basket-row-img"
                  >
                    <img src={item.image} alt={item.name} />
                  </NavLink>
                  <div className="basket-row-info">
                    <NavLink
                      to={`/product/${item.id}`}
                      className="basket-row-name"
                    >
                      {item.name}
                    </NavLink>
                  </div>
                </div>

                <div className="col-size">
                  <span className="basket-size-badge">{item.size}</span>
                </div>

                <div className="col-qty">
                  <div className="basket-quantity">
                    <button
                      onClick={() => changeQuantity(item.id, item.size, -1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => changeQuantity(item.id, item.size, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="col-sum">
                  {(Number(item.newPrice) * item.quantity).toLocaleString(
                    "uk-UA",
                  )}{" "}
                  грн
                </div>

                <div className="col-del">
                  <button
                    className="basket-remove"
                    onClick={() => removeFromCart(item.id, item.size)}
                    aria-label="Видалити товар"
                  >
                    <img src={TrashIcon} alt="" />
                  </button>
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="basket-clear-link">
              Видалити все
            </button>
          </div>

          <aside className="basket-summary">
            <h3>Ваше замовлення</h3>

            <div className="basket-summary-row">
              <span>Товарів на суму:</span>
              <span>{totalPrice.toLocaleString("uk-UA")} грн</span>
            </div>

            <div className="basket-summary-total">
              <span>До сплати:</span>
              <strong>{totalPrice.toLocaleString("uk-UA")} грн</strong>
            </div>

            <NavLink to="/order" className="basket-buy-btn">
              Оформити замовлення
            </NavLink>

            <NavLink to="/products" className="basket-continue-link">
              ← Продовжити покупки
            </NavLink>
          </aside>
        </div>
      )}
    </section>
  );
}