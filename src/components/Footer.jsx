import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

const content = {
  en: {
    tagline: "The feline queen's journey around the world.",
    nav: "Explore",
    links: [
      { to: "/episodes", label: "Episodes" },
      { to: "/map", label: "Map" },
      { to: "/gallery", label: "Gallery" },
      { to: "/games", label: "Games" },
      { to: "/whoissol", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
    rights: "All rights reserved.",
    follow: "Follow Sol",
    madeIn: "Made with 🐾 in Greece",
  },
  el: {
    tagline: "Το ταξίδι της αιλουροειδούς βασίλισσας ανά τον κόσμο.",
    nav: "Εξερεύνηση",
    links: [
      { to: "/episodes", label: "Επεισόδια" },
      { to: "/map", label: "Χάρτης" },
      { to: "/gallery", label: "Gallery" },
      { to: "/games", label: "Παιχνίδια" },
      { to: "/whoissol", label: "Σχετικά" },
      { to: "/contact", label: "Επικοινωνία" },
    ],
    rights: "Με επιφύλαξη παντός δικαιώματος.",
    follow: "Ακολούθησε τη Sol",
    madeIn: "Φτιαγμένο με 🐾 στην Ελλάδα",
  },
};

export default function Footer() {
  const { language } = useLanguage();
  const t = content[language] || content.en;
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--sol-line)] bg-[var(--sol-cream)] mt-16">
      <div className="max-w-screen-xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link
            to="/"
            className="no-underline"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "1.6rem",
              color: "var(--sol-ink)",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
            aria-label="sol the cat"
          >
            sol <span style={{ color: "var(--sol-sun)", fontStyle: "italic" }}>the</span> cat
          </Link>
          <p className="mt-3 text-sm text-[var(--sol-ink-soft)] max-w-xs">
            {t.tagline}
          </p>
        </div>

        <nav aria-label={t.nav}>
          <h2 className="text-xs uppercase tracking-wider text-[var(--sol-ink-soft)] mb-3">
            {t.nav}
          </h2>
          <ul className="space-y-2">
            {t.links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-[var(--sol-ink)] hover:text-[var(--sol-mauve)] hover:underline underline-offset-4 transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs uppercase tracking-wider text-[var(--sol-ink-soft)] mb-3">
            {t.follow}
          </h2>
          <a
            href="https://www.instagram.com/solthecat01/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--sol-ink)] hover:text-[var(--sol-mauve)] hover:underline underline-offset-4 transition-colors"
          >
            @solthecat01 · Instagram
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--sol-line)]">
        <div className="max-w-screen-xl mx-auto px-4 py-4 text-xs text-[var(--sol-ink-soft)] flex flex-col sm:flex-row gap-2 sm:justify-between">
          <span>© {year} sol the cat. {t.rights}</span>
          <span>{t.madeIn}</span>
        </div>
      </div>
    </footer>
  );
}
