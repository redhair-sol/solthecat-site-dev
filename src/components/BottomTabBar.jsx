// src/components/BottomTabBar.jsx
//
// Mobile-only fixed bottom navigation bar with 4 primary tabs + "More".
// "More" opens the existing MobileMenu drawer (same component used by the
// top hamburger), so secondary routes (Gallery, SolCam, About, Shop, Contact)
// stay reachable without duplicating the menu structure.
//
// REVERT INSTRUCTIONS (if you want to remove this feature):
//   1. Delete this file (BottomTabBar.jsx)
//   2. In src/App.jsx: remove the BottomTabBar import + <BottomTabBar /> usage
//   3. In src/App.jsx: change `pb-20 md:pb-0` back to no padding-bottom class
// The rest of the app (Topbar, Sidebar, MobileMenu) stays untouched.

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, Map, Gamepad2, Menu } from "lucide-react";
import MoreMenu from "./MoreMenu.jsx";
import { fonts } from "../theme.js";
import { useLanguage } from "../context/LanguageContext.jsx";

const tabs = [
  { to: "/", key: "home", icon: Home, end: true },
  { to: "/adventures", key: "episodes", icon: BookOpen },
  { to: "/map", key: "map", icon: Map },
  { to: "/games", key: "games", icon: Gamepad2 },
];

export default function BottomTabBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { language } = useLanguage();

  const labels = {
    en: { home: "Home", episodes: "Adventures", map: "Map", games: "Games", more: "More" },
    el: { home: "Αρχική", episodes: "Περιπέτειες", map: "Χάρτης", games: "Παιχνίδια", more: "Περισσότερα" },
  };
  const t = labels[language];

  const baseTab =
    "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors duration-150";
  const inactiveTab = "text-[#4a3f37] hover:text-[#1a1614]";
  const activeTab = "text-[#1a1614]";
  const labelStyle = fonts.navStyleFor(language);
  const labelSizeClass = fonts.navSizeClassFor(language, "text-[0.95rem]");

  return (
    <>
      <nav
        className="xl:hidden fixed bottom-0 left-0 right-0 z-[1100]
                   border-t border-[var(--sol-line)]
                   shadow-[0_-2px_10px_rgba(26,22,20,0.06)]"
        style={{
          // Inline style fallbacks for older browsers / strict content filters
          // (e.g. MI Browser) where Tailwind arbitrary values or backdrop-blur
          // may not apply correctly. Solid bg (no transparency) avoids the
          // "invisible bar" failure mode of `bg/95 + backdrop-blur` chain.
          backgroundColor: "#f5efe4",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
        aria-label="Primary mobile navigation"
      >
        <div className="flex items-stretch justify-around max-w-screen-sm mx-auto">
          {tabs.map((tab) => {
            // Capitalized so JSX renders it as a component.
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `${baseTab} ${isActive ? activeTab : inactiveTab}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                    <span
                      className={`${labelSizeClass} leading-none ${
                        isActive ? "border-b-2 border-[#d4a5a5] pb-0.5" : ""
                      }`}
                      style={labelStyle}
                    >
                      {t[tab.key]}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`${baseTab} ${inactiveTab}`}
            aria-label="Open more navigation"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
            <span className={`${labelSizeClass} leading-none`} style={labelStyle}>
              {t.more}
            </span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <MoreMenu isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
      )}
    </>
  );
}
