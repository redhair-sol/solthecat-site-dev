import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; // ✅ ΝΕΟ

// Self-hosted fonts (replace Google Fonts CDN — better privacy + CSP).
// Match the previous Google Fonts URL exactly: Dancing Script 700,
// Playfair Display italic 400, Poppins 400/500/600, Marcellus default.
import "@fontsource/dancing-script/700.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/marcellus";
// EB Garamond Italic — used for Greek nav labels (Dancing Script has no Greek glyphs).
// Bilingual font swap is handled in src/theme.js (fonts.navStyleFor).
// Using 600 weight to match the perceived visual density of Dancing Script Bold —
// 400 italic looked too wispy/thin compared to the EN bold cursive.
import "@fontsource/eb-garamond/600-italic.css";
import "@fontsource/eb-garamond/greek-600-italic.css";

import { LanguageProvider } from "./context/LanguageContext.jsx";
import App from "./App.jsx";
import "./index.css";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home.jsx"));
const Episodes = lazy(() => import("./pages/Episodes.jsx"));
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
// SOLsJourney is now the canonical /map page (animated journey + static fallback).
const SOLsJourney = lazy(() => import("./pages/SOLsJourney.jsx"));
const WhoIsSol = lazy(() => import("./pages/WhoIsSol.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const Games = lazy(() => import("./pages/Games.jsx"));
const PawprintsGame = lazy(() => import("./pages/PawprintsGame.jsx"));
const PuzzleMapGame = lazy(() => import("./pages/PuzzleMapGame.jsx"));
const QuizPlayer = lazy(() => import("./pages/QuizPlayer.jsx"));
const RoyalPuzzleGame = lazy(() => import("./pages/RoyalPuzzleGame.jsx"));
const SolSnap = lazy(() => import("./pages/SolSnap.jsx"));
const SolCam = lazy(() => import("./pages/SolCam.jsx"));
const SolsTreasureHunt = lazy(() => import("./pages/SolsTreasureHunt.jsx"));
const SolPicks = lazy(() => import("./pages/SolPicks.jsx"));
const SpotTheCity = lazy(() => import("./pages/SpotTheCity.jsx"));
const MapQuiz = lazy(() => import("./pages/MapQuiz.jsx"));
const SolTap = lazy(() => import("./pages/SolTap.jsx"));
const CatSort = lazy(() => import("./pages/CatSort.jsx"));
const CatchCats = lazy(() => import("./pages/CatchCats.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider> {/* ✅ Τύλιξε τα όλα */}
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="adventures" element={<Episodes />} />
                {/* Legacy URL — /episodes now lives as /adventures.
                    Production also gets a 301 via public/_redirects. */}
                <Route path="episodes" element={<Navigate to="/adventures" replace />} />
                <Route path="map" element={<SOLsJourney />} />
                <Route path="gallery" element={<Gallery />} />
                {/* Legacy URL — redirect to /map (Cloudflare _redirects also serves a 301 in prod). */}
                <Route path="solsjourney" element={<Navigate to="/map" replace />} />
                <Route path="whoissol" element={<WhoIsSol />} />
                {/* Friendly URL — /about redirects to the canonical /whoissol */}
                <Route path="about" element={<Navigate to="/whoissol" replace />} />
                <Route path="contact" element={<Contact />} />
                <Route path="shop" element={<Shop />} />
				<Route path="solcam" element={<SolCam />} />

                {/* 🎮 Games */}
                <Route path="games" element={<Games />} />
                <Route path="games/pawprints" element={<PawprintsGame />} />
                <Route path="games/puzzlemap" element={<PuzzleMapGame />} />
                <Route path="games/cityquiz" element={<QuizPlayer />} />
                <Route path="games/royalpuzzle" element={<RoyalPuzzleGame />} />
                <Route path="games/solsnap" element={<SolSnap />} />
                <Route path="games/treasurehunt" element={<SolsTreasureHunt />} />
                <Route path="games/sol-picks" element={<SolPicks />} />
                <Route path="games/spotcity" element={<SpotTheCity />} />
                <Route path="games/mapquiz" element={<MapQuiz />} />
                <Route path="games/quick-paws" element={<SolTap />} />
                <Route path="games/cat-sort" element={<CatSort />} />
                <Route path="games/catch-cats" element={<CatchCats />} />
				
                {/* Custom 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// PWA service worker registration. Registered after the main bundle loads
// so it never blocks first paint. Failure is non-fatal (e.g., older browsers
// without SW support — the site still works as a regular web app).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}

// PWA install tracking — increment a global counter the first time the app
// launches in standalone mode (i.e. opened from home-screen icon, post-install).
// Works for Chromium PWAs AND iOS Safari "Add to Home Screen" (where the
// `appinstalled` event is never fired). Per-device dedupe via localStorage —
// refreshes inside the installed app don't count again, but a fresh
// uninstall+reinstall does (PWA storage is reset on uninstall).
// Endpoint: functions/install-tracker.js → Cloudflare KV.
if (typeof window !== "undefined") {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (isStandalone && !localStorage.getItem("solInstallTracked")) {
    fetch("/install-tracker", { method: "POST" })
      .then(() => localStorage.setItem("solInstallTracked", "true"))
      .catch(() => {
        // Offline or endpoint not yet deployed — retry on next launch.
      });
  }
}
