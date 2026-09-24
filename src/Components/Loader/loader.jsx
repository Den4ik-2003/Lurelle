import { useEffect, useRef } from "react";
import "./loader.css";

export default function Loader() {
  const innerRef = useRef(null);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const N = 16;
    const R = 36;
    const colors = ["#C8A27A", "#C8A27A", "#E8B4C8", "#C8A27A"];

    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 4;
      const y = (i / (N - 1)) * 260 + 20;
      const xA = R * Math.cos(t);
      const zA = R * Math.sin(t);
      const xB = R * Math.cos(t + Math.PI);
      const zB = R * Math.sin(t + Math.PI);
      const delay = (i / N) * 2;

      const nA = document.createElement("div");
      nA.className = "node node-a";
      nA.style.cssText = `left:${60 + xA - 6}px;top:${y - 6}px;transform:translateZ(${zA}px);animation-delay:${delay}s;`;
      if (i % 4 === 0) nA.style.background = colors[Math.floor(i / 4) % 4];
      inner.appendChild(nA);

      const nB = document.createElement("div");
      nB.className = "node node-b";
      nB.style.cssText = `left:${60 + xB - 5}px;top:${y - 5}px;transform:translateZ(${zB}px);animation-delay:${delay + 0.3}s;`;
      if (i % 4 === 0) nB.style.background = colors[(Math.floor(i / 4) + 2) % 4];
      inner.appendChild(nB);

      if (i % 2 === 0) {
        const dx = xB - xA;
        const dz = zB - zA;
        const len = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx) * (180 / Math.PI);
        const br = document.createElement("div");
        br.className = "bridge";
        br.style.cssText = `left:${60 + xA}px;top:${y}px;width:${len * 1.6}px;transform:rotateY(${angle}deg);animation-delay:${delay * 0.5}s;`;
        inner.appendChild(br);
      }

      if (i % 3 === 0) {
        for (let p = 0; p < 2; p++) {
          const pt = document.createElement("div");
          pt.className = "particle";
          const px = 60 + xA + (Math.random() - 0.5) * 20;
          const py = y + (Math.random() - 0.5) * 20;
          const pdx = (Math.random() - 0.5) * 60;
          const pdy = (Math.random() - 0.5) * 60;
          const pc = colors[Math.floor(Math.random() * colors.length)];
          pt.style.cssText = `left:${px}px;top:${py}px;background:${pc};--dx:${pdx}px;--dy:${pdy}px;animation-delay:${Math.random() * 3}s;animation-duration:${2 + Math.random() * 2}s;`;
          inner.appendChild(pt);
        }
      }
    }

    return () => {
      inner.innerHTML = "";
    };
  }, []);

  const text = "Завантаження";

  return (
    <div className="loader-wrapper">
      <div className="ring-pulse" style={{ width: "200px", height: "200px", animationDelay: "0s" }} />
      <div className="ring-pulse" style={{ width: "280px", height: "280px", animationDelay: "0.8s" }} />
      <div className="ring-pulse" style={{ width: "360px", height: "360px", animationDelay: "1.6s" }} />

      <div style={{ position: "relative" }}>
        <div className="scan-line" />
        <div className="helix-scene">
          <div className="helix-inner" ref={innerRef} />
        </div>
      </div>

      <p className="loader-text">
        {text.split("").map((ch, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            {ch}
          </span>
        ))}
      </p>
    </div>
  );
}