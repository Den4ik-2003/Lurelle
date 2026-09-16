// src/Components/CookieConsent/CookieConsent.jsx
import { useState, useEffect } from 'react';
import { getConsent, saveConsent } from '../../utils/cookieConsent';
import './CookieConsent.css';

const DEFAULT_CATEGORIES = { analytics: false, marketing: false };

function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    const existing = getConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setCategories({ analytics: !!existing.analytics, marketing: !!existing.marketing });
    }

    // Дозволяє відкрити панель повторно (напр. з посилання у футері)
    const handleReopen = () => {
      const current = getConsent();
      if (current) {
        setCategories({ analytics: !!current.analytics, marketing: !!current.marketing });
      }
      setVisible(true);
      setShowSettings(true);
    };

    window.addEventListener('open-cookie-settings', handleReopen);
    return () => window.removeEventListener('open-cookie-settings', handleReopen);
  }, []);

  const acceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
    setShowSettings(false);
  };

  const rejectOptional = () => {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
    setShowSettings(false);
  };

  const saveSettings = () => {
    saveConsent(categories);
    setVisible(false);
    setShowSettings(false);
  };

  const toggleCategory = (key) => {
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent-overlay" role="dialog" aria-modal="true" aria-label="Налаштування файлів cookie">
      <div className="cookie-consent-box">
        {!showSettings ? (
          <>
            <h2 className="cookie-consent-title">🍪 Ми використовуємо файли cookie</h2>
            <p className="cookie-consent-text">
              Ми використовуємо файли cookie, щоб сайт працював коректно, запам’ятовував ваші
              налаштування та допомагав нам покращувати роботу сайту. Ви можете дозволити всі
              cookie або налаштувати їх використання.
            </p>
            <div className="cookie-consent-actions">
              <button className="cookie-btn cookie-btn-primary" onClick={acceptAll}>
                Прийняти всі
              </button>
              <button className="cookie-btn cookie-btn-secondary" onClick={() => setShowSettings(true)}>
                Налаштувати
              </button>
              <button className="cookie-btn cookie-btn-ghost" onClick={rejectOptional}>
                Відхилити необов’язкові
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="cookie-consent-title">Налаштування cookie</h2>

            <div className="cookie-category">
              <div className="cookie-category-info">
                <span className="cookie-category-name">Необхідні</span>
                <span className="cookie-category-desc">
                  Забезпечують базову роботу сайту. Завжди активні.
                </span>
              </div>
              <label className="cookie-switch cookie-switch-disabled">
                <input type="checkbox" checked disabled readOnly />
                <span className="cookie-switch-slider" />
              </label>
            </div>

            <div className="cookie-category">
              <div className="cookie-category-info">
                <span className="cookie-category-name">Аналітичні</span>
                <span className="cookie-category-desc">
                  Допомагають зрозуміти, як відвідувачі користуються сайтом.
                </span>
              </div>
              <label className="cookie-switch">
                <input
                  type="checkbox"
                  checked={categories.analytics}
                  onChange={() => toggleCategory('analytics')}
                />
                <span className="cookie-switch-slider" />
              </label>
            </div>

            <div className="cookie-category">
              <div className="cookie-category-info">
                <span className="cookie-category-name">Маркетингові</span>
                <span className="cookie-category-desc">
                  Використовуються для показу релевантної реклами.
                </span>
              </div>
              <label className="cookie-switch">
                <input
                  type="checkbox"
                  checked={categories.marketing}
                  onChange={() => toggleCategory('marketing')}
                />
                <span className="cookie-switch-slider" />
              </label>
            </div>

            <div className="cookie-consent-actions">
              <button className="cookie-btn cookie-btn-primary" onClick={saveSettings}>
                Зберегти налаштування
              </button>
              <button className="cookie-btn cookie-btn-ghost" onClick={() => setShowSettings(false)}>
                Назад
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CookieConsent;