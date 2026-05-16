// src/components/InstallPrompt.jsx
//
// Renders the install banner. Two modes:
//
// 1) "chromium" — Android Chrome, desktop Edge, Samsung Internet, etc. fire
//    `beforeinstallprompt` when the site is installable. We capture the event,
//    show a banner with an Install button, and trigger the native prompt on
//    click. Successful install fires `appinstalled` → banner hides.
//
// 2) "ios"      — iOS Safari (and any iOS browser, since they all use WebKit)
//    DOES NOT fire `beforeinstallprompt` — Apple deliberately disabled it.
//    Instead we show a banner explaining the manual install path:
//      Share button → "Add to Home Screen"
//
// In both modes a dismiss × button stores a timestamp; the banner stays
// hidden for 30 days afterwards. Already-installed users (running in
// standalone mode) never see the banner.

import { useEffect, useState } from "react";
import { X, Share } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

const DISMISS_KEY = "solInstallDismissedAt";
const DISMISS_DAYS = 30;
const IOS_BANNER_DELAY_MS = 2000;

export default function InstallPrompt() {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mode, setMode] = useState(null); // "chromium" | "ios" | null

  const t = {
    en: {
      title: "Install SOLadventures",
      subtitleChromium: "Add to home screen for quick paw access 🐾",
      iosTap: "Tap",
      iosThen: "then",
      iosAdd: "“Add to Home Screen”",
      install: "Install",
      dismiss: "Dismiss",
    },
    el: {
      title: "Εγκατέστησε το SOLadventures",
      subtitleChromium: "Πρόσθεσέ το στην αρχική για γρήγορη πρόσβαση 🐾",
      iosTap: "Πάτα",
      iosThen: "μετά",
      iosAdd: "«Προσθήκη στην αρχική»",
      install: "Εγκατάσταση",
      dismiss: "Κλείσιμο",
    },
  }[language];

  useEffect(() => {
    // Helpers re-check the latest state at fire time. Chromium sometimes
    // re-fires `beforeinstallprompt` on SPA route changes; without this
    // re-check, the banner reappears after dismiss on every navigation.
    const isRecentlyDismissed = () => {
      const dismissedAt = parseInt(
        localStorage.getItem(DISMISS_KEY) || "0",
        10
      );
      const cutoff = Date.now() - DISMISS_DAYS * 24 * 60 * 60 * 1000;
      return dismissedAt > cutoff;
    };
    const isStandaloneNow = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isRecentlyDismissed() || isStandaloneNow()) return;

    // iOS: no install event exists. Show manual instructions banner after a
    // short delay so it doesn't compete with first paint.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      const timer = setTimeout(() => {
        // Re-check at fire time in case state changed during the delay.
        if (isRecentlyDismissed() || isStandaloneNow()) return;
        setMode("ios");
      }, IOS_BANNER_DELAY_MS);
      return () => clearTimeout(timer);
    }

    // Chromium browsers fire beforeinstallprompt when site is installable.
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      // Re-check dismiss state on every fire — Chromium re-fires this event
      // on SPA route changes / installability re-evaluation, which would
      // resurrect the banner after the user dismissed it.
      if (isRecentlyDismissed() || isStandaloneNow()) return;
      setMode("chromium");
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Successful install (Chromium only — iOS doesn't fire this).
  useEffect(() => {
    const onInstalled = () => {
      setMode(null);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setMode(null);
  };

  const handleDismiss = () => {
    setMode(null);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!mode) return null;

  return (
    <div
      className="fixed bottom-28 lg:bottom-20 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm
                 z-[1100] bg-[var(--sol-cream)] rounded-2xl shadow-[0_12px_32px_-8px_rgba(26,22,20,0.18)]
                 border border-[var(--sol-line)] p-4 flex items-start gap-3"
      role="dialog"
      aria-label={t.title}
    >
      <img
        src="/images/sol-hero.webp"
        alt=""
        className="w-12 h-12 rounded-xl flex-shrink-0 object-cover"
        width="48"
        height="48"
        loading="lazy"
        decoding="async"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1a1614] text-sm">{t.title}</p>

        {mode === "chromium" && (
          <>
            <p className="text-[#4a3f37] text-xs mt-0.5">{t.subtitleChromium}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-[#8b6b8e] text-white text-xs font-bold rounded-full
                           hover:scale-105 transition-transform shadow"
              >
                {t.install}
              </button>
            </div>
          </>
        )}

        {mode === "ios" && (
          <p className="text-[#4a3f37] text-xs mt-0.5 leading-relaxed">
            {t.iosTap}{" "}
            <Share
              className="inline-block w-4 h-4 align-text-bottom text-[#8b6b8e]"
              aria-label="Share"
            />{" "}
            {t.iosThen} {t.iosAdd}
          </p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-full hover:bg-[#ede4d3] transition-colors flex-shrink-0"
        aria-label={t.dismiss}
      >
        <X className="w-4 h-4 text-[#4a3f37]" />
      </button>
    </div>
  );
}
