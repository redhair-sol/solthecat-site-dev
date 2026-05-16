// src/pages/MapQuiz.jsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { celebrate } from "../utils/celebrate.js";
import { markDailyDoneIfMatches } from "../utils/dailyChallenge.js";

const ROUNDS = 5;
const MAX_PER_ROUND = 1000;

const Title = styled.h1`
  font-family: 'Instrument Serif', serif;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  line-height: 1.05;
  color: var(--sol-ink);
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const Subtitle = styled.p`
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: var(--sol-ink-soft);
  margin-bottom: 1rem;
  max-width: 600px;
  text-align: center;
  line-height: 1.5;
`;

const ScoreLine = styled.p`
  font-size: 0.95rem;
  color: #1a1614;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const BigButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#8b6b8e")};
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  box-shadow: 0 4px 10px rgba(26, 22, 20, 0.3);
  transition: transform 0.2s ease-in-out;
  margin-top: 1rem;

  &:hover {
    transform: ${({ disabled }) => (disabled ? "none" : "scale(1.05)")};
  }
`;

const PhotoWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto 1rem;
`;

const PhotoCard = styled.div`
  background: #ffffff;
  border-radius: 1rem;
  padding: 0.5rem;
  box-shadow: 0 4px 16px rgba(26, 22, 20, 0.18);
  text-align: center;
`;

const Photo = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 0.6rem;
  display: block;
`;

const PhotoCaption = styled.p`
  font-size: 0.9rem;
  color: #4a3f37;
  font-style: italic;
  margin: 0.5rem 0 0;
`;

const MapWrapper = styled.div`
  height: 50vh;
  min-height: 350px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 1rem;
  border-radius: 1rem;
  overflow: hidden;
  border: 2px solid #8b6b8e;
  box-shadow: 0 4px 16px rgba(26, 22, 20, 0.18);
  cursor: ${({ $clickable }) => ($clickable ? "crosshair" : "default")};
  /* Confine Leaflet's internal z-indices within this stacking context. */
  position: relative;
  z-index: 0;

  /* dvh below the lg: breakpoint (tablet portrait + phones) so map fits
     between Topbar and BottomTabBar without clipping the active marker. */
  @media (max-width: 1023px) {
    height: 50dvh;
    min-height: 320px;
  }

  .leaflet-container {
    width: 100%;
    height: 100%;
  }
`;

const ResultCard = styled(motion.div)`
  background: #ffffffcc;
  padding: 1.2rem 1.5rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 16px rgba(26, 22, 20, 0.18);
  text-align: center;
  margin: 0.5rem auto 1rem;
`;

const ResultEmoji = styled.div`
  font-size: 2rem;
  margin-bottom: 0.3rem;
`;

const ResultPoints = styled.h2`
  font-size: 1.4rem;
  color: #1a1614;
  margin: 0 0 0.3rem;
`;

const ResultDistance = styled.p`
  font-size: 0.95rem;
  color: #4a3f37;
  margin: 0;
`;

const FinalCard = styled(motion.div)`
  background: #ffffffcc;
  padding: 1.5rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(26, 22, 20, 0.18);
  text-align: center;
  margin-top: 1rem;
`;

const FinalScore = styled.h2`
  font-size: 1.6rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
`;

const FinalMessage = styled.p`
  font-size: 1rem;
  color: #4a3f37;
  margin-bottom: 1rem;
`;

const BackLink = styled(Link)`
  display: block;
  margin-top: 2rem;
  color: #7a5a7c;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
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

// --- Leaderboard styled bits (mirrored from CatchCats for visual parity) ---
const Top3Box = styled.div`
  background: #ffffffcc;
  border: 2px solid #d4a5a5;
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  margin: 0.5rem auto 1rem;
  max-width: 320px;
  width: 100%;
  font-family: 'Poppins', sans-serif;
  text-align: left;
`;

const Top3Title = styled.p`
  font-weight: 700;
  color: #1a1614;
  margin: 0 0 0.4rem;
  text-align: center;
  font-size: 0.95rem;
`;

const Top3Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #4a3f37;
  padding: 0.15rem 0;
`;

const Top3Empty = styled.p`
  color: #4a3f37;
  font-size: 0.85rem;
  font-style: italic;
  text-align: center;
  margin: 0;
`;

const PersonalBestText = styled.p`
  color: #8b6b8e;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  text-align: center;
  margin: 0.4rem 0;
`;

const NameInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 0.6rem;
`;

const NameInput = styled.input`
  padding: 0.6rem 1rem;
  border: 2px solid #8b6b8e;
  border-radius: 999px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #4a3f37;
  outline: none;
  width: 12ch;

  &:focus {
    border-color: #8b6b8e;
    box-shadow: 0 0 0 3px rgba(26, 22, 20, 0.15);
  }
`;

const SmallButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: ${({ $secondary }) => ($secondary ? "#ffffff" : "#8b6b8e")};
  color: ${({ $secondary }) => ($secondary ? "#1a1614" : "white")};
  border: 2px solid #8b6b8e;
  border-radius: 999px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

// Reuse the same paw icon as SOLsJourney for the actual location marker —
// brand-consistent and already optimized.
const pawIcon = new L.Icon({
  iconUrl: "/icons/toe.webp",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// User-click marker: simple pink pin emoji via divIcon so we don't need a new asset.
const userIcon = L.divIcon({
  className: "mapquiz-user-icon",
  html: '<div style="font-size:28px;line-height:1;transform:translate(-50%,-100%);position:absolute;">📍</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function scoreFromDistance(km) {
  if (km < 100) return { points: 1000, tier: "bullseye" };
  if (km < 500) return { points: 700, tier: "close" };
  if (km < 1500) return { points: 400, tier: "good" };
  if (km < 4000) return { points: 150, tier: "area" };
  return { points: 30, tier: "far" };
}

function ClickCatcher({ onSelect, disabled }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MapQuiz() {
  const { language } = useLanguage();
  const [episodes, setEpisodes] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [phase, setPhase] = useState("intro"); // "intro" | "playing" | "reveal" | "final"
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [queue, setQueue] = useState([]); // shuffled list of episodes for this game
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [userPick, setUserPick] = useState(null);
  const [roundResult, setRoundResult] = useState(null);

  // Leaderboard state, single board, level="default".
  const [topEntries, setTopEntries] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [submitName, setSubmitName] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [submittedRank, setSubmittedRank] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Refs for auto-scroll on phase change. On mobile the page is tall (photo +
  // map + result stack), so when the user clicks the map the ResultCard
  // appears below the fold and they don't realize the round has resolved.
  const roundTopRef = useRef(null); // points at round subtitle (above photo)
  const resultRef = useRef(null);
  const finalRef = useRef(null);

  const t = {
    en: {
      pageTitle: "Where in the World? – SolTheCat",
      title: "Where in the World? 🌍",
      subtitle: `Sol took a photo. Click on the map where you think she was. ${ROUNDS} rounds.`,
      start: "🐾 Start the journey",
      progress: (r) => `Round ${r} / ${ROUNDS}`,
      scoreLine: (s) => `Score: ${s}`,
      promptClick: "Click on the map to place your guess.",
      distance: (km) => `${km} km away`,
      tiers: {
        bullseye: "🎯 Bullseye!",
        close: "🔥 Very close!",
        good: "👍 Not bad.",
        area: "🌍 Right area.",
        far: "😅 Way off.",
      },
      next: "Next round →",
      finish: "See result →",
      finishedTitle: "🎒 Adventure complete!",
      finishedScore: (s) => `Final score: ${s} / ${ROUNDS * MAX_PER_ROUND}`,
      finishedPerfect: "Pawfect navigator! 🏆",
      finishedGood: "Sol's impressed! 🐾",
      finishedSoso: "Keep exploring!",
      playAgain: "🔁 Play again",
      back: "← Back to games",
      loadFail: "Couldn't load episodes. Please try refreshing the page.",
      personalBest: (s) => `🏆 Your best: ${s}`,
      noBest: "🏆 No personal record yet",
      top3Title: "🏆 Top 5",
      top3Empty: "No scores yet, be the first!",
      newRecord: "🎉 NEW PERSONAL BEST!",
      qualifies: "🌟 You made the leaderboard!",
      enterName: "Enter your name:",
      submit: "Submit",
      skip: "Skip",
      submittedRank: (r) => `You're #${r} on the board!`,
    },
    el: {
      pageTitle: "Πού στον Κόσμο; – SolTheCat",
      title: "Πού στον Κόσμο; 🌍",
      subtitle: `Η Sol έβγαλε μια φωτογραφία. Κλίκαρε στον χάρτη πού νομίζεις ότι ήταν. ${ROUNDS} γύροι.`,
      start: "🐾 Ξεκίνα το ταξίδι",
      progress: (r) => `Γύρος ${r} / ${ROUNDS}`,
      scoreLine: (s) => `Σκορ: ${s}`,
      promptClick: "Κλίκαρε στον χάρτη για την επιλογή σου.",
      distance: (km) => `${km} χλμ. μακριά`,
      tiers: {
        bullseye: "🎯 Διάνα!",
        close: "🔥 Πολύ κοντά!",
        good: "👍 Καλά!",
        area: "🌍 Σωστή περιοχή.",
        far: "😅 Πολύ μακριά.",
      },
      next: "Επόμενος γύρος →",
      finish: "Αποτέλεσμα →",
      finishedTitle: "🎒 Τέλος ταξιδιού!",
      finishedScore: (s) => `Τελικό σκορ: ${s} / ${ROUNDS * MAX_PER_ROUND}`,
      finishedPerfect: "Τέλειος πλοηγός! 🏆",
      finishedGood: "Η Sol εντυπωσιάστηκε! 🐾",
      finishedSoso: "Συνέχισε να εξερευνείς!",
      playAgain: "🔁 Παίξε ξανά",
      back: "← Επιστροφή στα παιχνίδια",
      loadFail: "Δεν φόρτωσαν τα επεισόδια. Παρακαλώ δοκίμασε refresh.",
      personalBest: (s) => `🏆 Καλύτερο σου: ${s}`,
      noBest: "🏆 Κανένα ρεκόρ ακόμη",
      top3Title: "🏆 Top 5",
      top3Empty: "Κανένα σκορ ακόμη, γίνε ο πρώτος!",
      newRecord: "🎉 ΝΕΟ ΠΡΟΣΩΠΙΚΟ ΡΕΚΟΡ!",
      qualifies: "🌟 Μπήκες στη βαθμολογία!",
      enterName: "Όνομα:",
      submit: "Καταχώρηση",
      skip: "Παράλειψη",
      submittedRank: (r) => `Είσαι #${r} στη βαθμολογία!`,
    },
  }[language];

  // Auto-scroll the relevant section into view when the phase changes:
  //   - reveal → center the ResultCard so the user sees the score immediately
  //   - final  → center the FinalCard
  //   - playing (incl. round transitions) → top-align the round subtitle so
  //     the user sees the round number, score AND the new photo + map below
  useEffect(() => {
    let target = null;
    let block = "center";
    if (phase === "reveal") target = resultRef.current;
    else if (phase === "final") target = finalRef.current;
    else if (phase === "playing") {
      target = roundTopRef.current;
      block = "start";
    }
    if (target) {
      // rAF lets the new DOM/animation settle before measuring scroll.
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block });
      });
    }
  }, [phase, round]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}episodes.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const usable = data.filter(
          (ep) => ep.visible && ep.location?.lat != null && ep.location?.lng != null
        );
        setEpisodes(usable);
        setLoadError(false);
      })
      .catch((err) => {
        console.error("Failed to load episodes:", err);
        setLoadError(true);
      });
  }, []);

  // Fetch top 3 + load personal best on mount.
  useEffect(() => {
    setPersonalBest(parseInt(localStorage.getItem("mapQuiz_best") || "0", 10));
    fetch("/leaderboard?game=mapquiz&level=default")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setTopEntries(data.entries || []))
      .catch(() => setTopEntries([]));
  }, []);

  // Update personal best whenever the final phase begins.
  useEffect(() => {
    if (phase !== "final") return;
    const prevBest = parseInt(localStorage.getItem("mapQuiz_best") || "0", 10);
    if (score > prevBest) {
      localStorage.setItem("mapQuiz_best", String(score));
      setPersonalBest(score);
    }
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
    markDailyDoneIfMatches("mapquiz", "default");
  }, [phase, score]);

  const qualifiesForLeaderboard = () => {
    if (score <= 0) return false;
    if (topEntries.length < 3) return true;
    return score > topEntries[2].score;
  };

  const submitToLeaderboard = async () => {
    const name = submitName.trim();
    if (!name) return;
    setSubmitState("submitting");
    try {
      const res = await fetch("/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: "mapquiz",
          level: "default",
          score,
          name,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setSubmittedRank(data.rank || null);
      setTopEntries(data.top || []);
      setSubmitState("submitted");
    } catch (err) {
      console.error("Leaderboard submit failed:", err);
      setSubmitError(err.message || "Submit failed");
      setSubmitState("error");
    }
  };

  const skipSubmit = () => setSubmitState("skipped");

  const startGame = () => {
    if (episodes.length < ROUNDS) return;
    const shuffled = shuffle(episodes).slice(0, ROUNDS);
    setQueue(shuffled);
    setCurrentEpisode(shuffled[0]);
    setRound(1);
    setScore(0);
    setUserPick(null);
    setRoundResult(null);
    setPhase("playing");
  };

  const handleMapClick = ({ lat, lng }) => {
    if (phase !== "playing" || !currentEpisode) return;
    const km = haversine(
      lat,
      lng,
      currentEpisode.location.lat,
      currentEpisode.location.lng
    );
    const { points, tier } = scoreFromDistance(km);
    setUserPick({ lat, lng });
    setRoundResult({ km: Math.round(km), points, tier });
    setScore((s) => s + points);
    setPhase("reveal");
  };

  const handleNext = () => {
    if (round >= ROUNDS) {
      setPhase("final");
      // Celebrate if user reached at least 80% of max possible.
      if (score >= ROUNDS * MAX_PER_ROUND * 0.8) celebrate();
      return;
    }
    const next = queue[round]; // queue is 0-indexed, round is 1-based
    setCurrentEpisode(next);
    setRound((r) => r + 1);
    setUserPick(null);
    setRoundResult(null);
    setPhase("playing");
  };

  const finalMessage =
    score >= ROUNDS * MAX_PER_ROUND * 0.8
      ? t.finishedPerfect
      : score >= ROUNDS * MAX_PER_ROUND * 0.4
      ? t.finishedGood
      : t.finishedSoso;

  const epCaption =
    currentEpisode &&
    (typeof currentEpisode.caption === "object"
      ? currentEpisode.caption[language]
      : currentEpisode.caption);

  const polylinePositions =
    userPick && currentEpisode
      ? [
          [userPick.lat, userPick.lng],
          [currentEpisode.location.lat, currentEpisode.location.lng],
        ]
      : null;

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <link rel="canonical" href="https://solthecat.com/games/mapquiz" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title>{t.title}</Title>

        {loadError && <ErrorBox role="alert">{t.loadFail}</ErrorBox>}

        {phase === "intro" && !loadError && (
          <>
            <Subtitle>{t.subtitle}</Subtitle>

            <Top3Box>
              <Top3Title>{t.top3Title}</Top3Title>
              {topEntries.length === 0 ? (
                <Top3Empty>{t.top3Empty}</Top3Empty>
              ) : (
                topEntries.map((e, i) => (
                  <Top3Row key={`${e.name}-${e.score}-${i}`}>
                    <span>
                      <span style={{display:"inline-block",width:"1.5em"}}>{["🥇", "🥈", "🥉"][i] || ""}</span>{e.name}
                    </span>
                    <span><strong>{e.score}</strong></span>
                  </Top3Row>
                ))
              )}
              <PersonalBestText>
                {personalBest > 0 ? t.personalBest(personalBest) : t.noBest}
              </PersonalBestText>
            </Top3Box>

            <BigButton onClick={startGame} disabled={episodes.length < ROUNDS}>
              {t.start}
            </BigButton>
          </>
        )}

        {(phase === "playing" || phase === "reveal") && currentEpisode && (
          <>
            <Subtitle ref={roundTopRef}>{t.progress(round)}</Subtitle>
            <ScoreLine>{t.scoreLine(score)}</ScoreLine>

            <PhotoWrapper>
              <PhotoCard>
                <Photo
                  src={`${import.meta.env.BASE_URL}${currentEpisode.image}`}
                  alt=""
                  width="800"
                  height="800"
                  loading="eager"
                  decoding="async"
                />
                {epCaption && <PhotoCaption>{epCaption}</PhotoCaption>}
              </PhotoCard>
            </PhotoWrapper>

            {phase === "playing" && <Subtitle>{t.promptClick}</Subtitle>}

            <MapWrapper $clickable={phase === "playing"}>
              <MapContainer
                center={[20, 0]}
                zoom={2}
                minZoom={2}
                worldCopyJump
                scrollWheelZoom
                doubleClickZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickCatcher
                  onSelect={handleMapClick}
                  disabled={phase !== "playing"}
                />
                {userPick && (
                  <Marker position={[userPick.lat, userPick.lng]} icon={userIcon} />
                )}
                {phase === "reveal" && (
                  <Marker
                    position={[
                      currentEpisode.location.lat,
                      currentEpisode.location.lng,
                    ]}
                    icon={pawIcon}
                  />
                )}
                {phase === "reveal" && polylinePositions && (
                  <Polyline
                    positions={polylinePositions}
                    pathOptions={{ color: "#8b6b8e", weight: 3, dashArray: "6 8" }}
                  />
                )}
              </MapContainer>
            </MapWrapper>

            {phase === "reveal" && roundResult && (
              <ResultCard
                ref={resultRef}
                key={`result-${round}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ResultEmoji>{t.tiers[roundResult.tier].split(" ")[0]}</ResultEmoji>
                <ResultPoints>
                  {t.tiers[roundResult.tier].replace(/^\S+\s/, "")} +{roundResult.points}
                </ResultPoints>
                <ResultDistance>{t.distance(roundResult.km)}</ResultDistance>
                <BigButton onClick={handleNext}>
                  {round >= ROUNDS ? t.finish : t.next}
                </BigButton>
              </ResultCard>
            )}
          </>
        )}

        {phase === "final" && (
          <FinalCard
            ref={finalRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FinalScore>{t.finishedTitle}</FinalScore>
            <FinalMessage>{t.finishedScore(score)}</FinalMessage>
            <FinalMessage>{finalMessage}</FinalMessage>

            {score > 0 && score >= personalBest && (
              <PersonalBestText style={{ fontSize: "1rem" }}>
                {t.newRecord}
              </PersonalBestText>
            )}

            {qualifiesForLeaderboard() && submitState === "idle" && (
              <>
                <PersonalBestText>{t.qualifies}</PersonalBestText>
                <p style={{ color: "#4a3f37", fontSize: "0.85rem", margin: "0.3rem 0" }}>
                  {t.enterName}
                </p>
                <NameInputRow>
                  <NameInput
                    type="text"
                    maxLength={12}
                    value={submitName}
                    onChange={(e) => setSubmitName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && submitName.trim()) submitToLeaderboard();
                    }}
                    placeholder="Sol"
                    autoFocus
                  />
                  <SmallButton
                    onClick={submitToLeaderboard}
                    disabled={!submitName.trim()}
                  >
                    {t.submit}
                  </SmallButton>
                  <SmallButton $secondary onClick={skipSubmit}>
                    {t.skip}
                  </SmallButton>
                </NameInputRow>
              </>
            )}

            {submitState === "submitting" && (
              <PersonalBestText>...</PersonalBestText>
            )}

            {submitState === "submitted" && submittedRank && (
              <PersonalBestText style={{ fontSize: "1rem" }}>
                {t.submittedRank(submittedRank)}
              </PersonalBestText>
            )}

            {submitState === "error" && (
              <>
                <PersonalBestText style={{ color: "#c62828", fontSize: "0.9rem" }}>
                  ⚠️ {submitError || "Submit failed"}
                </PersonalBestText>
                <SmallButton onClick={() => setSubmitState("idle")}>
                  Try again
                </SmallButton>
              </>
            )}

            <BigButton onClick={startGame}>{t.playAgain}</BigButton>
          </FinalCard>
        )}

        <BackLink to="/games">{t.back}</BackLink>
      </PageContainer>
    </>
  );
}
