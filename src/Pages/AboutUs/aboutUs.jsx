import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import "./aboutUs.css";
import History from "../../assets/Images/history.webp";
import Mission from "../../assets/Images/mission.webp";
import qualityIcon from "../../assets/Icons/security.svg";
import brandIcon from "../../assets/Icons/star.svg";
import clientIcon from "../../assets/Icons/delivery.svg";
import checkIcon from "../../assets/Icons/check.svg";

const FEATURES = [
  {
    icon: qualityIcon,
    title: "Преміальна якість",
    text: "Натуральна шкіра та ретельна фурнітура",
  },
  {
    icon: clientIcon,
    title: "Клієнт на першому місці",
    text: "Ваш комфорт і довіра — наш пріоритет",
  },
];

const MISSION_POINTS = [
  "Тільки оригінальний товар",
  "Постійне оновлення асортименту",
  "Увага до деталей у кожній сумці",
  "Підтримка та турбота про клієнтів",
];

const STATS = [
  { num: "2+", label: "роки досвіду" },
  { num: "100+", label: "задоволених клієнток" },
  { num: "50+", label: "моделей сумок" },
  { num: "1–3 дні", label: "швидка доставка" },
];

export default function AboutUs() {
  const revealRef = useRef(null);

  useEffect(() => {
    const els = revealRef.current?.querySelectorAll("[data-reveal]");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="about-page" ref={revealRef}>
      <Helmet>
        <title>Про нас — Lurelle | Жіночі сумки в Україні</title>
        <meta
          name="description"
          content="Lurelle — офіційний магазин жіночих сумок в Україні. Шкіряні сумки, клатчі, крос-боді та преміум аксесуари. Оригінальна якість, швидка доставка по всій Україні."
        />
        <meta
          name="keywords"
          content="жіночі сумки, купити сумку Україна, шкіряні сумки Lurelle, клатч, крос-боді, преміум аксесуари"
        />
        <meta
          property="og:title"
          content="Про нас — Lurelle | Жіночі сумки"
        />
        <meta
          property="og:description"
          content="Стиль, а не просто аксесуар. Шкіряні сумки, клатчі та крос-боді для тих, хто цінує якість і впевненість у кожній деталі."
        />
        <meta property="og:url" content="https://lurelle.netlify.app/about" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://lurelle.netlify.app/about" />
      </Helmet>

      <section className="about-hero">
        <div className="about-hero__text" data-reveal data-reveal-dir="left">
          <p className="about-eyebrow">Про нас</p>
          <h1 className="about-hero__title">
            Про <span>Lurelle</span>
          </h1>
          <p className="about-hero__lead">
            Lurelle — це більше, ніж сумки. Це стиль життя. Ми створюємо
            жіночі сумки для тих, хто цінує якість, комфорт і впевненість у
            кожній деталі образу.
          </p>
          <p className="about-hero__lead">
            Наша місія — допомогти кожній жінці підкреслити індивідуальність
            та впевненість через лаконічний дизайн, преміальні матеріали та
            увагу до деталей.
          </p>
        </div>

        <div className="about-hero__media" data-reveal data-reveal-dir="right">
          <div className="about-img-frame">
            <img src={History} alt="Жіночі сумки Lurelle" />
          </div>
        </div>
      </section>

      <section className="about-features">
        {FEATURES.map((f, i) => (
          <div
            className="feature-item"
            key={i}
            data-reveal
            style={{ "--delay": `${i * 0.1}s` }}
          >
            <img className="feature-item__icon" src={f.icon} alt="" />
            <div className="feature-item__body">
              <p className="feature-item__title">{f.title}</p>
              <p className="feature-item__text">{f.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="about-mission">
        <div className="about-mission__text" data-reveal data-reveal-dir="left">
          <p className="about-eyebrow">Наша місія</p>
          <h2>Створювати стиль, який надихає</h2>
          <p>
            Ми віримо, що сумка — це спосіб самовираження. Наша місія —
            допомогти кожній жінці підкреслити індивідуальність через якісний
            брендовий аксесуар.
          </p>

          <ul className="mission-list">
            {MISSION_POINTS.map((point, i) => (
              <li key={i}>
                <img className="mission-list__icon" src={checkIcon} alt="" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="about-mission__media"
          data-reveal
          data-reveal-dir="right"
        >
          <div className="about-img-frame">
            <img src={Mission} alt="Магазин жіночих сумок Lurelle" />
          </div>
        </div>
      </section>

      <section className="about-stats">
        {STATS.map((s, i) => (
          <div
            className="stat-item"
            key={i}
            data-reveal
            style={{ "--delay": `${i * 0.08}s` }}
          >
            <span className="stat-item__num">{s.num}</span>
            <span className="stat-item__label">{s.label}</span>
          </div>
        ))}
      </section>
    </div>
  );
}