// src/pages/Episodes.jsx

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { fonts } from "../theme.js";
import { detectRegion } from "../utils/region.js";

// Pulls the human-friendly city name out of the episode title so the
// per-card quiz CTA reads "Play the Athens quiz" etc. Titles follow the
// pattern "SOLadventure #N – CityName, rest…", we grab whatever sits
// between " – " and the first comma. Falls back to a title-cased slug.
function extractCityName(ep, lang) {
  const title =
    (typeof ep.title === "object" ? ep.title[lang] : ep.title) || "";
  const afterDash = title.split(" – ")[1];
  if (afterDash) {
    // Pattern 1: "City, rest". Accept only when the candidate looks like
    // an actual city (≤2 words, starts with a capital) so editorial titles
    // without a comma (e.g. "Feline flair meets Parisian air") fall through
    // instead of wrapping the entire rest in italic gold.
    const beforeComma = afterDash.split(",")[0].trim();
    if (
      beforeComma &&
      beforeComma.split(/\s+/).length <= 2 &&
      /^[\p{Lu}]/u.test(beforeComma)
    ) {
      return beforeComma;
    }

    // Pattern 2: no usable comma — match ep.city against words after the
    // dash. Exact match first, then prefix so a slug like "paris" can
    // light up the adjective "Parisian".
    if (ep.city) {
      const slug = ep.city.replace(/-/g, "").toLowerCase();
      const words = afterDash
        .split(/\s+/)
        .map((w) => w.replace(/[^\p{L}]/gu, ""))
        .filter(Boolean);
      const exact = words.find((w) => w.toLowerCase() === slug);
      if (exact) return exact;
      const prefix = words.find(
        (w) => w.toLowerCase().startsWith(slug) && w.length > slug.length
      );
      if (prefix) return prefix;
    }
  }
  if (ep.city) {
    return ep.city
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("-");
  }
  return "";
}

// Renders the episode title with the city name in italic sun (mirrors the
// "sol *the* cat" logo accent pattern). Falls back to plain text if no city
// can be located inside the title.
function renderTitleWithCityAccent(title, city) {
  if (!city) return title;
  const idx = title.indexOf(city);
  if (idx === -1) return title;
  const before = title.slice(0, idx);
  const after = title.slice(idx + city.length);
  return (
    <>
      {before}
      <em
        className="not-italic"
        style={{
          fontStyle: "italic",
          color: "var(--sol-sun)",
        }}
      >
        {city}
      </em>
      {after}
    </>
  );
}

// Region keys produced by the lat/lng classifier in src/utils/region.js.
const REGION_KEYS = [
  "all",
  "europe",
  "north-america",
  "south-america",
  "africa",
  "asia",
  "oceania",
];

// Shared Tailwind class fragments to keep the JSX readable.
const SERIF = { fontFamily: '"Instrument Serif", serif' };

export default function Episodes() {
  const [episodes, setEpisodes] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();

  // Region from URL (?region=europe). Default "all" = no filter.
  const urlRegion = searchParams.get("region");
  const selectedRegion = REGION_KEYS.includes(urlRegion) ? urlRegion : "all";

  const handleRegionChange = (region) => {
    const next = new URLSearchParams(searchParams);
    if (region === "all") {
      next.delete("region");
    } else {
      next.set("region", region);
    }
    setSearchParams(next, { replace: true });
  };

  const t = {
    en: {
      headingPrefix: "Sol’s ",
      headingAccent: "Adventures",
      subheading: "Follow the pawprints of royalty",
      placeholder: "Search by city or keyword…",
      noResults: (q) => `No episodes found for “${q}”. Try another keyword.`,
      matches: (n) => `${n} ${n === 1 ? "match" : "matches"}`,
      clearLabel: "Clear search",
      storyTitle: "SOL’s Tale",
      loadFail: "Couldn't load episodes. Please try refreshing the page.",
      quizCTA: (city) => `Play the ${city} quiz →`,
      metaDescription:
        "All 52 SOLadventures, short travel stories from Athens, Rome, Paris, Marrakech, Petra and beyond. Each city, a queen's-eye view.",
      regions: {
        all: "All",
        europe: "Europe",
        "north-america": "N. America",
        "south-america": "S. America",
        africa: "Africa",
        asia: "Asia",
        oceania: "Oceania",
      },
    },
    el: {
      headingPrefix: "Οι περιπέτειες της ",
      headingAccent: "Sol",
      subheading: "Ακολούθησε τα πατουσάκια της βασίλισσας",
      placeholder: "Αναζήτηση με πόλη ή λέξη-κλειδί…",
      noResults: (q) => `Δεν βρέθηκαν επεισόδια για “${q}”. Δοκίμασε άλλη λέξη.`,
      matches: (n) => `${n} ${n === 1 ? "αποτέλεσμα" : "αποτελέσματα"}`,
      clearLabel: "Καθαρισμός αναζήτησης",
      storyTitle: "Το Παραμύθι της SOL",
      loadFail: "Δεν φόρτωσαν τα επεισόδια. Παρακαλώ δοκίμασε refresh.",
      quizCTA: (city) => `Παίξε το quiz της ${city} →`,
      metaDescription:
        "Όλα τα 52 SOLadventures, μικρές ταξιδιωτικές ιστορίες από Αθήνα, Ρώμη, Παρίσι, Μαρακές, Πέτρα και ακόμη πιο πέρα. Κάθε πόλη, μια βασιλική ματιά.",
      regions: {
        all: "Όλα",
        europe: "Ευρώπη",
        "north-america": "Β. Αμερική",
        "south-america": "Ν. Αμερική",
        africa: "Αφρική",
        asia: "Ασία",
        oceania: "Ωκεανία",
      },
    },
  }[language];

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}episodes.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const visibleEpisodes = data
          .filter((ep) => ep.visible)
          .map((ep) =>
            ep.region
              ? ep
              : { ...ep, region: detectRegion(ep.location?.lat, ep.location?.lng) }
          );
        const nextNumber = visibleEpisodes.length + 1;

        const teaser = {
          id: 999,
          title: {
            en: `SOLadventure #${nextNumber} – Coming Soon`,
            el: `SOLadventure #${nextNumber} – Έρχεται Σύντομα`,
          },
          image: "episodes/coming-soon.webp",
          caption: {
            en: "Stay tuned for the next purrfect stop",
            el: "Μείνε συντονισμένος για τον επόμενο σταθμό",
          },
          visible: false,
          quote: "",
          story: { en: "", el: "" },
        };

        visibleEpisodes.push(teaser);
        setEpisodes(visibleEpisodes);
        setLoadError(false);
      })
      .catch((err) => {
        console.error("Failed to load episodes:", err);
        setLoadError(true);
      });
  }, []);

  const trimmedQuery = searchQuery.trim();
  const isSearching = trimmedQuery.length > 0;
  const isFilteringRegion = selectedRegion !== "all";
  const isFiltered = isSearching || isFilteringRegion;

  const availableRegions = useMemo(() => {
    const present = new Set(
      episodes.filter((ep) => ep.visible !== false && ep.region).map((ep) => ep.region)
    );
    return REGION_KEYS.filter((k) => k === "all" || present.has(k));
  }, [episodes]);

  const filteredEpisodes = useMemo(() => {
    if (!isFiltered) return episodes;
    const q = trimmedQuery.toLowerCase();
    return episodes.filter((ep) => {
      if (ep.visible === false) return false;
      if (isFilteringRegion && ep.region !== selectedRegion) return false;
      if (isSearching) {
        const title =
          (typeof ep.title === "object" ? ep.title[language] : ep.title) || "";
        const caption =
          (typeof ep.caption === "object" ? ep.caption[language] : ep.caption) ||
          "";
        const city = ep.city || "";
        return (
          title.toLowerCase().includes(q) ||
          caption.toLowerCase().includes(q) ||
          city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    episodes,
    isFiltered,
    isSearching,
    isFilteringRegion,
    selectedRegion,
    trimmedQuery,
    language,
  ]);

  const scriptStyle = fonts.navStyleFor(language);

  return (
    <>
      <Helmet>
        <title>
          {language === "el" ? "Περιπέτειες" : "Adventures"} – sol the cat
        </title>
        <meta name="description" content={t.metaDescription} />
        <link rel="canonical" href="https://solthecat.com/adventures" />
        <meta property="og:title" content={`${language === "el" ? "Περιπέτειες" : "Adventures"} – sol the cat`} />
        <meta property="og:description" content={t.metaDescription} />
        <meta property="og:url" content="https://solthecat.com/adventures" />
      </Helmet>

      <PageContainer
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <header className="text-center mb-10 md:mb-14">
          <h1
            className="text-[clamp(2.4rem,6vw,3.6rem)] leading-[1.05] text-[var(--sol-ink)]"
            style={SERIF}
          >
            {t.headingPrefix}
            <em
              className="not-italic"
              style={{
                ...SERIF,
                fontStyle: "italic",
                color: "var(--sol-sun)",
              }}
            >
              {t.headingAccent}
            </em>
          </h1>
          <p
            className="mt-3 text-[1rem] md:text-[1.05rem] italic text-[var(--sol-ink-soft)]"
            style={SERIF}
          >
            {t.subheading}
          </p>
        </header>

        {/* Region chips */}
        <div
          role="group"
          aria-label={t.regions.all}
          className="flex flex-wrap justify-center gap-2 max-w-[640px] w-full mx-auto mb-4"
        >
          {availableRegions.map((r) => {
            const active = selectedRegion === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRegionChange(r)}
                aria-pressed={active}
                className={[
                  "px-3.5 py-1.5 text-[0.85rem] rounded-full border transition-colors duration-150",
                  active
                    ? "bg-[var(--sol-rose)] text-[var(--sol-cream)] border-[var(--sol-rose)]"
                    : "bg-transparent text-[var(--sol-ink-soft)] border-[var(--sol-line)] hover:border-[var(--sol-rose)] hover:text-[var(--sol-ink)]",
                ].join(" ")}
              >
                {t.regions[r]}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-[640px] w-full mx-auto mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sol-ink-soft)] pointer-events-none flex items-center">
            <Search size={18} />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            className="w-full pl-11 pr-10 py-2.5 text-[1rem] rounded-full bg-[var(--sol-cream)] border border-[var(--sol-line)] text-[var(--sol-ink)] placeholder:text-[var(--sol-ink-soft)] outline-none transition-colors focus:border-[var(--sol-sun)] focus:ring-2 focus:ring-[var(--sol-sun)]/25"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={t.clearLabel}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[var(--sol-ink-soft)] hover:text-[var(--sol-ink)] hover:bg-[var(--sol-cream-2)] transition-colors flex items-center justify-center"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isFiltered && filteredEpisodes.length > 0 && (
          <p className="text-[0.85rem] italic text-[var(--sol-ink-soft)] text-center mb-6">
            {t.matches(filteredEpisodes.length)}
          </p>
        )}

        {loadError && (
          <div
            role="alert"
            className="max-w-[640px] mx-auto my-4 px-5 py-4 rounded-2xl text-center text-[0.95rem] bg-[var(--sol-cream-2)] text-[var(--sol-ink)] border border-[var(--sol-line)]"
          >
            {t.loadFail}
          </div>
        )}

        {!loadError && isFiltered && filteredEpisodes.length === 0 && (
          <p className="text-[1rem] italic text-[var(--sol-ink-soft)] text-center max-w-[640px] mx-auto my-6">
            {isSearching
              ? t.noResults(trimmedQuery)
              : t.noResults(t.regions[selectedRegion])}
          </p>
        )}

        {/* Episode cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2 w-full justify-items-center">
          {filteredEpisodes.map((ep, idx) => {
            const epTitle =
              typeof ep.title === "object" ? ep.title[language] : ep.title;
            const epCaption =
              typeof ep.caption === "object" ? ep.caption[language] : ep.caption;
            const cityForAccent = extractCityName(ep, language);

            return (
              <article
                key={ep.id}
                className="bg-[var(--sol-cream-2)] rounded-3xl max-w-[640px] w-full p-5 md:p-6 shadow-[0_2px_12px_rgba(26,22,20,0.06)] transition-shadow hover:shadow-[0_4px_18px_rgba(26,22,20,0.09)]"
              >
                <img
                  src={`${import.meta.env.BASE_URL}${ep.image}`}
                  alt={epTitle}
                  width="800"
                  height="800"
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchpriority={idx === 0 ? "high" : "auto"}
                  decoding="async"
                  className="w-full aspect-square object-cover rounded-2xl mb-5"
                />

                <h2
                  className="text-[1.5rem] md:text-[1.7rem] leading-snug text-[var(--sol-ink)] mb-2"
                  style={SERIF}
                >
                  {renderTitleWithCityAccent(epTitle, cityForAccent)}
                </h2>

                {ep.quote && (
                  <p
                    className="italic text-[var(--sol-ink-soft)] mb-2 text-[0.98rem]"
                    style={SERIF}
                  >
                    {ep.quote}
                  </p>
                )}

                <p className="text-[0.95rem] text-[var(--sol-ink)]">
                  {epCaption}
                </p>

                {ep.story && ep.story[language] && (
                  <div className="mt-5 pt-4 border-t border-[var(--sol-line)]">
                    <h3
                      className="text-[1.15rem] text-[var(--sol-ink)] mb-2"
                      style={scriptStyle}
                    >
                      {t.storyTitle}
                    </h3>
                    <p className="text-[0.95rem] text-[var(--sol-ink)] leading-relaxed text-justify">
                      {ep.story[language]}
                    </p>
                  </div>
                )}

                {ep.visible !== false && ep.city && (
                  <div className="flex justify-end mt-5">
                    <Link
                      to="/games/cityquiz"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[0.9rem] font-medium bg-[var(--sol-plum)] text-[var(--sol-cream)] no-underline transition-all hover:bg-[var(--sol-mauve)] hover:scale-[1.02] shadow-[0_2px_8px_rgba(26,22,20,0.12)]"
                    >
                      {t.quizCTA(extractCityName(ep, language))}
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </PageContainer>
    </>
  );
}
