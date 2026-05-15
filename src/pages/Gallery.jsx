import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { Search, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { detectRegion } from "../utils/region.js";

const REGION_KEYS = [
  "all",
  "europe",
  "north-america",
  "south-america",
  "africa",
  "asia",
  "oceania",
];

const Title = styled.h1`
  font-family: 'Instrument Serif', serif;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  line-height: 1.05;
  color: var(--sol-ink);
  margin-bottom: 0.5rem;
`;

const Subheading = styled.p`
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: var(--sol-ink-soft);
  margin-bottom: 2rem;
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
  padding: 0.35rem 0.95rem;
  font-size: 0.85rem;
  border: 1px solid ${({ $active }) => ($active ? "var(--sol-rose)" : "var(--sol-line)")};
  background: ${({ $active }) => ($active ? "var(--sol-rose)" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--sol-cream)" : "var(--sol-ink-soft)")};
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: var(--sol-rose);
    color: ${({ $active }) => ($active ? "var(--sol-cream)" : "var(--sol-ink)")};
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
  border: 1px solid var(--sol-line);
  border-radius: 999px;
  background: var(--sol-cream);
  color: var(--sol-ink);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: var(--sol-sun);
    box-shadow: 0 0 0 3px rgba(232, 168, 56, 0.25);
  }

  &::placeholder {
    color: var(--sol-ink-soft);
    opacity: 0.85;
  }
`;

const SearchIconWrapper = styled.span`
  position: absolute;
  left: 0.95rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--sol-ink-soft);
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
  color: var(--sol-ink-soft);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--sol-cream-2);
    color: var(--sol-ink);
  }
`;

const ResultCount = styled.p`
  font-size: 0.85rem;
  color: #4a3f37;
  font-style: italic;
  margin: 0 auto 1rem;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    padding: 0 0.5rem;
  }
`;

const Tile = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--sol-cream-2);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(26, 22, 20, 0.06);
  overflow: hidden;
  cursor: zoom-in;

  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover {
    transform: scale(1.02);
  }

  img {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }

  .caption-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    text-align: center;
    font-size: 0.9rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .caption-static {
    display: none;
    margin-top: 0.5rem;
    color: #444;
    font-size: 0.9rem;
    text-align: center;
    padding: 0 0.5rem;
  }

  @media (hover: hover) {
    &:hover .caption-overlay {
      opacity: 1;
    }
    .caption-static {
      display: none;
    }
  }

  @media (hover: none) {
    .caption-overlay {
      display: none;
    }
    .caption-static {
      display: block;
    }
  }
`;

const ErrorBox = styled.div`
  background: var(--sol-cream-2);
  border: 1px solid var(--sol-line);
  color: var(--sol-ink);
  padding: 1rem 1.2rem;
  border-radius: 1rem;
  max-width: 600px;
  margin: 1rem auto;
  font-size: 0.95rem;
  text-align: center;
`;

export default function GalleryPage() {
  const [episodes, setEpisodes] = useState([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();

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
      title: "Sol’s Gallery 🖼️",
      subheading: "A glimpse from every royal stop",
      placeholder: "Search by city or keyword...",
      noResults: (q) => `No photos found for "${q}". Try another keyword.`,
      matches: (n) => `${n} ${n === 1 ? "match" : "matches"}`,
      clearLabel: "Clear search",
      loadFail: "Couldn't load the gallery. Please try refreshing the page.",
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
      title: "Φωτογραφίες της Sol 🖼️",
      subheading: "Μια ματιά από κάθε της στάση",
      placeholder: "Αναζήτηση με πόλη ή λέξη-κλειδί...",
      noResults: (q) => `Δεν βρέθηκαν φωτογραφίες για "${q}". Δοκίμασε άλλη λέξη.`,
      matches: (n) => `${n} ${n === 1 ? "αποτέλεσμα" : "αποτελέσματα"}`,
      clearLabel: "Καθαρισμός αναζήτησης",
      loadFail: "Δεν φόρτωσε η συλλογή. Παρακαλώ δοκίμασε refresh.",
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
    const present = new Set(episodes.map((ep) => ep.region).filter(Boolean));
    return REGION_KEYS.filter((k) => k === "all" || present.has(k));
  }, [episodes]);

  const filteredEpisodes = useMemo(() => {
    if (!isFiltered) return episodes;
    const q = trimmedQuery.toLowerCase();
    return episodes.filter((ep) => {
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

  // Re-run intersection observer when filtered list changes (new tiles need fade-in).
  useEffect(() => {
    const tiles = document.querySelectorAll('.gallery-tile');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    tiles.forEach((tile) => observer.observe(tile));
    return () => observer.disconnect();
  }, [filteredEpisodes]);

  // Slides for the lightbox must mirror the rendered grid order so that the
  // clicked tile's index points to the correct slide.
  const slides = filteredEpisodes.map((ep) => ({ src: `/${ep.image}` }));
  const cleanCaption = (caption) => caption.replace(/🐾/g, "").trim();

  return (
    <>
      <Helmet>
        <title>
          {language === "el" ? "Συλλογή" : "Gallery"} – SolTheCat
        </title>
        <meta
          name="description"
          content={
            language === "el"
              ? "Φωτογραφική συλλογή της Sol the Cat — οι καλύτερες στιγμές από κάθε ταξίδι, από την Αθήνα μέχρι την Πέτρα."
              : "Sol the Cat's photo gallery — best moments from every journey, from Athens to Petra."
          }
        />
        <link rel="canonical" href="https://solthecat.com/gallery" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title>{t.title}</Title>
        <Subheading>{t.subheading}</Subheading>

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

        <Grid>
          {filteredEpisodes.map((ep, i) => {
            const titleText = typeof ep.title === "object" ? ep.title[language] : ep.title;
            const captionText = typeof ep.caption === "object"
              ? ep.caption[language]
              : ep.caption;
            return (
              <Tile
                key={ep.id}
                className="gallery-tile"
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
              >
                <img
                  src={`/${ep.image}`}
                  alt={titleText}
                  width="800"
                  height="800"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchpriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                />
                <div className="caption-overlay">{cleanCaption(captionText)}</div>
                <div className="caption-static">{cleanCaption(captionText)}</div>
              </Tile>
            );
          })}
        </Grid>

        {open && (
          <Lightbox
            open={open}
            close={() => setOpen(false)}
            index={index}
            slides={slides}
          />
        )}
      </PageContainer>
    </>
  );
}
