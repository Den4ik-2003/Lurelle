import { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./contact.css";

import instagramIcon from "../../assets/Icons/instagram.svg";
import emailIcon from "../../assets/Icons/email.svg";
import clockIcon from "../../assets/Icons/clock.svg";
import instagramColor from "../../assets/Icons/instagram.webp";
import telegramColor from "../../assets/Icons/telegram.webp";
import contactImage from "../../assets/Images/contactImage.webp";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL_CONTACT = import.meta.env.VITE_API_URL_CONTACT;

  const contacts = [
    { icon: instagramIcon, label: "Instagram", value: "@lurelle.store" },
    { icon: emailIcon, label: "Електронна пошта", value: "lurellestore@gmail.com" },
    { icon: clockIcon, label: "Графік роботи", value: "Пн–Пт, 9:00–18:00" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL_CONTACT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
      } else {
        setError("Сталася помилка при відправці форми.");
      }
    } catch (err) {
      console.error(err);
      setError("Сталася помилка при відправці форми.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page container">
      <Helmet>
        <title>Контакти — Lurelle | Жіночі сумки в Україні</title>
        <meta
          name="description"
          content="Зв'яжіться з Lurelle — офіційний магазин жіночих сумок в Україні. Шкіряні сумки, клатчі, крос-боді. Відповімо протягом одного робочого дня."
        />
        <meta
          name="keywords"
          content="жіночі сумки, купити сумку Україна, шкіряні сумки Lurelle, клатч, крос-боді"
        />
        <meta property="og:title" content="Контакти — Lurelle | Жіночі сумки" />
        <meta
          property="og:description"
          content="Напишіть нам — відповімо протягом одного робочого дня. Жіночі сумки Lurelle. Instagram @lurelle.store."
        />
        <meta property="og:url" content="https://lurelle.netlify.app/contact" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://lurelle.netlify.app/contact" />
      </Helmet>

      <div className="contact-hero">
        <span className="contact-eyebrow">Підтримка</span>
        <h1 className="contact-title">Зв'яжіться з нами</h1>
        <p className="contact-subtitle">
          Ми завжди готові допомогти вам з вибором і відповісти на ваші запитання.
        </p>
      </div>

      <div className="contact-layout">
        <div className="contact-left">
          <aside className="contact-sidebar">
            <h2 className="sidebar-heading">Контакти</h2>
            {contacts.map((item, index) => (
              <div key={index} className="contact-row">
                <img src={item.icon} alt={item.label} className="contact-row-icon" />
                <div>
                  <p className="contact-row-label">{item.label}</p>
                  <p className="contact-row-value">{item.value}</p>
                </div>
              </div>
            ))}
          </aside>

          <div className="contact-help-block">
            <p className="help-title">Потрібна допомога?</p>
            <p className="help-text">
              Напишіть нам у месенджерах — ми відповімо найшвидше.
            </p>
            <div className="help-socials">
              <a href="https://instagram.com/lurelle.store" target="_blank" rel="noopener noreferrer">
                <img src={instagramColor} alt="Instagram" />
              </a>
              <a href="https://t.me/lurellestore" target="_blank" rel="noopener noreferrer">
                <img src={telegramColor} alt="Telegram" />
              </a>
            </div>
          </div>
        </div>

        <div className="contact-center">
          <div className="contact-form-wrap">
            <h2 className="form-heading">Напишіть нам</h2>

            {error && <p className="form-error">{error}</p>}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label" htmlFor="name">Ім'я</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Як до вас звертатись?"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  pattern=".{2,}"
                  title="Мінімум 2 символи"
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="message">Повідомлення</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Розкажіть про ваше питання..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  pattern=".{5,}"
                  title="Мінімум 5 символів"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                <span>{loading ? "Відправка..." : "Надіслати повідомлення"}</span>
              </button>
            </form>
          </div>
        </div>

        <div className="contact-right">
          <div className="brand-banner">
            <div className="brand-model-img">
              <img src={contactImage} alt="Жіночі сумки Lurelle" />
              <div className="brand-model-fade-left" />
              <div className="brand-model-fade-right" />
            </div>
          </div>
        </div>
      </div>

      {submitted && (
        <div className="modal-overlay" onClick={() => setSubmitted(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p className="modal-mark">Готово</p>
            <h3>Дякуємо!</h3>
            <p>Ваше повідомлення успішно надіслано. Ми відповімо найближчим часом.</p>
            <button className="modal-close-btn" onClick={() => setSubmitted(false)}>
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}