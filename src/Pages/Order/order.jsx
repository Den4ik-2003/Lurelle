import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./order.css";

import NovaPoshtaIcon from "../../assets/Icons/novaposhta.webp";
import UkrPoshtaIcon from "../../assets/Icons/ukrposhta.png";
import CardPayIcon from "../../assets/Icons/cardPay.png";
import CashPayIcon from "../../assets/Icons/cashPay.png";
import LockIcon from "../../assets/Icons/lock.png";

export default function Order() {
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [enrichedItems, setEnrichedItems] = useState([]);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [carrier, setCarrier] = useState("Нова Пошта");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");

  const [payment, setPayment] = useState("card");

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const API_URL_ORDERS = import.meta.env.VITE_API_URL_ORDERS;
  const API_URL = import.meta.env.VITE_API_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const savedTotal = JSON.parse(localStorage.getItem("totalPrice")) || 0;
    const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    setTotalPrice(savedTotal);
    setCartItems(savedCart);

    if (savedCart.length === 0) return;

    fetch(API_URL, {
      cache: "no-store",
      headers: { "x-api-key": API_KEY },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((products) => {
        const merged = savedCart.map((item) => {
          const product = products.find((p) => p.id === item.id);
          return {
            ...item,
            image: product?.images?.[0] || "",
            color: product?.color || "",
          };
        });
        setEnrichedItems(merged);
      })
      .catch(() => setEnrichedItems(savedCart));
  }, []);

  const validateForm = () => {
    const phoneRegex = /^(\+380\d{9}|380\d{9}|0\d{9})$/;

    if (!name.trim()) return "Ім'я не може бути пустим";
    if (!surname.trim()) return "Прізвище не може бути пустим";
    if (!phoneRegex.test(phone.replace(/\s/g, "")))
      return "Телефон повинен починатись з +380, 380 або 0";
    if (!city.trim()) return "Введіть місто";
    if (!department.trim()) return "Вкажіть відділення або поштомат";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      setShowModal(true);
      return;
    }

    setLoading(true);

    try {
      const orderResponse = await fetch(API_URL_ORDERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          total: totalPrice,
          name,
          surname,
          email,
          phone,
          carrier,
          city,
          department,
          payment,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Помилка створення замовлення");
      }

      await Promise.all(
        cartItems.map((item) =>
          fetch(`${API_URL}/${item.id}/stock`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: item.quantity }),
          }),
        ),
      );

      localStorage.removeItem("cartItems");
      localStorage.removeItem("totalPrice");

      setCartItems([]);
      setEnrichedItems([]);
      setTotalPrice(0);
      setName("");
      setSurname("");
      setEmail("");
      setPhone("");
      setCarrier("Нова Пошта");
      setCity("");
      setDepartment("");
      setPayment("card");

      window.dispatchEvent(new Event("localStorageUpdate"));

      setErrorMessage("Дякуємо! Замовлення прийнято.");
      setShowModal(true);
    } catch (err) {
      setErrorMessage(
        err.message || "Сталася помилка при оформленні замовлення",
      );
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (errorMessage === "Дякуємо! Замовлення прийнято.") {
      navigate("/home");
    }
  };

  const items = enrichedItems.length ? enrichedItems : cartItems;

  return (
    <div className="container order-page">
      <Helmet>
        <title>
          Оформлення замовлення — Lurelle | Жіночі сумки
        </title>
        <meta
          name="description"
          content="Оформіть замовлення на жіночі сумки від Lurelle. Доставка Новою Поштою та УкрПоштою по всій Україні."
        />
        <meta
          property="og:title"
          content="Оформлення замовлення — Lurelle | Жіночі сумки"
        />
        <meta
          property="og:description"
          content="Швидке оформлення замовлення на жіночі сумки. Доставка по всій Україні."
        />
        <meta property="og:url" content="https://lurelle.netlify.app/order" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://lurelle.netlify.app/order" />
      </Helmet>

      <h2>Оформлення замовлення</h2>

      <form className="order-layout" onSubmit={handleSubmit}>
        <div className="order-main">
          <section className="order-block">
            <h3>1. Контактні дані</h3>
            <div className="order-grid-2">
              <label className="order-field">
                <span>Ім'я</span>
                <input
                  type="text"
                  placeholder="Марія"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="order-field">
                <span>Прізвище</span>
                <input
                  type="text"
                  placeholder="Шевченко"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
              </label>
              <label className="order-field">
                <span>Телефон</span>
                <input
                  type="tel"
                  placeholder="+380 (50) 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label className="order-field">
                <span>E-mail (необов'язково)</span>
                <input
                  type="email"
                  placeholder="maria@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="order-block">
            <h3>2. Доставка</h3>
            <p className="order-block-label">Оберіть службу доставки</p>
            <div className="order-options">
              <label
                className={`order-option${carrier === "Нова Пошта" ? " active" : ""}`}
              >
                <input
                  type="radio"
                  name="carrier"
                  checked={carrier === "Нова Пошта"}
                  onChange={() => setCarrier("Нова Пошта")}
                />
                <img
                  src={NovaPoshtaIcon}
                  alt=""
                  className="order-option-icon"
                />
                <span className="order-option-text">
                  <strong>Нова Пошта</strong>
                  <small>Швидка доставка у відділення або поштомат</small>
                </span>
                <span className="order-option-radio" />
              </label>

              <label
                className={`order-option${carrier === "УкрПошта" ? " active" : ""}`}
              >
                <input
                  type="radio"
                  name="carrier"
                  checked={carrier === "УкрПошта"}
                  onChange={() => setCarrier("УкрПошта")}
                />
                <img src={UkrPoshtaIcon} alt="" className="order-option-icon" />
                <span className="order-option-text">
                  <strong>УкрПошта</strong>
                  <small>Доступна доставка у відділення УкрПошти</small>
                </span>
                <span className="order-option-radio" />
              </label>
            </div>

            <div className="order-grid-2">
              <label className="order-field">
                <span>Місто</span>
                <input
                  type="text"
                  placeholder="Введіть місто"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </label>
              <label className="order-field">
                <span>Відділення / Поштомат</span>
                <input
                  type="text"
                  placeholder="Відділення №12 (вул. Хрещатик, 12)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="order-summary">
          <h3>Ваше замовлення</h3>

          <div className="order-summary-items">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="order-summary-item"
              >
                <div className="order-summary-img">
                  {item.image ? <img src={item.image} alt={item.name} /> : null}
                </div>
                <div className="order-summary-info">
                  <p className="order-summary-name">{item.name}</p>
                  <p className="order-summary-meta">
                    {item.color && <span>{item.color}</span>}
                    <span>Розмір: {item.size}</span>
                    <span>Кількість: {item.quantity}</span>
                  </p>
                </div>
                <span className="order-summary-price">
                  {(
                    Number(item.price ?? item.newPrice) * item.quantity
                  ).toLocaleString("uk-UA")}{" "}
                  грн
                </span>
              </div>
            ))}
          </div>

          <div className="order-summary-row">
            <span>Товарів на суму:</span>
            <span>{totalPrice.toLocaleString("uk-UA")} грн</span>
          </div>
          <div className="order-summary-total">
            <span>До сплати:</span>
            <strong>{totalPrice.toLocaleString("uk-UA")} грн</strong>
          </div>

          <button type="submit" className="order-btn" disabled={loading}>
            {loading ? "Відправка..." : "Підтвердити замовлення"}
          </button>

          <p className="order-secure">
            <img src={LockIcon} alt="" />
            Ваші дані під надійним захистом
          </p>
        </aside>
      </form>

      {showModal && (
        <div className="modal2">
          <div className="modal-content2">
            <h3>{errorMessage}</h3>
            <button className="button" onClick={closeModal}>
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}