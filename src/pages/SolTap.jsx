// src/pages/SolTap.jsx
//
// "Quick Paws" — speed/reaction game. Cats appear randomly in a 3×4 grid,
// stay visible for 1.5s (or 0.7s for "quick" bonus cats), tap before they
// vanish. 30-second round, points scale with cat type.
//
// Zero new assets — uses standard cat emoji.

import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { celebrate } from "../utils/celebrate.js";
import { markDailyDoneIfMatches } from "../utils/dailyChallenge.js";

const ROUND_SECONDS = 30;
const GRID_ROWS = 4;
const GRID_COLS = 3;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

// Pool of cat emoji used for normal appearances.
const CAT_EMOJIS = ["🐱", "🐈", "😺", "😸", "😹", "😻", "😼", "🙀"];

// Spawn rate ramps from 1100ms → 600ms over the course of the round.
const SPAWN_MIN_MS = 600;
const SPAWN_MAX_MS = 1100;

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
  font-size: 1rem;
  color: #4a3f37;
  margin-bottom: 1rem;
  max-width: 600px;
  text-align: center;
  line-height: 1.5;
`;

const HUDRow = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  color: #1a1614;
`;

const HUDChip = styled.div`
  background: #ffffffcc;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(26, 22, 20, 0.15);
  font-size: 0.95rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${GRID_COLS}, 1fr);
  gap: 0.6rem;
  width: 100%;
  max-width: 360px;
  margin: 0 auto 1.5rem;
`;

const Cell = styled.div`
  aspect-ratio: 1 / 1;
  background: #ffffffcc;
  border-radius: 1rem;
  border: 2px solid #d4a5a5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const QuickBadge = styled.span`
  position: absolute;
  top: 0.25rem;
  right: 0.4rem;
  font-size: 0.65rem;
  background: #ff9800;
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
`;

const StartButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #8b6b8e;
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(26, 22, 20, 0.3);
  transition: transform 0.2s ease-in-out;
  margin-top: 1rem;

  &:hover {
    transform: scale(1.05);
  }
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

// --- Leaderboard styled bits (mirrored from CatchCats for visual parity) ---
const Top3Box = styled.div`
  background: #ffffffcc;
  border: 2px solid #d4a5a5;
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  margin: 0.5rem auto;
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

// Spawn rate eases linearly from MAX → MIN as the round progresses.
function spawnIntervalMs(elapsedSec) {
  const t = Math.min(1, elapsedSec / ROUND_SECONDS);
  return Math.round(SPAWN_MAX_MS - (SPAWN_MAX_MS - SPAWN_MIN_MS) * t);
}

function pickCatType() {
  const r = Math.random();
  if (r < 0.1) return { kind: "crown", points: 5, durationMs: 1500 };
  if (r < 0.3) return { kind: "quick", points: 3, durationMs: 700 };
  return { kind: "normal", points: 1, durationMs: 1500 };
}

export default function SolTap() {
  const { language } = useLanguage();
  const [phase, setPhase] = useState("intro"); // "intro" | "playing" | "ended"
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [cells, setCells] = useState(() => Array(TOTAL_CELLS).fill(null));

  // Leaderboard state — single board (no levels), so level="default".
  const [topEntries, setTopEntries] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [submitName, setSubmitName] = useState("");
  const [submitState, setSubmitState] = useState("idle"); // idle | submitting | submitted | skipped | error
  const [submittedRank, setSubmittedRank] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const startTimeRef = useRef(0);
  const spawnTimerRef = useRef(null);
  const expireTimerRef = useRef(null);
  const tickTimerRef = useRef(null);
  const finalRef = useRef(null);

  const t = {
    en: {
      pageTitle: "Quick Paws – SolTheCat",
      title: "Quick Paws 🐾",
      subtitle: `Tap the cats before they vanish! ${ROUND_SECONDS} seconds — quick cats are worth more, golden ones even more.`,
      start: "🐾 Start round",
      score: "Score",
      time: "Time",
      finishedTitle: "🎒 Round complete!",
      finalScore: (s) => `You scored ${s} points.`,
      legendQuick: "Quick = +3",
      legendCrown: "Golden = +5",
      playAgain: "🔁 Play again",
      back: "← Back to games",
      personalBest: (s) => `🏆 Your best: ${s}`,
      noBest: "🏆 No personal record yet",
      top3Title: "🏆 Top 5",
      top3Empty: "No scores yet — be the first!",
      newRecord: "🎉 NEW PERSONAL BEST!",
      qualifies: "🌟 You made the leaderboard!",
      enterName: "Enter your name:",
      submit: "Submit",
      skip: "Skip",
      submittedRank: (r) => `You're #${r} on the board!`,
    },
    el: {
      pageTitle: "Γρήγορες Πατούσες – SolTheCat",
      title: "Γρήγορες Πατούσες 🐾",
      subtitle: `Πάτα τις γάτες πριν εξαφανιστούν! ${ROUND_SECONDS} δευτερόλεπτα — οι γρήγορες δίνουν παραπάνω, οι χρυσές ακόμη περισσότερα.`,
      start: "🐾 Ξεκίνα τον γύρο",
      score: "Σκορ",
      time: "Χρόνος",
      finishedTitle: "🎒 Τέλος γύρου!",
      finalScore: (s) => `Σκόραρες ${s} πόντους.`,
      legendQuick: "Γρήγορη = +3",
      legendCrown: "Χρυσή = +5",
      playAgain: "🔁 Παίξε ξανά",
      back: "← Επιστροφή στα παιχνίδια",
      personalBest: (s) => `🏆 Καλύτερο σου: ${s}`,
      noBest: "🏆 Κανένα ρεκόρ ακόμη",
      top3Title: "🏆 Top 5",
      top3Empty: "Κανένα σκορ ακόμη — γίνε ο πρώτος!",
      newRecord: "🎉 ΝΕΟ ΠΡΟΣΩΠΙΚΟ ΡΕΚΟΡ!",
      qualifies: "🌟 Μπήκες στη βαθμολογία!",
      enterName: "Όνομα:",
      submit: "Καταχώρηση",
      skip: "Παράλειψη",
      submittedRank: (r) => `Είσαι #${r} στη βαθμολογία!`,
    },
  }[language];

  // Fetch top 3 + load personal best on mount.
  useEffect(() => {
    setPersonalBest(parseInt(localStorage.getItem("solTap_best") || "0", 10));
    fetch("/leaderboard?game=quick-paws&level=default")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setTopEntries(data.entries || []))
      .catch(() => setTopEntries([]));
  }, []);

  // After every "ended" phase, update personal best.
  useEffect(() => {
    if (phase !== "ended") return;
    const prevBest = parseInt(localStorage.getItem("solTap_best") || "0", 10);
    if (score > prevBest) {
      localStorage.setItem("solTap_best", String(score));
      setPersonalBest(score);
    }
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
    markDailyDoneIfMatches("quick-paws", "default");
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
          game: "quick-paws",
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

  // Auto-scroll on round end so the user sees the final card.
  useEffect(() => {
    if (phase === "ended" && finalRef.current) {
      requestAnimationFrame(() => {
        finalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [phase]);

  const stopAllTimers = useCallback(() => {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    if (expireTimerRef.current) clearInterval(expireTimerRef.current);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
  }, []);

  const scheduleSpawn = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const ms = spawnIntervalMs(elapsed);
    spawnTimerRef.current = setTimeout(() => {
      setCells((prev) => {
        const emptyIndices = prev
          .map((c, i) => (c ? null : i))
          .filter((i) => i !== null);
        if (emptyIndices.length === 0) return prev;
        const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const type = pickCatType();
        const next = [...prev];
        next[idx] = {
          id: `${Date.now()}-${idx}`,
          emoji:
            type.kind === "crown"
              ? "👑"
              : CAT_EMOJIS[Math.floor(Math.random() * CAT_EMOJIS.length)],
          kind: type.kind,
          points: type.points,
          expiresAt: Date.now() + type.durationMs,
        };
        return next;
      });
      scheduleSpawn();
    }, ms);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setCells(Array(TOTAL_CELLS).fill(null));
    setPhase("playing");
    startTimeRef.current = Date.now();

    // Tick down the timer every 250ms for smooth display.
    tickTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, ROUND_SECONDS - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        stopAllTimers();
        setPhase("ended");
        setCells(Array(TOTAL_CELLS).fill(null));
      }
    }, 250);

    // Expire cats whose window has elapsed (every 100ms for snappy feedback).
    expireTimerRef.current = setInterval(() => {
      setCells((prev) => {
        const now = Date.now();
        let changed = false;
        const next = prev.map((c) => {
          if (c && c.expiresAt < now) {
            changed = true;
            return null;
          }
          return c;
        });
        return changed ? next : prev;
      });
    }, 100);

    scheduleSpawn();
  };

  // Cleanup if user navigates away mid-round.
  useEffect(() => stopAllTimers, [stopAllTimers]);

  const handleTap = (idx) => {
    if (phase !== "playing") return;
    setCells((prev) => {
      const cat = prev[idx];
      if (!cat) return prev;
      setScore((s) => s + cat.points);
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

  // Confetti when player breaks a respectable score.
  useEffect(() => {
    if (phase === "ended" && score >= 25) celebrate();
  }, [phase, score]);

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <link rel="canonical" href="https://solthecat.com/games/quick-paws" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title>{t.title}</Title>

        {phase === "intro" && (
          <>
            <Subtitle>{t.subtitle}</Subtitle>
            <Subtitle style={{ fontSize: "0.85rem", marginTop: "-0.5rem" }}>
              <span style={{ color: "#ff9800", fontWeight: 700 }}>★ {t.legendQuick}</span>
              {" · "}
              <span style={{ color: "#8b6b8e", fontWeight: 700 }}>👑 {t.legendCrown}</span>
            </Subtitle>

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

            <StartButton onClick={startGame}>{t.start}</StartButton>
          </>
        )}

        {phase === "playing" && (
          <>
            <HUDRow>
              <HUDChip>{t.score}: {score}</HUDChip>
              <HUDChip>{t.time}: {Math.ceil(timeLeft)}s</HUDChip>
            </HUDRow>
            <Grid>
              {cells.map((cat, idx) => (
                <Cell key={idx} onClick={() => handleTap(idx)}>
                  <AnimatePresence>
                    {cat && (
                      <motion.span
                        key={cat.id}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ position: "relative" }}
                      >
                        {cat.emoji}
                        {cat.kind === "quick" && <QuickBadge>!</QuickBadge>}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Cell>
              ))}
            </Grid>
          </>
        )}

        {phase === "ended" && (
          <FinalCard
            ref={finalRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FinalScore>{t.finishedTitle}</FinalScore>
            <FinalMessage>{t.finalScore(score)}</FinalMessage>

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

            <StartButton onClick={startGame}>{t.playAgain}</StartButton>
          </FinalCard>
        )}

        <BackLink to="/games">{t.back}</BackLink>
      </PageContainer>
    </>
  );
}
