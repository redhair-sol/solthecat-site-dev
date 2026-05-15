// src/pages/Episodes.jsx

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { Search, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { detectRegion } from "../utils/region.js";

// Pulls the human-friendly city name out of the episode title so the
// per-card quiz CTA reads "Play the Athens quiz", "Play the Saint-Louis quiz"
// etc. Titles follow the pattern "SOLadventure #N – CityName, rest…" — we
// grab whatever sits between " – " and the first comma. Falls back to a
// title-cased slug for safety (e.g. "lapaz" → "Lapaz").
function extractCityName(ep, lang) {
  const title =
    (typeof ep.title === "object" ? ep.title[lang] : ep.title) || "";
  const afterDash = title.split(" – ")[1];
  if (afterDash) {
    const beforeComma = afterDash.split(",")[0].trim();
    if (beforeComma) return beforeComma;
  }
  if (ep.city) {
    return ep.city
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("-");
  }
  return "";
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

const TopSection = styled.div`
  margin-bottom: 2rem;
`;

const Heading = styled.h1`
  font-size: 2rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
`;

const Subheading = styled.p`
  font-size: 1rem;
  color: #4a3f37;
  margin: 0 auto;
  max-width: 600px;
  line-height: 1.5;
`;

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  max-width: 600px;
  width: 100%;
  margin: 0 auto 1rem;
`;

const Chip = styled.button`
  padding: 0.35rem 0.85rem;
  font-size: 0.85rem;
  font-family: 'Poppins', sans-serif;
  border: 1.5px solid #8b6b8e;
  background: ${({ $active }) => ($active ? "#8b6b8e" : "#ffffffee")};
  color: ${({ $active }) => ($active ? "#fff" : "#4a3f37")};
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#8b6b8e" : "#ede4d3")};
    border-color: #8b6b8e;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  max-width: 600px;
  width: 100%;
  margin: 0 auto 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 2.7rem;
  font-size: 1rem;
  border: 2px solid #8b6b8e;
  border-radius: 999px;
  background: #ffffffee;
  color: #4a3f37;
  font-family: 'Poppins', sans-serif;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: #8b6b8e;
    box-shadow: 0 0 0 3px rgba(26, 22, 20, 0.15);
  }

  &::placeholder {
    color: #8b6b8e;
    opacity: 0.85;
  }
`;

const SearchIconWrapper = styled.span`
  position: absolute;
  left: 0.95rem;
  top: 50%;
  transform: translateY(-50%);
  color: #8b6b8e;
  pointer-events: none;
  display: flex;
  align-items: center;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #8b6b8e;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(26, 22, 20, 0.1);
  }
`;

const ResultCount = styled.p`
  font-size: 0.85rem;
  color: #4a3f37;
  font-style: italic;
  margin: 0 auto 1.5rem;
  text-align: center;
`;

const NoResults = styled.p`
  font-size: 1rem;
  color: #4a3f37;
  font-style: italic;
  text-align: center;
  max-width: 600px;
  margin: 1.5rem auto;
`;

const EpisodeCard = styled.div`
  background: #ffffffcc;
  padding: 1.5rem;
  border-radius: 1.5rem;
  max-width: 600px;
  width: 100%;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const EpisodeImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 1rem;
  object-fit: cover;
  margin-bottom: 1rem;
`;

const EpisodeTitle = styled.h2`
  font-size: 1.2rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
`;

const EpisodeQuote = styled.p`
  font-style: italic;
  color: #944f9e;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const EpisodeCaption = styled.p`
  font-size: 0.9rem;
  color: #333;
`;

const StoryContainer = styled.div`
  margin-top: 1.2rem;
  font-size: 0.9rem;
  color: #444;
  text-align: justify;
`;

const StoryTitle = styled.h3`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1614;
`;

// Per-card CTA row that pushes the user from "read story" to "play the quiz
// for this city". Sits at the end of each card. Funnel fix — analytics
// showed visitors browse /episodes but rarely reach /games on their own.
const CTARow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const QuizCTA = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: #8b6b8e;
  color: #ffffff;
  text-decoration: none;
  border-radius: 999px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(26, 22, 20, 0.25);
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    background: #8b6b8e;
    transform: scale(1.03);
  }
`;

const ErrorBox = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem 1.2rem;
  border-radius: 1rem;
  max-width: 600px;
  margin: 1rem auto;
  font-size: 0.95rem;
  text-align: center;
`;

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
      heading: "Sol’s Episodes 🎥",
      subheading: "Follow the pawprints of royalty",
      placeholder: "Search by city or keyword...",
      noResults: (q) => `No episodes found for "${q}". Try another keyword.`,
      matches: (n) => `${n} ${n === 1 ? "match" : "matches"}`,
      clearLabel: "Clear search",
      storyTitle: "SOL’s Tale",
      loadFail: "Couldn't load episodes. Please try refreshing the page.",
      quizCTA: (city) => `🧠 Play the ${city} quiz →`,
      metaDescription:
        "All 52 SOLadventures — short travel stories from Athens, Rome, Paris, Marrakech, Petra and beyond. Each city, a queen's-eye view.",
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
      heading: "Τα επεισόδια της Sol 🎥",
      subheading: "Ακολούθησε τα πατουσάκια της βασίλισσας",
      placeholder: "Αναζήτηση με πόλη ή λέξη-κλειδί...",
      noResults: (q) => `Δεν βρέθηκαν επεισόδια για "${q}". Δοκίμασε άλλη λέξη.`,
      matches: (n) => `${n} ${n === 1 ? "αποτέλεσμα" : "αποτελέσματα"}`,
      clearLabel: "Καθαρισμός αναζήτησης",
      storyTitle: "Το Παραμύθι της SOL",
      loadFail: "Δεν φόρτωσαν τα επεισόδια. Παρακαλώ δοκίμασε refresh.",
      quizCTA: (city) => `🧠 Παίξε το quiz της ${city} →`,
      metaDescription:
        "Όλα τα 52 SOLadventures — μικρές ταξιδιωτικές ιστορίες από Αθήνα, Ρώμη, Παρίσι, Μαρακές, Πέτρα και ακόμη πιο πέρα. Κάθε πόλη, μια βασιλική ματιά.",
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
          // Backfill region for any entry that ships without one (new episodes
          // can omit the field — we derive it from location.lat/lng).
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
            el: `SOLadventure #${nextNumber} – Έρχεται Σύντομα`
          },
          image: "episodes/coming-soon.webp",
          caption: {
            en: "Stay tuned for the next purrfect stop",
            el: "Μείνε συντονισμένος για τον επόμενο σταθμό"
          },
          visible: false,
          quote: "",
          story: { en: "", el: "" }
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
  // Hide teaser whenever any filter is active.
  const isFiltered = isSearching || isFilteringRegion;

  // Only show region chips for regions that actually have episodes.
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
      // Hide the "Coming Soon" teaser while filtering — it is not a real result.
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
  }, [episodes, isFiltered, isSearching, isFilteringRegion, selectedRegion, trimmedQuery, language]);

  return (
    <>
      <Helmet>
        <title>
          {language === "el" ? "Επεισόδια" : "Episodes"} – SolTheCat
        </title>
        <meta name="description" content={t.metaDescription} />
        <link rel="canonical" href="https://solthecat.com/episodes" />
      </Helmet>

      <PageContainer
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <TopSection>
          <Heading>{t.heading}</Heading>
          <Subheading>{t.subheading}</Subheading>
        </TopSection>

        <ChipsRow role="group" aria-label={t.regions.all}>
          {availableRegions.map((r) => (
            <Chip
              key={r}
              type="button"
              $active={selectedRegion === r}
              onClick={() => handleRegionChange(r)}
              aria-pressed={selectedRegion === r}
            >
              {t.regions[r]}
            </Chip>
          ))}
        </ChipsRow>

        <SearchWrapper>
          <SearchIconWrapper>
            <Search size={18} />
          </SearchIconWrapper>
          <SearchInput
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
          />
          {isSearching && (
            <ClearButton
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={t.clearLabel}
            >
              <X size={16} />
            </ClearButton>
          )}
        </SearchWrapper>

        {isFiltered && filteredEpisodes.length > 0 && (
          <ResultCount>{t.matches(filteredEpisodes.length)}</ResultCount>
        )}

        {loadError && (
          <ErrorBox role="alert">{t.loadFail}</ErrorBox>
        )}

        {!loadError && isFiltered && filteredEpisodes.length === 0 && (
          <NoResults>
            {isSearching
              ? t.noResults(trimmedQuery)
              : t.noResults(t.regions[selectedRegion])}
          </NoResults>
        )}

        {filteredEpisodes.map((ep, idx) => (
          <EpisodeCard key={ep.id}>
            <EpisodeImage
              src={`${import.meta.env.BASE_URL}${ep.image}`}
              alt={typeof ep.title === "object" ? ep.title[language] : ep.title}
              width="800"
              height="800"
              loading={idx === 0 ? "eager" : "lazy"}
              fetchpriority={idx === 0 ? "high" : "auto"}
              decoding="async"
            />
            <EpisodeTitle>
              {typeof ep.title === "object" ? ep.title[language] : ep.title}
            </EpisodeTitle>
            {ep.quote && <EpisodeQuote>{ep.quote}</EpisodeQuote>}
            <EpisodeCaption>
              {typeof ep.caption === "object" ? ep.caption[language] : ep.caption}
            </EpisodeCaption>

            {ep.story && ep.story[language] && (
              <StoryContainer>
                <StoryTitle>{t.storyTitle}</StoryTitle>
                <p>{ep.story[language]}</p>
              </StoryContainer>
            )}

            {ep.visible !== false && ep.city && (
              <CTARow>
                <QuizCTA to="/games/cityquiz">
                  {t.quizCTA(extractCityName(ep, language))}
                </QuizCTA>
              </CTARow>
            )}
          </EpisodeCard>
        ))}
      </PageContainer>
    </>
  );
}
