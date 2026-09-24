import { useEffect, useRef } from "react"
import "./whyUs.css"

const FEATURES = [
  {
    id: "delivery",
    label: "Швидка доставка",
    detail: "1–3 дні по всій Україні",
    stat: "1–3",
    unit: "дні",
    desc: "Відправляємо в день замовлення — Нова Пошта, Укрпошта, кур'єр.",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="why-icon-svg">
        <rect x="4" y="22" width="36" height="24" rx="4" className="why-icon-stroke" strokeWidth="2.5" />
        <path d="M40 30h8l8 8v8h-16V30z" className="why-icon-stroke" strokeWidth="2.5" />
        <circle cx="16" cy="50" r="5" className="why-icon-stroke" strokeWidth="2.5" />
        <circle cx="48" cy="50" r="5" className="why-icon-stroke" strokeWidth="2.5" />
        <path d="M12 32h16" className="why-icon-stroke why-icon-dash" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 27h12" className="why-icon-stroke why-icon-dash2" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "quality",
    label: "Перевірена якість",
    detail: "50+ моделей у каталозі",
    stat: "50+",
    unit: "моделей",
    desc: "Кожен постачальник проходить ручний відбір. Жодного контрафакту.",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="why-icon-svg">
        <path
          d="M32 6l6.2 12.6L52 20.5l-10 9.7 2.4 13.8L32 38l-12.4 6L22 30.2 12 20.5l13.8-1.9L32 6z"
          className="why-icon-stroke"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M24 33l5 5 11-11" className="why-icon-check" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "price",
    label: "Вигідні ціни",
    detail: "Акції кожного тижня",
    stat: "−30%",
    unit: "avg знижка",
    desc: "Регулярні розпродажі, програма лояльності та кешбек для постійних покупців.",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="why-icon-svg">
        <circle cx="32" cy="32" r="26" className="why-icon-stroke" strokeWidth="2.5" />
        <path d="M32 14v4M32 46v4M14 32h4M46 32h4" className="why-icon-stroke" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 38c0-4 4-6 10-6s10 2 10-4-6-6-10-6" className="why-icon-stroke" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 22v2M28 42v-2" className="why-icon-stroke" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function WhyUs() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".why-card")
    if (!cards) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("why-card--visible")
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    cards.forEach((card) => io.observe(card))
    return () => io.disconnect()
  }, [])

  return (
    <section className="why-uss container" ref={sectionRef}>
      <div className="why-header">
        <p className="why-eyebrow">Наші переваги</p>
        <h2 className="why-title">
          Чому обирають <span>Lurelle</span>?
        </h2>
      </div>

      <div className="why-grid2">
        {FEATURES.map((f, i) => (
          <div
            className="why-card"
            key={f.id}
            data-id={f.id}
            style={{ "--delay": `${i * 0.14}s` }}
          >
            <div className="why-card-line" aria-hidden="true" />

            <div className="why-icon-wrap" aria-hidden="true">
              <div className="why-icon-ring" />
              {f.icon}
            </div>

            <div className="why-body">
              <p className="why-label">{f.label}</p>
              <p className="why-detail">{f.detail}</p>
              <p className="why-desc">{f.desc}</p>
            </div>

            <div className="why-stat">
              <span className="why-stat-num">{f.stat}</span>
              <span className="why-stat-unit">{f.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}