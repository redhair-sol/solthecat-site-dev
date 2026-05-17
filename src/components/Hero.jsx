import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import './Hero.css';

// Country flags inside episode titles are pairs of regional-indicator code
// points (U+1F1E6–U+1F1FF). One pair = one flag = one country.
const FLAG_RX = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g;

// Defaults shown on first paint before episodes.json resolves. Also act as
// fallback if the fetch fails (offline / 404) so we never render 0 or NaN.
const DEFAULT_STATS = { episodes: 52, countries: 47 };

const TEXT = {
  en: {
    eyebrow: "Athens, GR · reigning since 2021",
    photoAlt: "Sol the cat",
    livePill: "LIVE · Chasing a dust mote",
    lede: (c) =>
      `A royal travel diary from ${c} countries. Mini-games, daily challenges, and a live cam from the throne.`,
    ctaPrimary: "Read adventures",
    ctaGhost: "See photos →",
    statEpisodes: "adventures",
    statCountries: "countries visited",
    statNapped: "napped today",
  },
  el: {
    // Pre-uppercased without accents — Greek typography rule: Greek capitals
    // drop their tonos. CSS text-transform: uppercase does not strip accents,
    // so we store the eyebrow in target case and the CSS rule becomes a no-op.
    eyebrow: "ΑΘΗΝΑ, GR · ΒΑΣΙΛΕΥΕΙ ΑΠΟ ΤΟ 2021",
    photoAlt: "Η γάτα Sol",
    livePill: "LIVE · Κυνηγά σκόνη",
    lede: (c) =>
      `Ένα βασιλικό ταξιδιωτικό ημερολόγιο από ${c} χώρες. Παιχνίδια, καθημερινές προκλήσεις και ζωντανή κάμερα από τον θρόνο.`,
    ctaPrimary: "Δες τις περιπέτειες",
    ctaGhost: "Φωτογραφίες →",
    statEpisodes: "περιπέτειες",
    statCountries: "χώρες",
    statNapped: "κοιμήθηκε σήμερα",
  },
};

export default function Hero({ photo = '/sol-hero.jpg', isLive = false }) {
  const { language } = useLanguage();
  const t = TEXT[language];

  // Both numbers drift as new episodes ship from new countries — derive them
  // from episodes.json instead of hardcoding. Defaults render on first paint
  // and act as the fallback if the fetch fails.
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}episodes.json`)
      .then((r) => r.json())
      .then((data) => {
        const visible = data.filter((ep) => ep.visible !== false);
        const flags = new Set();
        visible.forEach((ep) => {
          const titleStr =
            typeof ep.title === "object" ? ep.title.en || ep.title.el : ep.title;
          const m = (titleStr || "").match(FLAG_RX);
          if (m) m.forEach((f) => flags.add(f));
        });
        setStats({ episodes: visible.length, countries: flags.size });
      })
      .catch(() => { /* keep DEFAULT_STATS */ });
  }, []);

  return (
    <section className="sol-hero" lang={language}>
      <div className="sol-hero__inner">
        {/* LEFT — photo */}
        <div className="sol-hero__media">
          <img src={photo} alt={t.photoAlt} />
          {isLive && (
            <a href="/solcam" className="sol-hero__live" aria-label={t.livePill}>
              <span className="dot" />
              {t.livePill}
            </a>
          )}
        </div>

        {/* RIGHT — text */}
        <div className="sol-hero__text">
          <p className="sol-hero__eyebrow">{t.eyebrow}</p>

          <h1 className="sol-hero__title">
            {language === "el" ? (
              <>
                Γνωρίστε τη <em>Sol</em>.<br />
                Μικρή γάτα.<br />
                Μεγάλες απόψεις.
              </>
            ) : (
              <>
                Meet <em>Sol</em>.<br />
                A small cat with<br />
                big opinions.
              </>
            )}
          </h1>

          <p className="sol-hero__lede">{t.lede(stats.countries)}</p>

          <div className="sol-hero__cta">
            <a href="/adventures" className="btn btn--primary">{t.ctaPrimary}</a>
            <a href="/gallery" className="btn btn--ghost">{t.ctaGhost}</a>
          </div>

          <ul className="sol-hero__stats">
            <li><strong>{stats.episodes}</strong><span>{t.statEpisodes}</span></li>
            <li><strong>{stats.countries}</strong><span>{t.statCountries}</span></li>
            <li><strong>14h</strong><span>{t.statNapped}</span></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
