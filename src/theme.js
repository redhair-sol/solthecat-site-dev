// Central color palette. Add new colors here and import in styled-components
// instead of repeating hex codes across files. Color drift across pages is
// the audit's #1 maintainability issue — keep new colors in this file.
//
// Naming reflects role, not appearance: `primary` is the main heading purple,
// `accent` is buttons/links, `surface` is card backgrounds, etc.

export const colors = {
  // Names are kept for backwards compatibility, but the values are now the
  // warm-editorial tokens. Anything that imports `colors.primary` etc. gets
  // the new palette automatically without rewriting call sites.
  primary: "#1a1614",       // ink (was #1a1614 purple)
  primarySoft: "#4a3f37",   // ink-soft (was #4a3f37)
  primaryDeep: "#1a1614",   // ink (was #1a1614)
  primaryHilite: "#1a1614", // ink (was #1a1614)

  accent: "#8b6b8e",        // plum (was #8b6b8e)
  accentLight: "#8b6b8e",   // plum (was #8b6b8e)
  accentPink: "#7a5a7c",    // mauve (was #7a5a7c)

  pinkSoft: "#d4a5a5",      // rose (was #d4a5a5)
  pinkSurface: "#ede4d3",   // cream-2 (was #ede4d3)
  pinkBgFrom: "#f5efe4",    // cream (was #f5efe4)
  pinkBgTo: "#ede4d3",      // cream-2 (was #ede4d3)

  liveGreen: "#47c9a0",
};

// Shared gradient used as the default page background.
export const gradients = {
  pageBg: `linear-gradient(to bottom, ${colors.pinkBgFrom}, ${colors.pinkBgTo})`,
};

// Common box shadows.
export const shadows = {
  button: "0 4px 10px rgba(26, 22, 20, 0.15)",
  card: "0 4px 12px rgba(0, 0, 0, 0.05)",
  cardElevated: "0 4px 12px rgba(0, 0, 0, 0.08)",
  tile: "0 4px 16px rgba(26, 22, 20, 0.08)",
};

// Navigation font (top nav, bottom tab labels, drawer items).
//
// `nav` is the legacy single-font value (English-only). Components that
// support bilingual rendering should use `navStyleFor(language)` instead —
// it returns a full style object since the EL font is italic (font-style
// must be set, not just font-family).
//
// Why dual-font: Dancing Script has zero Greek glyphs in its source. With
// language=EL the browser would fall back to system serif. EB Garamond
// Italic is loaded explicitly with a Greek subset (see main.jsx) so EL
// users get a properly designed italic serif for the menu.
//
// To revert to single-font Dancing Script everywhere (and lose Greek menu
// support): components stop calling navStyleFor() and use fonts.nav directly.
//
// To try a different EL font: change the EL branch below. Already-loaded
// alternatives without Greek subsets exist (Marcellus, Playfair) but will
// fall back to system fonts for Greek glyphs.
export const fonts = {
  nav: '"Dancing Script", cursive',
  navStyleFor: (language) =>
    language === "el"
      ? {
          fontFamily: '"EB Garamond", serif',
          fontStyle: "italic",
          // 600 weight matches the perceived ink density of Dancing Script Bold;
          // 400 italic looked too thin/light next to the EN cursive.
          fontWeight: 600,
        }
      : { fontFamily: '"Dancing Script", cursive' },
  // EB Garamond Italic has heavier visual weight than Dancing Script Bold,
  // so EL needs a slightly smaller size class to feel balanced. Per-component
  // because Topbar/MoreMenu use text-2xl (1.5rem) while BottomTabBar uses
  // text-[0.95rem] — applying via fontSize:em on inline style is unreliable
  // (it overrides the Tailwind class and ends up relative to grandparent).
  navSizeClassFor: (language, baseClass) => {
    if (language !== "el") return baseClass;
    // Map EN sizes → EL sizes (~93% scale).
    if (baseClass === "text-2xl") return "text-[1.35rem]";
    if (baseClass === "text-[0.95rem]") return "text-[0.85rem]";
    return baseClass;
  },
};
