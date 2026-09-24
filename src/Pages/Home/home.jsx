import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { TopDeals } from "../../Components/TopDeals/topDeals";
import "./home.css";
import SaleTimer from "../../Components/SaleTimer/saleTimer";
import WhyUs from "../../Components/WhyUs/whyUs";
import HeroImage from "../../assets/Images/main.webp";
import Gallery from "../../Components/Gallery/gallery";

export default function Home() {
  return (
    <div>
      <Helmet>
        <title>
          Жіночі сумки | Premium Collection | Lurelle
        </title>

        <meta
          name="description"
          content="Купити жіночі сумки в Україні. Шкіряні сумки, клатчі, крос-боді та інший преміум аксесуар. Оригінальний стиль, висока якість та швидка доставка по всій Україні."
        />

        <meta
          name="keywords"
          content="жіночі сумки, шкіряні сумки, преміум аксесуари, дизайнерські сумки, купити сумку Україна, клатч, крос-боді"
        />

        <meta
          property="og:title"
          content="Жіночі сумки | Premium Collection | Lurelle"
        />
        <meta
          property="og:description"
          content="Жіночі сумки та аксесуари для тих, хто цінує комфорт, якість і стиль. Оригінал, гарантія якості, швидка доставка по всій Україні."
        />
        <meta property="og:url" content="https://lurelle.netlify.app/" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://lurelle.netlify.app/" />
      </Helmet>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Преміум якість</span>

          <h1>
            Стиль, що
            <br />
            <span className="hero-accent">виділяє тебе</span>
          </h1>

          <p>
            Жіночі сумки та аксесуари для тих, хто цінує комфорт, якість і
            стиль.
          </p>

          <div className="hero-actions">
            <NavLink to="/products" className="hero-btn-primary">
              Перейти до товарів <span className="hero-btn-arrow">→</span>
            </NavLink>
            <NavLink to="/about" className="hero-btn-secondary">
              Дізнатись більше
            </NavLink>
          </div>

        </div>

        <div className="hero-media">
          <img
            src={HeroImage}
            alt="Lurelle — жіночі сумки"
            className="hero-image"
          />
        </div>
      </section>

      <TopDeals />

      <Gallery />

      <SaleTimer />

      <WhyUs />
    </div>
  );
}