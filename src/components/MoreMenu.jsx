// src/components/MoreMenu.jsx
//
// Bottom-sheet drawer used by BottomTabBar's "More" tab.
// Slides up from the bottom (native mobile pattern), shows secondary
// routes (Gallery, SolCam, About, Shop, Contact) — primary routes
// already live in the bottom tab bar itself.
//
// REVERT (back to side-drawer style):
//   git diff this file from previous commit, or restore the earlier
//   side-drawer version. Public API (isOpen, onClose) is unchanged,
//   so callers don't need updates.

import React from "react";
import { NavLink } from "react-router-dom";
import { X, Image as ImageIcon, Video, User, ShoppingBag, Mail, Instagram } from "lucide-react";
// motion is referenced as <motion.img> in JSX below — eslint without
// eslint-plugin-react cannot track JSX-only identifiers as "used".
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { fonts } from "../theme.js";
import { useLanguage } from "../context/LanguageContext.jsx";

const items = [
  { to: "/gallery", key: "gallery", icon: ImageIcon },
  { to: "/solcam", key: "solcam", icon: Video },
  { to: "/whoissol", key: "about", icon: User },
  { to: "/shop", key: "shop", icon: ShoppingBag },
  { to: "/contact", key: "contact", icon: Mail },
];

export default function MoreMenu({ isOpen, onClose }) {
  const { language, setLanguage } = useLanguage();

  const labels = {
    en: {
      language: "Language",
      gallery: "Gallery",
      solcam: "SolCam",
      about: "About",
      shop: "Shop",
      contact: "Contact",
    },
    el: {
      language: "Γλώσσα",
      gallery: "Γκαλερί",
      solcam: "SolCam",
      about: "Σχετικά",
      shop: "Κατάστημα",
      contact: "Επικοινωνία",
    },
  };
  const t = labels[language];
  const navStyle = fonts.navStyleFor(language);
  const navSizeClass = fonts.navSizeClassFor(language, "text-2xl");

  return (
    <>
      {/* Backdrop — covers whole viewport including Topbar. Inline rgba fallback
          ensures dimming even in browsers that ignore backdrop-blur (MI Browser). */}
      <div
        className={`fixed inset-0 z-[10000] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[10001] transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label="More navigation"
      >
        <div
          className="bg-gradient-to-b from-[var(--sol-cream)] to-[var(--sol-cream-2)] rounded-t-3xl shadow-[0_-8px_30px_rgba(26,22,20,0.12)] max-h-[85vh] overflow-y-auto"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Drag handle (visual only) — slim sol-line bar */}
          <div className="flex justify-center pt-3 pb-3">
            <div className="w-9 h-[3px] bg-[var(--sol-line)] rounded-full" />
          </div>

          {/* Header — close button only. The "Royal stops" tagline was
              removed: the drawer already carries a drag handle, LANGUAGE
              row, 5 nav items, an Instagram row, and the Sol image — the
              tagline was decoration competing for attention. */}
          <div className="flex items-center justify-end px-6 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#4a3f37] hover:text-[#d4a5a5] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language toggle — first item, before nav links. Standard mobile
              pattern: language switching lives in the same drawer as the
              secondary nav so the user finds it where they already opened
              for "more options". */}
          <div className="px-6 pb-4 flex items-center gap-2 text-sm">
            <span className="text-[#4a3f37] uppercase tracking-wider text-xs">
              {t.language}
            </span>
            <div className="flex items-center gap-1.5 ml-auto select-none">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
                className={`transition-colors px-1 ${
                  language === "en"
                    ? "text-[#1a1614] font-medium"
                    : "text-[#4a3f37] hover:text-[#1a1614]"
                }`}
              >
                EN
              </button>
              <span className="text-[#4a3f37] opacity-40">|</span>
              <button
                type="button"
                onClick={() => setLanguage("el")}
                aria-pressed={language === "el"}
                className={`transition-colors px-1 ${
                  language === "el"
                    ? "text-[#1a1614] font-medium"
                    : "text-[#4a3f37] hover:text-[#1a1614]"
                }`}
              >
                GR
              </button>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="px-3 pb-2 flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-3.5 rounded-xl transition-colors ${
                      isActive
                        ? "border-l-2 border-[#d4a5a5] pl-[14px] pr-4 text-[#1a1614] font-medium"
                        : "px-4 text-[#4a3f37] hover:bg-[#1a1614]/5 active:bg-[#1a1614]/10"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span
                    className={navSizeClass}
                    style={navStyle}
                  >
                    {t[item.key]}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Social — Instagram row. Moved out of a global floating FAB so it
              stops covering hero copy on every mobile page; lives alongside the
              other secondary entry points instead. */}
          <div className="px-3 pt-3 mt-2 border-t border-[var(--sol-line)]">
            <a
              href="https://www.instagram.com/solthecat01/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#4a3f37] hover:bg-[#1a1614]/5 active:bg-[#1a1614]/10 transition-colors"
            >
              <Instagram className="w-5 h-5" aria-hidden="true" />
              <span className={navSizeClass} style={navStyle}>
                {language === "el" ? "Ακολούθησε στο Instagram" : "Follow on Instagram"}
              </span>
            </a>
          </div>

          {/* Draggable Sol — brand element, can be moved around */}
          <div className="flex justify-end px-6 pb-4">
            <motion.img
              src="/images/SOL.webp"
              alt="Sol the Cat"
              className="w-24 h-24 object-contain rounded-xl cursor-grab active:cursor-grabbing select-none"
              drag
              dragConstraints={{ top: -120, bottom: 0, left: -220, right: 20 }}
              dragElastic={0.2}
              animate={{ x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              draggable="false"
            />
          </div>
        </div>
      </div>
    </>
  );
}
