import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./notfound.css";

export default function NotFound() {
  return (
    <div className="notfound">
      <Helmet>
        <title>404 — Сторінку не знайдено | Lurelle</title>
        <meta name="description" content="Сторінку не знайдено. Поверніться на головну сторінку Lurelle." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="notfound-field">
        <div className="notfound-lines">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="field-line" />
          ))}
          <div className="field-center-circle" />
        </div>
      </div>

      <div className="notfound-content">
        <div className="notfound-number">
          <span className="n4">4</span>
          <span className="n0">0</span>
          <span className="n4">4</span>
        </div>
        <p className="notfound-msg">Схоже, ця сторінка загубилась десь у наших сумках</p>
        <NavLink to="/" className="notfound-btn">
          Повернутись на головну
        </NavLink>
      </div>
    </div>
  );
}