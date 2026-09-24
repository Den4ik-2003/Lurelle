import "./gallery.css"

import img1 from "../../assets/Images/img1.webp"
import img2 from "../../assets/Images/img2.webp"
import img3 from "../../assets/Images/img3.webp"
import img4 from "../../assets/Images/img4.webp"
import img5 from "../../assets/Images/img5.webp"
import img6 from "../../assets/Images/img6.webp"
import img7 from "../../assets/Images/img7.webp"
import img8 from "../../assets/Images/img8.webp"

const topImages = [
  { src: img2, alt: "Образ 2" },
  { src: img3, alt: "Образ 3" },
  { src: img4, alt: "Образ 4" },
]

const bottomImages = [
  { src: img5, alt: "Образ 5" },
  { src: img6, alt: "Образ 6" },
  { src: img7, alt: "Образ 7" },
  { src: img8, alt: "Образ 8" },
]

export default function Gallery() {
  return (
    <section className="gallery-section container">
      <div className="gallery-blob gallery-blob--a" aria-hidden="true" />
      <div className="gallery-blob gallery-blob--b" aria-hidden="true" />

      <div className="gallery-inner">
        <div className="gallery-header">
          <div className="gallery-meta">
            <p className="gallery-eyebrow">Галерея</p>
            <h2 className="gallery-headline">
              Стиль у <span>деталях</span>
            </h2>
            <p className="gallery-sub">
              Кожна сумка — це більше, ніж аксесуар.<br />
              Це впевненість, характер і увага до деталей.
            </p>
          </div>
        </div>

        <div className="gallery-grid">
          <div className="gallery-item gallery-item--tall">
            <img src={img1} alt="Образ 1" loading="lazy" />
          </div>

          <div className="gallery-right">
            <div className="gallery-row">
              {topImages.map((img, i) => (
                <div className="gallery-item" key={`top-${i}`}>
                  <img src={img.src} alt={img.alt} loading="lazy" />
                </div>
              ))}
            </div>
            <div className="gallery-row">
              {bottomImages.map((img, i) => (
                <div className="gallery-item" key={`bottom-${i}`}>
                  <img src={img.src} alt={img.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}