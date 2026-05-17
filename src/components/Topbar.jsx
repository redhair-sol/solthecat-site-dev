import React from "react";
import { NavLink, Link } from "react-router-dom";
import { fonts } from "../theme.js";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Topbar() {
  const { language, setLanguage } = useLanguage();

  const labels = {
    en: {
      home: "Home",
      episodes: "Adventures",
      map: "Map",
      gallery: "Gallery",
      games: "Games",
      solcam: "SolCam",
      about: "About",
      shop: "Shop",
      contact: "Contact",
    },
    el: {
      home: "Αρχική",
      episodes: "Περιπέτειες",
      map: "Χάρτης",
      gallery: "Γκαλερί",
      games: "Παιχνίδια",
      solcam: "SolCam",
      about: "Σχετικά",
      shop: "Κατάστημα",
      contact: "Επικοινωνία",
    },
  };
  const t = labels[language];
  const navStyle = fonts.navStyleFor(language);
  const navSizeClass = fonts.navSizeClassFor(language, "text-2xl");

  const linkClasses = ({ isActive }) =>
    // Tighter horizontal padding at lg: (1024-1279px) so all 9 nav items fit
    // without clipping Home/Contact at the edges. Restored at xl: (1280px+).
    `px-2 xl:px-4 py-2 no-underline transition-colors ${
      isActive
        ? "text-[#1a1614] border-b-2 border-[#d4a5a5]"
        : "text-[#4a3f37] hover:text-[#1a1614]"
    }`;

  return (
    // Με position:fixed και πολύ υψηλό z-index
    <header className="fixed top-0 left-0 z-[9999] w-full">
      <div className="w-full bg-[var(--sol-cream)] py-1 shadow-sm relative">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-center relative h-16">
          {/* Κεντραρισμένο logo — text wordmark "sol the cat". Italic gold "the"
              mirrors the Hero "Meet Sol" accent. Proper drawn asset can swap
              this back to an <img> later without other Topbar changes. */}
          <Link
            to="/"
            aria-label="sol the cat"
            className="no-underline"
            style={{
              fontFamily: "var(--sol-serif)",
              color: "var(--sol-ink)",
              fontSize: "clamp(2rem, 5vw, 2.4rem)",
              lineHeight: 1,
              letterSpacing: "-0.01em",
              fontWeight: 400,
            }}
          >
            sol <span style={{ color: "var(--sol-sun)", fontStyle: "italic" }}>the</span> cat
            <span
              aria-hidden="true"
              style={{
                color: "var(--sol-sun)",
                fontSize: "0.7em",
                marginLeft: "0.4em",
                verticalAlign: "middle",
                position: "relative",
                top: "-0.2em",
              }}
            >
              ♛
            </span>
          </Link>

          {/* Language toggle — lives in the logo bar (its own row) instead of
              the nav row. Greek nav labels are ~40% wider than English and
              were colliding with the toggle when it was absolute-positioned
              inside the nav. The logo bar always has free space on the right
              regardless of language. */}
          <div
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[0.8rem] sm:text-sm select-none"
            aria-label="Language"
          >
            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              className={`transition-colors px-1 ${
                language === "en"
                  ? "text-[var(--sol-ink)] font-medium"
                  : "text-[var(--sol-ink-soft)] hover:text-[var(--sol-ink)]"
              }`}
            >
              EN
            </button>
            <span className="text-[var(--sol-ink-soft)] opacity-40">|</span>
            <button
              type="button"
              onClick={() => setLanguage("el")}
              aria-pressed={language === "el"}
              className={`transition-colors px-1 ${
                language === "el"
                  ? "text-[var(--sol-ink)] font-medium"
                  : "text-[var(--sol-ink-soft)] hover:text-[var(--sol-ink)]"
              }`}
            >
              GR
            </button>
          </div>
        </div>
      </div>

      {/* Desktop navigation (≥1024px — tablets in portrait use bottom tab bar).
          Solid bg + inline backgroundColor fallback for older browsers (e.g. MI
          Browser) where `backdrop-blur` + opacity chain can render invisible.
          space-x-3 at lg (1024-1279px) prevents 9 nav items from clipping
          edges; restored to space-x-8 at xl: (1280px+). */}
      <nav
        className="hidden xl:block w-full bg-[var(--sol-cream)] border-b border-[var(--sol-line)] py-0.1"
        style={{ backgroundColor: "#f5efe4" }}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <div
            className={`flex justify-center space-x-3 xl:space-x-8 ${navSizeClass} font-medium`}
            style={navStyle}
          >
            <NavLink to="/" className={linkClasses} end>{t.home}</NavLink>
            <NavLink to="/adventures" className={linkClasses}>{t.episodes}</NavLink>
            <NavLink to="/map" className={linkClasses}>{t.map}</NavLink>
            <NavLink to="/gallery" className={linkClasses}>{t.gallery}</NavLink>
            <NavLink to="/games" className={linkClasses}>{t.games}</NavLink>
            <NavLink to="/solcam" className={linkClasses}>{t.solcam}</NavLink>
            <NavLink to="/whoissol" className={linkClasses}>{t.about}</NavLink>
            <NavLink to="/shop" className={linkClasses}>{t.shop}</NavLink>
            <NavLink to="/contact" className={linkClasses}>{t.contact}</NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}
