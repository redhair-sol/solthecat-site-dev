import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

const content = {
  en: {
    tagline: "The feline queen's journey around the world.",
    nav: "Explore",
    links: [
      { to: "/adventures", label: "Adventures" },
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
    // Pre-uppercased without accents — Greek typography rule: Greek capitals
    // drop their tonos. CSS text-transform: uppercase does not strip the
    // accent, so we store the section labels in their target case.
    nav: "ΕΞΕΡΕΥΝΗΣΗ",
    links: [
      { to: "/adventures", label: "Περιπέτειες" },
      { to: "/map", label: "Χάρτης" },
      { to: "/gallery", label: "Gallery" },
      { to: "/games", label: "Παιχνίδια" },
      { to: "/whoissol", label: "Σχετικά" },
      { to: "/contact", label: "Επικοινωνία" },
    ],
    rights: "Με επιφύλαξη παντός δικαιώματος.",
    follow: "ΑΚΟΛΟΥΘΗΣΕ ΤΗ SOL",
    madeIn: "Φτιαγμένο με 🐾 στην Ελλάδα",
  },
};

export default function Footer() {
  const { language } = useLanguage();
  const t = content[language] || content.en;
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--sol-line)] bg-[var(--sol-cream)] mt-6 sm:mt-10 lg:mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-9 lg:py-10 grid gap-6 sm:gap-7 lg:gap-8 lg:grid-cols-3">
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
          <p className="mt-3 text-sm text-[var(--sol-ink-soft)] max-w-xs">
            {t.tagline}
          </p>
          <p className="mt-2 text-xs text-[var(--sol-ink-soft)]">
            #soladventures · @solthecat01
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
            className="inline-flex items-center gap-2 text-sm text-[var(--sol-ink)] hover:text-[var(--sol-mauve)] hover:underline underline-offset-4 transition-colors"
          >
            <span aria-hidden="true">🐾</span>
            <span>@solthecat01 on Instagram</span>
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--sol-line)]">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5 text-xs text-[var(--sol-ink-soft)] flex flex-col items-center gap-2 text-center">
          <span>© {year} sol the cat · {t.rights}</span>
          <span>{t.madeIn}</span>
        </div>
      </div>
    </footer>
  );
}
