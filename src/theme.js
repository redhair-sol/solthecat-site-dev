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
// Now `transparent` so every PageContainer shows the body cream uniformly,
// no matter how short or long the page content is. The old cream → cream-2
// gradient created a visible seam at the bottom of short pages (Contact,
// SolCam, etc.) where the gradient ended and the solid body cream began.
// `noBg` on PageContainer is now redundant but kept for backwards compat.
export const gradients = {
  pageBg: "transparent",
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
// Unified to Instrument Serif italic for both languages — matches the
// italic-gold "the" in the wordmark and the Hero "Meet *Sol*" accent, so
// the nav reads as part of the editorial system instead of as the lone
// script holdout. Instrument Serif has Greek glyph coverage so EL users
// get the same treatment without falling back to a different family.
//
// To revert: restore the Dancing Script (EN) / EB Garamond (EL) split that
// lived here before — see git history for the previous version.
export const fonts = {
  nav: '"Instrument Serif", serif',
  navStyleFor: () => ({
    fontFamily: '"Instrument Serif", serif',
    fontStyle: "italic",
    fontWeight: 400,
  }),
  // Same family + same italic in both languages means we can use one size
  // for both. Kept as a function for API stability with existing call sites.
  navSizeClassFor: (_language, baseClass) => baseClass,
};
