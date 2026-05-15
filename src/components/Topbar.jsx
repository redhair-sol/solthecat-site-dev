import React from "react";
import { NavLink, Link } from "react-router-dom";
import { fonts } from "../theme.js";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Topbar() {
  const { language } = useLanguage();

  const labels = {
    en: {
      home: "Home",
      episodes: "Episodes",
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
      episodes: "Επεισόδια",
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
          {/* Κεντραρισμένο logo (mobile menu now lives in BottomTabBar's "More" tab) */}
          <Link to="/">
            <img
              src="/icons/soladventures.webp"
              alt="SOLadventures"
              width="240"
              height="64"
              className="!h-16 lg:!h-12 object-contain"
            />
          </Link>
        </div>
      </div>

      {/* Desktop navigation (≥1024px — tablets in portrait use bottom tab bar).
          Solid bg + inline backgroundColor fallback for older browsers (e.g. MI
          Browser) where `backdrop-blur` + opacity chain can render invisible.
          space-x-3 at lg (1024-1279px) prevents 9 nav items from clipping
          edges; restored to space-x-8 at xl: (1280px+). */}
      <nav
        className="hidden lg:block w-full bg-[var(--sol-cream)] border-b border-[var(--sol-line)] py-0.1"
        style={{ backgroundColor: "#f5efe4" }}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <div
            className={`flex justify-center space-x-3 xl:space-x-8 ${navSizeClass} font-medium`}
            style={navStyle}
          >
            <NavLink to="/" className={linkClasses} end>{t.home}</NavLink>
            <NavLink to="/episodes" className={linkClasses}>{t.episodes}</NavLink>
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
