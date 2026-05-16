import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import './Hero.css';

const TEXT = {
  en: {
    eyebrow: "Athens, GR · reigning since 2021",
    photoAlt: "Sol the cat",
    livePill: "LIVE · Chasing a dust mote",
    lede:
      "A royal travel diary from 47 countries. Mini-games, daily challenges, and a live cam from the throne.",
    ctaPrimary: "Read episodes",
    ctaGhost: "See photos →",
    statEpisodes: "episodes",
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
    lede:
      "Ένα βασιλικό ταξιδιωτικό ημερολόγιο από 47 χώρες. Παιχνίδια, καθημερινές προκλήσεις και ζωντανή κάμερα από τον θρόνο.",
    ctaPrimary: "Δες τα επεισόδια",
    ctaGhost: "Φωτογραφίες →",
    statEpisodes: "επεισόδια",
    statCountries: "χώρες",
    statNapped: "κοιμήθηκε σήμερα",
  },
};

export default function Hero({ photo = '/sol-hero.jpg' }) {
  const { language } = useLanguage();
  const t = TEXT[language];

  return (
    <section className="sol-hero" lang={language}>
      <div className="sol-hero__inner">
        {/* LEFT — photo */}
        <div className="sol-hero__media">
          <img src={photo} alt={t.photoAlt} />
          <div className="sol-hero__live">
            <span className="dot" />
            {t.livePill}
          </div>
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

          <p className="sol-hero__lede">{t.lede}</p>

          <div className="sol-hero__cta">
            <a href="/episodes" className="btn btn--primary">{t.ctaPrimary}</a>
            <a href="/gallery" className="btn btn--ghost">{t.ctaGhost}</a>
          </div>

          <ul className="sol-hero__stats">
            <li><strong>52</strong><span>{t.statEpisodes}</span></li>
            <li><strong>47</strong><span>{t.statCountries}</span></li>
            <li><strong>14h</strong><span>{t.statNapped}</span></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
