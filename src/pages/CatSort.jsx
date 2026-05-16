// src/pages/CatSort.jsx
//
// "Cat Sort" — simplified version of the cat-sort puzzle from the IG ad.
// Cats wait in a top row; tap one to send it to the nest. Two matching cats
// in the nest auto-rescue. Win when grid + nest are empty. Lose if the nest
// fills with 4 different cats (no pair available to clear).
// 5 levels, increasing variety (2 → 5 emoji types). Zero new assets.

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { celebrate } from "../utils/celebrate.js";
import { markDailyDoneIfMatches } from "../utils/dailyChallenge.js";
import { upperLocal } from "../utils/greekUpper.js";

const NEST_SIZE = 4;

// Pool of cat emoji for puzzle variety.
const CAT_POOL = ["🐱", "😺", "😸", "😻", "😼", "🙀"];

// Level definitions: { topCount, types } — cells in top row + how many
// distinct emoji to draw from. Counts are even per emoji so puzzles are
// always solvable in principle (never start in a guaranteed-lose state).
const LEVELS = [
  { topCount: 6, types: 2 }, // 1 — 3 pairs of 2 types each
  { topCount: 6, types: 3 }, // 2 — 2 pairs of 3 types
  { topCount: 8, types: 3 }, // 3 — mixed (4+2+2)
  { topCount: 8, types: 4 }, // 4 — 2 pairs each
  { topCount: 10, types: 5 }, // 5 — 2 pairs each, max variety
];

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
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
  font-family: 'Poppins', sans-serif;
  color: #1a1614;
  font-weight: 600;
`;

const HUDChip = styled.div`
  background: #ffffffcc;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(26, 22, 20, 0.15);
  font-size: 0.9rem;
`;

const RowLabel = styled.p`
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  color: #4a3f37;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  margin: 0.5rem 0 0.4rem;
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  gap: 0.5rem;
  width: 100%;
  max-width: 480px;
  margin: 0 auto 1rem;
`;

const Nest = styled.div`
  display: grid;
  grid-template-columns: repeat(${NEST_SIZE}, 1fr);
  gap: 0.5rem;
  width: 100%;
  max-width: 320px;
  margin: 0 auto 1rem;
  padding: 0.6rem;
  background: #ede4d3;
  border-radius: 1rem;
  border: 2px dashed #8b6b8e;
`;

const Cell = styled.div`
  aspect-ratio: 1 / 1;
  background: ${({ $empty }) => ($empty ? "transparent" : "#ffffff")};
  border-radius: 0.8rem;
  border: ${({ $empty, $nest }) =>
    $empty
      ? $nest
        ? "2px dashed #8b6b8eaa"
        : "2px dashed #d4a5a5"
      : "2px solid #d4a5a5"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: ${({ $empty }) => ($empty ? "default" : "pointer")};
  user-select: none;
  transition: transform 0.1s ease;

  &:active {
    transform: ${({ $empty }) => ($empty ? "none" : "scale(0.92)")};
  }
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

const ResultCard = styled(motion.div)`
  background: #ffffffcc;
  padding: 1.5rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(26, 22, 20, 0.18);
  text-align: center;
  margin-top: 1rem;
`;

const ResultTitle = styled.h2`
  font-size: 1.4rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
`;

const ResultMessage = styled.p`
  font-size: 1rem;
  color: #4a3f37;
  margin-bottom: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
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

// Score formula mirrors puzzlemap/royalpuzzle: max(0, CAP - totalSeconds).
const CAT_SORT_SCORE_CAP = 9999;

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Build a top row for the given level. Each emoji appears in even counts so
// the puzzle is always solvable in principle.
function buildLevel(levelIndex) {
  const { topCount, types } = LEVELS[levelIndex];
  const pickedEmojis = shuffle(CAT_POOL).slice(0, types);

  // Distribute counts evenly. If topCount/types isn't a clean integer,
  // give extras (in pairs) to the first few types so all counts stay even.
  const baseCount = Math.floor(topCount / types);
  const evenBase = baseCount % 2 === 0 ? baseCount : baseCount - 1;
  const extras = topCount - evenBase * types; // always even
  const extraPairs = extras / 2;

  const cells = [];
  pickedEmojis.forEach((emoji, idx) => {
    const count = evenBase + (idx < extraPairs ? 2 : 0);
    for (let i = 0; i < count; i++) {
      cells.push({ id: `${emoji}-${i}-${Math.random()}`, emoji });
    }
  });
  return shuffle(cells);
}

export default function CatSort() {
  const { language } = useLanguage();
  const [phase, setPhase] = useState("intro"); // intro | playing | won | lost | done
  const [levelIndex, setLevelIndex] = useState(0);
  const [topRow, setTopRow] = useState([]);
  const [nest, setNest] = useState(Array(NEST_SIZE).fill(null));
  const resultRef = useRef(null);

  // Run-wide timer (across all 5 levels). startTime is set the first time
  // the user enters level 1; it keeps ticking across won/playing transitions
  // and through level retries. Reset only on a fresh full-game restart.
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [levelMoves, setLevelMoves] = useState(0);

  // Leaderboard state — single board, level="default".
  const [winScore, setWinScore] = useState(0);
  const [topEntries, setTopEntries] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [submitName, setSubmitName] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [submittedRank, setSubmittedRank] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const t = {
    en: {
      pageTitle: "Cat Sort – SolTheCat",
      title: "Cat Sort 🏠",
      subtitle:
        "Tap a cat to send it to the nest. Two matching cats auto-rescue. Don't fill the nest with different cats!",
      start: "🐾 Start",
      level: "Level",
      nest: "Nest",
      cats: "Cats",
      wonTitle: "🎉 Level cleared!",
      wonMessage: (n) => `Level ${n} done. Onward to the next!`,
      lostTitle: "🙀 Nest is full",
      lostMessage: "All four nest slots have different cats. Try again!",
      doneTitle: "👑 You rescued every cat!",
      doneMessage: "All 5 levels complete. The Queen approves.",
      next: "Next level →",
      retry: "🔁 Retry level",
      restartRun: "🔁 Restart run",
      restart: "🔁 Start over",
      back: "← Back to games",
      time: "Time",
      moves: "Moves",
      finalScore: (s) => `⏱️ Finished in ${s}s!`,
      personalBest: (s) => `🏆 Your best: ${s} pts`,
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
      pageTitle: "Ταξινόμηση Γατών – SolTheCat",
      title: "Ταξινόμηση Γατών 🏠",
      subtitle:
        "Πάτα γάτα για να την στείλεις στη φωλιά. Δύο ίδιες auto-rescue. Μη γεμίσεις τη φωλιά με διαφορετικές!",
      start: "🐾 Ξεκίνα",
      level: "Επίπεδο",
      nest: "Φωλιά",
      cats: "Γάτες",
      wonTitle: "🎉 Πέρασες το επίπεδο!",
      wonMessage: (n) => `Επίπεδο ${n} ολοκληρώθηκε. Πάμε στο επόμενο!`,
      lostTitle: "🙀 Η φωλιά γέμισε",
      lostMessage:
        "Και οι 4 θέσεις της φωλιάς έχουν διαφορετικές γάτες. Ξαναπροσπάθησε!",
      doneTitle: "👑 Έσωσες όλες τις γάτες!",
      doneMessage: "Πέρασες και τα 5 επίπεδα. Η Βασίλισσα ευχαριστιέται.",
      next: "Επόμενο επίπεδο →",
      retry: "🔁 Ξανά αυτό το επίπεδο",
      restartRun: "🔁 Επανεκκίνηση από την αρχή",
      restart: "🔁 Από την αρχή",
      back: "← Επιστροφή στα παιχνίδια",
      time: "Χρόνος",
      moves: "Κινήσεις",
      finalScore: (s) => `⏱️ Ολοκληρώθηκε σε ${s}δ.!`,
      personalBest: (s) => `🏆 Καλύτερο σου: ${s} πόντοι`,
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

  // Auto-scroll on result so user sees the win/lose card on mobile.
  useEffect(() => {
    if ((phase === "won" || phase === "lost" || phase === "done") && resultRef.current) {
      requestAnimationFrame(() => {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [phase]);

  // Fetch top 3 + load personal best on mount.
  useEffect(() => {
    setPersonalBest(parseInt(localStorage.getItem("catSort_best") || "0", 10));
    fetch("/leaderboard?game=cat-sort&level=default")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setTopEntries(data.entries || []))
      .catch(() => setTopEntries([]));
  }, []);

  // On full-run completion, freeze the score and update personal best.
  useEffect(() => {
    if (phase !== "done" || !startTime) return;
    const finalElapsed = Math.floor((Date.now() - startTime) / 1000);
    setElapsed(finalElapsed);
    const score = Math.max(0, CAT_SORT_SCORE_CAP - finalElapsed);
    setWinScore(score);
    const prevBest = parseInt(localStorage.getItem("catSort_best") || "0", 10);
    if (score > prevBest) {
      localStorage.setItem("catSort_best", String(score));
      setPersonalBest(score);
    }
    markDailyDoneIfMatches("cat-sort", "default");
  }, [phase, startTime]);

  const qualifiesForLeaderboard = () => {
    if (winScore <= 0) return false;
    if (topEntries.length < 3) return true;
    return winScore > topEntries[2].score;
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
          game: "cat-sort",
          level: "default",
          score: winScore,
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

  const startLevel = (idx) => {
    setLevelIndex(idx);
    setTopRow(buildLevel(idx));
    setNest(Array(NEST_SIZE).fill(null));
    setLevelMoves(0);
    setPhase("playing");
  };

  // Fresh full-run start (level 1, timer from zero). Used for "Start" and
  // for "Restart run" from the lost/done screens.
  const startGame = () => {
    setStartTime(Date.now());
    setElapsed(0);
    setWinScore(0);
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
    startLevel(0);
  };

  // Cumulative timer — ticks while not on intro/done/lost. Keeps running
  // across won → playing transitions and across level retries (penalising
  // mistakes via wall-clock time).
  useEffect(() => {
    if (!startTime) return;
    if (phase === "done" || phase === "lost" || phase === "intro") return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime, phase]);

  const tapCat = (cellIndex) => {
    if (phase !== "playing") return;
    const cat = topRow[cellIndex];
    if (!cat) return;

    setLevelMoves((m) => m + 1);

    // Remove from top row.
    setTopRow((prev) => prev.map((c, i) => (i === cellIndex ? null : c)));

    // Try to pair in nest.
    setNest((prev) => {
      const matchIdx = prev.findIndex((n) => n && n.emoji === cat.emoji);
      if (matchIdx !== -1) {
        // Pair found — both cats rescued.
        const next = [...prev];
        next[matchIdx] = null;
        return next;
      }
      // No match — drop into first empty slot.
      const emptyIdx = prev.findIndex((n) => n === null);
      if (emptyIdx === -1) return prev; // shouldn't happen (lose check below)
      const next = [...prev];
      next[emptyIdx] = cat;
      return next;
    });
  };

  // Win/lose detection runs after every state update.
  // Strict lost-check: nest full with 4 unique emojis = game over, regardless
  // of whether the top row contains a matching cat. This is what makes the
  // game a real puzzle — random play can fill the nest before you clear it.
  useEffect(() => {
    if (phase !== "playing") return;
    const topRemaining = topRow.filter(Boolean).length;
    const nestFilled = nest.filter(Boolean).length;

    if (topRemaining === 0 && nestFilled === 0) {
      // Cleared this level.
      const isLast = levelIndex === LEVELS.length - 1;
      if (isLast) {
        setPhase("done");
        celebrate();
      } else {
        setPhase("won");
        celebrate();
      }
      return;
    }

    if (nestFilled === NEST_SIZE) {
      // Strict: lost if the nest itself has no pair (all unique emojis).
      // Top row no longer offers a recovery path.
      const nestEmojis = nest.filter(Boolean).map((c) => c.emoji);
      const hasInternalPair = new Set(nestEmojis).size < nestEmojis.length;
      if (!hasInternalPair) setPhase("lost");
    }
  }, [topRow, nest, phase, levelIndex]);

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <link rel="canonical" href="https://solthecat.com/games/cat-sort" />
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
              <HUDChip>
                {t.level}: {levelIndex + 1} / {LEVELS.length}
              </HUDChip>
              <HUDChip>
                {t.cats}: {topRow.filter(Boolean).length}
              </HUDChip>
              <HUDChip>
                {t.moves}: {levelMoves}
              </HUDChip>
              <HUDChip>
                {t.time}: {elapsed}s
              </HUDChip>
            </HUDRow>

            <RowLabel>{upperLocal(t.cats)}</RowLabel>
            <TopRow>
              {topRow.map((cat, idx) => (
                <Cell
                  key={cat ? cat.id : `empty-${idx}`}
                  $empty={!cat}
                  onClick={() => tapCat(idx)}
                >
                  <AnimatePresence>
                    {cat && (
                      <motion.span
                        key={cat.id}
                        initial={{ scale: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {cat.emoji}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Cell>
              ))}
            </TopRow>

            <RowLabel>{upperLocal(t.nest)}</RowLabel>
            <Nest>
              {nest.map((cat, idx) => (
                <Cell key={`nest-${idx}`} $empty={!cat} $nest>
                  <AnimatePresence>
                    {cat && (
                      <motion.span
                        key={cat.id}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {cat.emoji}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Cell>
              ))}
            </Nest>
          </>
        )}

        {phase === "won" && (
          <ResultCard
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultTitle>{t.wonTitle}</ResultTitle>
            <ResultMessage>{t.wonMessage(levelIndex + 1)}</ResultMessage>
            <ButtonRow>
              <StartButton onClick={() => startLevel(levelIndex + 1)}>
                {t.next}
              </StartButton>
            </ButtonRow>
          </ResultCard>
        )}

        {phase === "lost" && (
          <ResultCard
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultTitle>{t.lostTitle}</ResultTitle>
            <ResultMessage>{t.lostMessage}</ResultMessage>
            <ButtonRow>
              <StartButton onClick={() => startLevel(levelIndex)}>
                {t.retry}
              </StartButton>
              <StartButton onClick={startGame}>
                {t.restartRun}
              </StartButton>
            </ButtonRow>
          </ResultCard>
        )}

        {phase === "done" && (
          <ResultCard
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultTitle>{t.doneTitle}</ResultTitle>
            <ResultMessage>{t.doneMessage}</ResultMessage>
            <ResultMessage style={{ fontWeight: 600 }}>
              {t.finalScore(elapsed)}
            </ResultMessage>

            {winScore > 0 && winScore >= personalBest && (
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

            <ButtonRow>
              <StartButton onClick={startGame}>{t.restart}</StartButton>
            </ButtonRow>
          </ResultCard>
        )}

        <BackLink to="/games">{t.back}</BackLink>
      </PageContainer>
    </>
  );
}
