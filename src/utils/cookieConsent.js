// src/utils/cookieConsent.js
const STORAGE_KEY = 'cookie_consent';

// Зчитати збережену згоду. Повертає null, якщо вибір ще не зроблено.
export function getConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Зберегти вибір користувача. necessary завжди true.
export function saveConsent(consent) {
  const payload = {
    necessary: true,
    analytics: !!consent.analytics,
    marketing: !!consent.marketing,
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // localStorage недоступний (приватний режим тощо) — просто ігноруємо
  }
  // Повідомляємо решту застосунку, що згода змінилась
  window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: payload }));
  return payload;
}

// Перевірити, чи дозволена конкретна категорія
export function hasConsent(category) {
  if (category === 'necessary') return true;
  const consent = getConsent();
  return !!(consent && consent[category]);
}

// Викликати з будь-якого місця (напр. з футера), щоб знову відкрити панель налаштувань
export function openCookieSettings() {
  window.dispatchEvent(new Event('open-cookie-settings'));
}

// Приклад: підвантажити Google Analytics / Meta Pixel ЛИШЕ після згоди.
// Викликайте цю функцію один раз при старті застосунку (напр. в App.jsx),
// а також підпишіться на подію 'cookie-consent-updated', щоб скрипти
// підʼєднались одразу, як тільки користувач натисне "Прийняти всі".
export function loadTrackingScriptsIfConsented() {
  const consent = getConsent();
  if (!consent) return;

  if (consent.analytics && !window.__gaLoaded) {
    // приклад підключення GA4 — замініть G-XXXXXXX на ваш ID
    // const s = document.createElement('script');
    // s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
    // s.async = true;
    // document.head.appendChild(s);
    window.__gaLoaded = true;
  }

  if (consent.marketing && !window.__metaPixelLoaded) {
    // приклад підключення Meta Pixel
    window.__metaPixelLoaded = true;
  }
}