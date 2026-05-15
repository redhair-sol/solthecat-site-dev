import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styled, { createGlobalStyle } from "styled-components";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { colors, shadows } from "../theme.js";

// Pulsing purple rings behind the current-location paw so the user's eye
// instantly lands on it when the map opens. Two staggered rings keep the
// motion continuous instead of bursty. Active only while we render the
// `currentPawIcon` (idle phase only) so it doesn't distract during the
// journey animation.
const CurrentPawStyle = createGlobalStyle`
  @keyframes solCurrentPulse {
    0%   { transform: scale(0.6); opacity: 0.8; }
    100% { transform: scale(2.6); opacity: 0;   }
  }
  .leaflet-div-icon.sol-current-paw-wrap {
    background: transparent;
    border: 0;
  }
  .sol-current-paw {
    position: relative;
    width: 48px;
    height: 48px;
  }
  .sol-current-paw-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(26, 22, 20, 0.45);
    animation: solCurrentPulse 2s ease-out infinite;
    pointer-events: none;
  }
  .sol-current-paw-ring-2 {
    animation-delay: 1s;
  }
  .sol-current-paw img {
    position: relative;
    z-index: 2;
    display: block;
    width: 48px;
    height: 48px;
  }
`;

const Heading = styled.h1`
  font-size: 2rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
`;

const Subheading = styled.p`
  font-size: 1rem;
  color: #4a3f37;
  margin-bottom: 1.5rem;
`;

// Matches SolButton style (used everywhere else for primary CTAs) but is a
// real <button> with disabled state instead of a <Link>.
const JourneyButton = styled.button`
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.8rem 1.5rem;
  background-color: ${({ disabled }) => (disabled ? "#ccc" : colors.accentLight)};
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 16px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  box-shadow: ${shadows.button};
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: ${({ disabled }) => (disabled ? "none" : "scale(1.05)")};
  }
`;

const MapWrapper = styled.div`
  height: 80vh;
  min-height: 500px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(26, 22, 20, 0.15);
  /* Confine Leaflet's internal z-indices (controls up to 1000) within this
     stacking context so they cannot stack above fixed UI like the bottom
     tab bar or Instagram button. */
  position: relative;
  z-index: 0;

  /* On real mobile (vs F12 device emulation) the browser address bar
     dynamically appears/hides on scroll, so plain vh is unreliable.
     dvh (dynamic viewport height) recalculates as chrome shows/hides,
     keeping the map's visible center stable when flyTo zooms to a city.
     Breakpoint at 1023px aligns with the lg: Tailwind boundary so tablet
     portrait (which uses mobile UI mode) gets the smaller map height too. */
  @media (max-width: 1023px) {
    height: 55dvh;
    min-height: 350px;
  }
`;

const pawIcon = new L.Icon({
  iconUrl: "/icons/toe.webp",
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Idle-only paw with pulsing rings around it (see CurrentPawStyle). Drawn
// slightly larger than the regular paw so the current city is unmistakable
// even at world-view zoom levels.
const currentPawIcon = L.divIcon({
  className: "sol-current-paw-wrap",
  html: `
    <div class="sol-current-paw">
      <div class="sol-current-paw-ring"></div>
      <div class="sol-current-paw-ring sol-current-paw-ring-2"></div>
      <img src="/icons/toe.webp" alt="" />
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// MapContainer's `center`/`zoom` only apply at initial mount; once the
// episodes load async we need imperative `flyTo` to actually focus the map
// on the final destination (the latest city Sol has visited).
function InitialFocus({ route }) {
  const map = useMap();
  const lastLat = route.length > 0 ? route[route.length - 1][0] : null;
  const lastLng = route.length > 0 ? route[route.length - 1][1] : null;
  useEffect(() => {
    if (lastLat !== null && lastLng !== null) {
      map.flyTo([lastLat, lastLng], 5, { duration: 1 });
    }
  }, [lastLat, lastLng, map]);
  return null;
}

function AnimatedMarker({ route, delay = 3000, onUpdateIndex, onComplete }) {
  const [traveled, setTraveled] = useState([route[0]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const map = useMap();
  const stepIndex = useRef(1);
  const timeoutRef = useRef(null);

  // Refs hold latest values so the animation effect can run with stable deps.
  // Without this, parent re-renders (e.g. on currentIndex update) recreate
  // `route`/`onComplete` references, retriggering the effect, cancelling the
  // setTimeout, and flying back to the first city — animation never advances.
  const routeRef = useRef(route);
  const onUpdateIndexRef = useRef(onUpdateIndex);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    routeRef.current = route;
    onUpdateIndexRef.current = onUpdateIndex;
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const r = routeRef.current;
    if (!r || r.length < 2) return;

    map.flyTo(r[0], 7, { duration: 1.2 });
    setCurrentIndex(0);
    onUpdateIndexRef.current(0);

    function step() {
      const cur = routeRef.current;
      if (stepIndex.current >= cur.length) {
        // Journey complete: zoom out to show the full route with polyline.
        if (cur.length > 1) {
          map.flyToBounds(cur, { duration: 1.5, padding: [50, 50] });
        }
        if (onCompleteRef.current) onCompleteRef.current();
        return;
      }

      const next = cur[stepIndex.current];
      setTraveled((prev) => [...prev, next]);
      setCurrentIndex(stepIndex.current);
      onUpdateIndexRef.current(stepIndex.current);
      // Cinematic focus on each city: zoom + pan in one smooth motion.
      map.flyTo(next, 7, { duration: 1.5 });

      stepIndex.current++;
      timeoutRef.current = setTimeout(step, delay);
    }

    timeoutRef.current = setTimeout(step, delay);

    return () => clearTimeout(timeoutRef.current);
    // AnimatedMarker is keyed by `journey-${journeyId}` in the parent, so a
    // new journey remounts and re-runs this effect cleanly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, delay]);

  // Note: we deliberately don't render a `<Marker>` per traveled city here.
  // Each city already has a permanent `pawIcon` marker (rendered outside this
  // component, with tooltips), so traveled markers would be visually redundant
  // AND — without an `icon` prop — fall back to Leaflet's default blue pin,
  // which would overlap the paw icons and look broken.
  return (
    <>
      <Marker position={route[Math.min(currentIndex, route.length - 1)]} icon={pawIcon} />
      {traveled.length > 1 && (
        <Polyline positions={traveled} color="#8b6b8e" weight={4} />
      )}
    </>
  );
}

export default function SOLsJourneyAnimated() {
  const { language } = useLanguage();
  const [episodes, setEpisodes] = useState([]);
  // 3-phase state machine for the reveal UX:
  //   idle     → fresh map, only the current (last visited) city paw is shown.
  //              No route line, no other pins. Maximum dramatic reveal.
  //   playing  → animation is running. Visited pins appear progressively as
  //              the AnimatedMarker traverses, and the polyline draws behind
  //              the moving paw.
  //   complete → animation finished. All pins shown, full polyline visible.
  //              Button flips to "Replay" so the user can restart the show.
  const [phase, setPhase] = useState("idle"); // idle | playing | complete
  const [currentIndex, setCurrentIndex] = useState(0);
  const [journeyId, setJourneyId] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}episodes.json`)
      .then((res) => res.json())
      .then((data) => {
        const visible = data.filter((ep) => ep.visible && ep.location);
        visible.sort((a, b) => a.id - b.id);
        setEpisodes(visible);
      })
      .catch((err) => console.error("Failed to load episodes:", err));
  }, []);

  const t = {
    en: {
      pageTitle: "Sol's Journey – SolTheCat",
      metaDescription:
        "Interactive world map of Sol the Cat's travels — 50+ city pins from Athens to Petra. Click any pin to explore that SOLadventure.",
      heading: "Sol's Journey 🗺️",
      currentLocation: "📍 Current Location: ",
      showJourney: "▶️ Show Journey",
      replayJourney: "🔁 Replay Journey",
    },
    el: {
      pageTitle: "Το Ταξίδι της Sol – SolTheCat",
      metaDescription:
        "Διαδραστικός παγκόσμιος χάρτης των ταξιδιών της Sol the Cat — 50+ πόλεις από την Αθήνα μέχρι την Πέτρα. Κλικ σε κάθε pin για το αντίστοιχο SOLadventure.",
      heading: "Το Ταξίδι της Sol 🗺️",
      currentLocation: "📍 Τρέχουσα Τοποθεσία: ",
      showJourney: "▶️ Δες το Ταξίδι",
      replayJourney: "🔁 Δες το Ξανά",
    },
  }[language];

  const epTitle = (ep) =>
    typeof ep.title === "object" ? ep.title[language] : ep.title;

  const route = episodes.map((ep) => [ep.location.lat, ep.location.lng]);
  const titles = episodes.map(epTitle);
  const center = route.length > 0 ? route[route.length - 1] : [45, 10];
  const lastTitle = episodes.length > 0 ? epTitle(episodes[episodes.length - 1]) : "";

  const subheadingText = phase === "playing" && titles[currentIndex]
    ? titles[currentIndex]
    : `${t.currentLocation}${lastTitle}`;

  const handleStart = () => {
    setPhase("playing");
    setCurrentIndex(0);
    setJourneyId((prev) => prev + 1);
  };

  const handleComplete = () => {
    setPhase("complete");
  };

  return (
    <>
      <CurrentPawStyle />
      <Helmet>
        <title>{t.pageTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <link rel="canonical" href="https://solthecat.com/map" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Heading>{t.heading}</Heading>
        <Subheading>{subheadingText}</Subheading>

        {route.length > 1 && (
          <JourneyButton onClick={handleStart} disabled={phase === "playing"}>
            {phase === "complete" ? t.replayJourney : t.showJourney}
          </JourneyButton>
        )}

        <MapWrapper>
          <MapContainer
            center={center}
            zoom={5}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {episodes.map((ep, idx) => {
              // Phase-aware paw visibility:
              //   idle     → only the last (current) city paw — dramatic reveal.
              //   playing  → progressively, only paws Sol has reached so far.
              //              The AnimatedMarker handles the in-flight moving
              //              paw, so we render permanents only for idx STRICTLY
              //              before currentIndex to avoid double-stacking at
              //              the moving position.
              //   complete → all paws shown (full route now permanent).
              const lastIdx = episodes.length - 1;
              let visible;
              if (phase === "idle") visible = idx === lastIdx;
              else if (phase === "playing") visible = idx < currentIndex;
              else visible = true;
              if (!visible) return null;
              // Idle: the lone visible paw (the current city) gets the
              // pulsing variant so the user's eye lands on it instantly.
              const useCurrent = phase === "idle" && idx === lastIdx;
              return (
                <Marker
                  key={`paw-${idx}`}
                  position={[ep.location.lat, ep.location.lng]}
                  icon={useCurrent ? currentPawIcon : pawIcon}
                >
                  <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
                    <div
                      style={{
                        textAlign: "center",
                        maxWidth: "160px",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        fontSize: "0.85rem",
                        lineHeight: "1.2rem",
                        padding: "2px"
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                        {epTitle(ep)}
                      </div>
                      <img
                        src={`${import.meta.env.BASE_URL}${ep.image}`}
                        alt={epTitle(ep)}
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                        }}
                      />
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

            {/* Full static polyline only after the user has watched the
                journey play out. During idle we hide it for the reveal. */}
            {phase === "complete" && route.length > 1 && (
              <Polyline positions={route} color="#8b6b8e" weight={4} />
            )}

            {/* Focus the map on the current (last) city while idle so the
                user lands on Sol's "now" instead of a default world view. */}
            {phase === "idle" && route.length > 0 && <InitialFocus route={route} />}

            {phase === "playing" && (
              <AnimatedMarker
                key={`journey-${journeyId}`}
                route={route}
                delay={3000}
                onUpdateIndex={setCurrentIndex}
                onComplete={handleComplete}
              />
            )}
          </MapContainer>
        </MapWrapper>
      </PageContainer>
    </>
  );
}
