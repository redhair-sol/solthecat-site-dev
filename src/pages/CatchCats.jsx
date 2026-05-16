// src/pages/CatchCats.jsx
//
// "Catch the Cats" — falling-objects game. Cats drop from the top of the
// play area; player drags a basket left/right to catch them. Each missed
// cat costs a life. 30-second round, 3 difficulty levels.
//
// Performance notes:
// - Basket position is held in a ref + applied via direct DOM mutation, NOT
//   React state. setState on every pointermove (~60fps) was triggering full
//   re-renders that included every falling cat → noticeable lag on mobile.
// - Collision is decided by a setTimeout fired at 88% of the fall duration
//   (just before basket level). On hit the cat is removed from state →
//   AnimatePresence plays an exit (looks like it lands in the basket). On
//   miss the cat keeps animating down to 110% (off-screen) and we deduct a
//   life when it reaches 100%.
//
// Controls:
//   - Touch / pointer drag (mobile + desktop): move basket horizontally.
//   - Arrow Left/Right (desktop): step the basket.
//
// Zero new assets — uses cat emoji + a basket emoji.

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { celebrate } from "../utils/celebrate.js";
import { markDailyDoneIfMatches } from "../utils/dailyChallenge.js";

const ROUND_SECONDS = 30;
const BASKET_HALF_WIDTH_PCT = 11; // collision tolerance — slightly forgiving
const KEY_STEP_PCT = 6;
// Three collision check moments during the basket-overlap window.
// At fallSec * 0.80 the cat visually reaches the basket top; by 0.88 it
// is at the middle. Any hit in this window counts — gives the player a
// proper window to catch instead of one strict snapshot.
const HIT_CHECK_FRACTIONS = [0.80, 0.84, 0.88];

const CAT_EMOJIS = ["🐱", "🐈", "😺", "😸", "😻", "😼", "🙀"];
const CROWN_CHANCE = 0.1; // 10% bonus drops

// Per-level tuning. fallSec lower = harder. spawnMs lower = more cats.
const LEVELS = [
  { id: "easy",   lives: 5, fallSec: 4.0, spawnMs: 1400 },
  { id: "medium", lives: 4, fallSec: 3.0, spawnMs: 1000 },
  { id: "hard",   lives: 3, fallSec: 2.0, spawnMs: 700  },
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
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.8rem;
  font-family: 'Poppins', sans-serif;
  color: #1a1614;
  font-weight: 700;
`;

const HUDChip = styled.div`
  background: #ffffffcc;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(26, 22, 20, 0.15);
  font-size: 0.9rem;
`;

const PlayArea = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  /* dvh (dynamic viewport height) accounts for the mobile browser address
     bar showing/hiding. 50dvh leaves room above for Topbar + Title + HUD
     and below for the bottom tab bar without forcing the user to scroll. */
  height: 50dvh;
  max-height: 480px;
  min-height: 260px;
  margin: 0 auto 1rem;
  /* If a per-round episode image is set, layer a translucent pink overlay
     on top so falling cats stay readable; otherwise fall back to the
     plain pink gradient. */
  background-image: ${({ $bg }) =>
    $bg
      ? `linear-gradient(rgba(255, 243, 248, 0.55), rgba(252, 228, 236, 0.55)), url("${$bg}")`
      : `linear-gradient(to bottom, #f5efe4 0%, #ede4d3 100%)`};
  background-size: cover;
  background-position: center;
  border: 2px solid #8b6b8e;
  border-radius: 1rem;
  overflow: hidden;
  touch-action: none;
  cursor: ew-resize;
  user-select: none;
`;

const FallingCat = styled(motion.span)`
  position: absolute;
  font-size: 2.4rem;
  pointer-events: none;
  transform: translateX(-50%);
  filter: drop-shadow(0 2px 4px rgba(26, 22, 20, 0.25));
`;

const BasketWrap = styled.div`
  position: absolute;
  bottom: 0.5rem;
  font-size: 3rem;
  transform: translateX(-50%);
  pointer-events: none;
  filter: drop-shadow(0 -1px 3px rgba(0, 0, 0, 0.15));
  transform-origin: 50% 100%;
  /* No CSS transition on left — direct DOM updates from pointer events
     should be instant. Any easing here adds perceptible latency on touch. */

  &.bounce {
    animation: basket-bounce 0.32s ease-out;
  }

  @keyframes basket-bounce {
    0%   { transform: translateX(-50%) scale(1); }
    35%  { transform: translateX(-50%) scale(1.28); }
    70%  { transform: translateX(-50%) scale(0.94); }
    100% { transform: translateX(-50%) scale(1); }
  }
`;

const ScorePopup = styled(motion.div)`
  position: absolute;
  pointer-events: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  text-shadow: 0 1px 3px white, 0 0 8px white;
  transform: translateX(-50%);
`;

const SoundToggle = styled.button`
  background: #ffffffcc;
  border: 2px solid #8b6b8e;
  border-radius: 999px;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: transform 0.15s ease;
  flex-shrink: 0;
  line-height: 1;

  &:hover {
    transform: scale(1.1);
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

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
  margin: 0.4rem;

  &:hover {
    transform: scale(1.05);
  }
`;

const LevelGrid = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 1rem 0 0.5rem;
`;

const LevelButton = styled.button`
  padding: 0.7rem 1.3rem;
  background: ${({ $active }) => ($active ? "#8b6b8e" : "#ffffff")};
  color: ${({ $active }) => ($active ? "white" : "#1a1614")};
  border: 2px solid #8b6b8e;
  border-radius: 999px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    transform: scale(1.04);
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
  font-size: 1.5rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
`;

const ResultMessage = styled.p`
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

export default function CatchCats() {
  const { language } = useLanguage();
  const [phase, setPhase] = useState("intro"); // intro | playing | won | lost
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LEVELS[0].lives);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [cats, setCats] = useState([]);
  const [popups, setPopups] = useState([]); // floating "+N" effects
  const [episodes, setEpisodes] = useState([]); // for random bg image
  const [bgImage, setBgImage] = useState(null); // current round's bg
  const [soundOn, setSoundOn] = useState(() => {
    return localStorage.getItem("solCatchSound") !== "off";
  });

  // Leaderboard state
  const [topEntries, setTopEntries] = useState([]); // top 3 for current level
  const [personalBest, setPersonalBest] = useState(0); // localStorage best
  const [submitName, setSubmitName] = useState(""); // input value
  const [submitState, setSubmitState] = useState("idle"); // idle | submitting | submitted | skipped | error
  const [submittedRank, setSubmittedRank] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const playAreaRef = useRef(null);
  const basketRef = useRef(null);
  const basketXRef = useRef(50); // single source of truth for basket position
  const livesRef = useRef(0);
  const phaseRef = useRef("intro");
  const resultRef = useRef(null);
  const caughtIdsRef = useRef(new Set()); // dedupe across multiple hit checks
  const audioCtxRef = useRef(null); // lazy WebAudio context
  const soundOnRef = useRef(soundOn); // mirrored for fresh reads in async callbacks

  const t = {
    en: {
      pageTitle: "Catch the Cats – SolTheCat",
      title: "Catch the Cats 🧺",
      subtitle:
        "Drag the basket to catch falling cats. Crown cats are worth 5 points. Don't let them all slip!",
      pickLevel: "Pick a difficulty",
      easy: "🌸 Easy",
      medium: "⚡ Medium",
      hard: "🔥 Hard",
      start: "🐾 Start round",
      score: "Score",
      lives: "Lives",
      time: "Time",
      wonTitle: "🎒 Round survived!",
      wonMessage: (s) => `You caught ${s} points worth of cats.`,
      lostTitle: "🙀 Out of lives",
      lostMessage: (s) =>
        `Too many cats slipped past. Final score: ${s}. Try again!`,
      retry: "🔁 Play again",
      changeLevel: "Choose level",
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
      pageTitle: "Πιάσε τις Γάτες – SolTheCat",
      title: "Πιάσε τις Γάτες 🧺",
      subtitle:
        "Σύρε το καλάθι για να πιάσεις τις γάτες που πέφτουν. Οι γάτες με κορώνα μετρούν 5 πόντους. Μην τις αφήσεις να χαθούν!",
      pickLevel: "Διάλεξε δυσκολία",
      easy: "🌸 Εύκολο",
      medium: "⚡ Μέτριο",
      hard: "🔥 Δύσκολο",
      start: "🐾 Ξεκίνα γύρο",
      score: "Σκορ",
      lives: "Ζωές",
      time: "Χρόνος",
      wonTitle: "🎒 Επιβίωσες!",
      wonMessage: (s) => `Έπιασες γάτες αξίας ${s} πόντων.`,
      lostTitle: "🙀 Τέλος ζωών",
      lostMessage: (s) =>
        `Πολλές γάτες ξέφυγαν. Τελικό σκορ: ${s}. Ξαναπροσπάθησε!`,
      retry: "🔁 Παίξε ξανά",
      changeLevel: "Επιλογή επιπέδου",
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

  // Keep refs in sync with state so async timeouts read fresh values.
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  // Load episode list (used for picking a random bg image per round).
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}episodes.json`)
      .then((r) => r.json())
      .then((data) => {
        setEpisodes(data.filter((ep) => ep.visible));
      })
      .catch(() => {
        // Non-fatal — game still works, just falls back to gradient bg.
      });
  }, []);

  // Fetch top 3 + load personal best whenever the user picks a level.
  useEffect(() => {
    const levelId = LEVELS[levelIdx].id;
    setPersonalBest(
      parseInt(localStorage.getItem(`catchCats_best_${levelId}`) || "0", 10)
    );
    setTopEntries([]);
    fetch(`/leaderboard?game=catch-cats&level=${levelId}`)
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setTopEntries(data.entries || []))
      .catch(() => setTopEntries([])); // backend unavailable → silent fallback
  }, [levelIdx]);

  // After every "won" or "lost" phase, update personal best and decide
  // whether the user qualifies for the global leaderboard.
  useEffect(() => {
    if (phase !== "won" && phase !== "lost") return;
    const levelId = LEVELS[levelIdx].id;
    const prevBest = parseInt(
      localStorage.getItem(`catchCats_best_${levelId}`) || "0",
      10
    );
    if (score > prevBest) {
      localStorage.setItem(`catchCats_best_${levelId}`, String(score));
      setPersonalBest(score);
    }
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
    markDailyDoneIfMatches("catch-cats", levelId);
  }, [phase, levelIdx, score]);

  // True if the just-finished score qualifies for the visible top 3.
  // If the board has < 3 entries, any score > 0 qualifies. Otherwise score
  // must beat the current 3rd place.
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
          game: "catch-cats",
          level: LEVELS[levelIdx].id,
          score,
          name,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Surface the server's own error message when available so we can
        // diagnose KV binding / validation issues without dev tools.
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

  const toggleSound = () => {
    setSoundOn((s) => {
      const next = !s;
      localStorage.setItem("solCatchSound", next ? "on" : "off");
      return next;
    });
  };

  // Auto-scroll to result card on round end.
  useEffect(() => {
    if ((phase === "won" || phase === "lost") && resultRef.current) {
      requestAnimationFrame(() => {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [phase]);

  // Set basket position both in ref and on the DOM node directly.
  // Avoids a React re-render cycle on every pointer move.
  const setBasket = (xPct) => {
    const clamped = Math.max(
      BASKET_HALF_WIDTH_PCT,
      Math.min(100 - BASKET_HALF_WIDTH_PCT, xPct)
    );
    basketXRef.current = clamped;
    if (basketRef.current) {
      basketRef.current.style.left = `${clamped}%`;
    }
  };

  // Lightweight beep/boop SFX via Web Audio API. Created lazily on first
  // interaction (mobile browsers block AudioContext until a user gesture).
  // Zero asset cost — synthesised tones, no audio files.
  const getAudioCtx = () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  };
  const playTone = (freq, durationMs, type = "sine", volume = 0.15) => {
    if (!soundOnRef.current) return; // muted via toggle
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  };
  const sfxCatch = (isCrown) => {
    if (isCrown) {
      // Crown catch: rising arpeggio-ish double note
      playTone(660, 90, "triangle", 0.18);
      setTimeout(() => playTone(990, 140, "triangle", 0.18), 80);
    } else {
      playTone(720, 110, "sine", 0.14);
    }
  };
  const sfxMiss = () => playTone(200, 180, "sawtooth", 0.10);
  const sfxGameOver = () => {
    playTone(330, 180, "sine", 0.16);
    setTimeout(() => playTone(247, 240, "sine", 0.16), 160);
    setTimeout(() => playTone(196, 320, "sine", 0.16), 380);
  };

  const triggerBasketBounce = () => {
    if (!basketRef.current) return;
    basketRef.current.classList.remove("bounce");
    // Force reflow so the animation can be re-triggered on rapid catches.
    void basketRef.current.offsetWidth;
    basketRef.current.classList.add("bounce");
  };

  const pushPopup = (x, points, isCrown) => {
    const id = `popup-${Date.now()}-${Math.random()}`;
    setPopups((prev) => [...prev, { id, x, points, isCrown }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 700);
  };

  const startGame = (idx = levelIdx) => {
    setLevelIdx(idx);
    setScore(0);
    setLives(LEVELS[idx].lives);
    livesRef.current = LEVELS[idx].lives;
    setTimeLeft(ROUND_SECONDS);
    setCats([]);
    setPopups([]);
    caughtIdsRef.current = new Set();
    setBasket(50);
    // Pick a random episode photo for this round's background. Falls back
    // to the gradient if episodes haven't loaded yet (shouldn't happen on
    // a normal connection but safer).
    if (episodes.length > 0) {
      const random = episodes[Math.floor(Math.random() * episodes.length)];
      setBgImage(`${import.meta.env.BASE_URL}${random.image}`);
    } else {
      setBgImage(null);
    }
    setPhase("playing");
  };

  // Round timer.
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) {
          clearInterval(id);
          setPhase("won");
          return 0;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Cat spawner. Each spawn schedules its own collision + miss timeouts.
  useEffect(() => {
    if (phase !== "playing") return;
    const cfg = LEVELS[levelIdx];
    const fallMs = cfg.fallSec * 1000;

    const spawn = () => {
      if (phaseRef.current !== "playing") return;
      const isCrown = Math.random() < CROWN_CHANCE;
      const emoji = isCrown
        ? "👑"
        : CAT_EMOJIS[Math.floor(Math.random() * CAT_EMOJIS.length)];
      const cat = {
        id: `${Date.now()}-${Math.random()}`,
        emoji,
        // Spawn x clamped to [10, 90] so cats land where the basket can reach.
        x: 10 + Math.random() * 80,
        isCrown,
        points: isCrown ? 5 : 1,
      };
      setCats((prev) => [...prev, cat]);

      // Three collision checks during the basket-overlap window. Any hit
      // counts and dedupes via caughtIdsRef so the cat only scores once.
      HIT_CHECK_FRACTIONS.forEach((frac) => {
        setTimeout(() => {
          if (phaseRef.current !== "playing") return;
          if (caughtIdsRef.current.has(cat.id)) return; // already caught
          const dist = Math.abs(cat.x - basketXRef.current);
          if (dist <= BASKET_HALF_WIDTH_PCT) {
            caughtIdsRef.current.add(cat.id);
            setScore((s) => s + cat.points);
            pushPopup(cat.x, cat.points, cat.isCrown);
            triggerBasketBounce();
            sfxCatch(cat.isCrown);
            // Mark the cat as caught instead of removing it. The render
            // switches its animate target (snap to basket level, scale
            // down, fade) with a fast transition — prevents the cat from
            // continuing the long fall animation during AnimatePresence
            // exit (which had inherited the multi-second fall transition).
            setCats((prev) =>
              prev.map((c) => (c.id === cat.id ? { ...c, caught: true } : c))
            );
            // Remove after the catch animation finishes.
            setTimeout(() => {
              setCats((prev) => prev.filter((c) => c.id !== cat.id));
            }, 240);
          }
        }, fallMs * frac);
      });

      // Miss check: fires when the cat would have reached the bottom.
      // Skip if already caught.
      setTimeout(() => {
        if (phaseRef.current !== "playing") return;
        if (caughtIdsRef.current.has(cat.id)) return;
        setCats((prev) => {
          const stillThere = prev.find((c) => c.id === cat.id);
          if (!stillThere) return prev; // already caught and removed
          const newLives = livesRef.current - 1;
          livesRef.current = newLives;
          setLives(newLives);
          if (newLives <= 0) {
            sfxGameOver();
            setPhase("lost");
            return [];
          }
          sfxMiss();
          return prev.filter((c) => c.id !== cat.id);
        });
      }, fallMs);
    };

    const spawnInterval = setInterval(spawn, cfg.spawnMs);
    return () => {
      clearInterval(spawnInterval);
      // Best-effort: pending hit/miss timers will no-op via phase guard.
    };
  }, [phase, levelIdx]);

  // Pointer / touch tracking on the play area.
  const handlePointerMove = (e) => {
    if (phaseRef.current !== "playing") return;
    const rect = playAreaRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    setBasket(xPct);
  };

  // Keyboard arrow steps for desktop accessibility.
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") {
        setBasket(basketXRef.current - KEY_STEP_PCT);
      } else if (e.key === "ArrowRight") {
        setBasket(basketXRef.current + KEY_STEP_PCT);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // Confetti on a respectable survive score.
  useEffect(() => {
    if (phase === "won" && score >= 15) celebrate();
  }, [phase, score]);

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <link rel="canonical" href="https://solthecat.com/games/catch-cats" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <TitleRow>
          <Title style={{ marginBottom: 0 }}>{t.title}</Title>
          <SoundToggle
            onClick={toggleSound}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            title={soundOn ? "Mute sound" : "Unmute sound"}
          >
            {soundOn ? "🔊" : "🔇"}
          </SoundToggle>
        </TitleRow>

        {phase === "intro" && (
          <>
            <Subtitle>{t.subtitle}</Subtitle>
            <Subtitle style={{ fontSize: "0.85rem", marginBottom: "0.2rem" }}>
              {t.pickLevel}:
            </Subtitle>
            <LevelGrid>
              {LEVELS.map((lvl, idx) => (
                <LevelButton
                  key={lvl.id}
                  $active={levelIdx === idx}
                  onClick={() => setLevelIdx(idx)}
                >
                  {idx === 0 ? t.easy : idx === 1 ? t.medium : t.hard}
                </LevelButton>
              ))}
            </LevelGrid>

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

            <StartButton onClick={() => startGame(levelIdx)}>{t.start}</StartButton>
          </>
        )}

        {phase === "playing" && (
          <>
            <HUDRow>
              <HUDChip>{t.score}: {score}</HUDChip>
              <HUDChip>{t.lives}: {"❤️".repeat(lives)}</HUDChip>
              <HUDChip>{t.time}: {timeLeft}s</HUDChip>
            </HUDRow>
            <PlayArea
              ref={playAreaRef}
              $bg={bgImage}
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerMove}
            >
              {cats.map((cat) => (
                <FallingCat
                  key={cat.id}
                  style={{ left: `${cat.x}%` }}
                  initial={{ top: "-12%" }}
                  animate={
                    cat.caught
                      ? { top: "84%", scale: 0.15, opacity: 0 }
                      : { top: "110%" }
                  }
                  transition={
                    cat.caught
                      ? { duration: 0.24, ease: "easeOut" }
                      : { duration: LEVELS[levelIdx].fallSec, ease: "linear" }
                  }
                >
                  {cat.emoji}
                </FallingCat>
              ))}
              <BasketWrap ref={basketRef} style={{ left: "50%" }}>🧺</BasketWrap>
              <AnimatePresence>
                {popups.map((p) => (
                  <ScorePopup
                    key={p.id}
                    style={{
                      left: `${p.x}%`,
                      color: p.isCrown ? "#ff9800" : "#1a1614",
                    }}
                    initial={{ opacity: 1, top: "78%", scale: 0.7 }}
                    animate={{ opacity: 0, top: "55%", scale: 1.2 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    +{p.points}
                  </ScorePopup>
                ))}
              </AnimatePresence>
            </PlayArea>
          </>
        )}

        {(phase === "won" || phase === "lost") && (
          <ResultCard
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultTitle>
              {phase === "won" ? t.wonTitle : t.lostTitle}
            </ResultTitle>
            <ResultMessage>
              {phase === "won" ? t.wonMessage(score) : t.lostMessage(score)}
            </ResultMessage>

            {/* New record banner if personal best was just beaten. */}
            {score > 0 && score >= personalBest && (
              <PersonalBestText style={{ fontSize: "1rem" }}>
                {t.newRecord}
              </PersonalBestText>
            )}

            {/* Leaderboard submission UI — only if score qualifies and user
                hasn't already submitted/skipped. */}
            {qualifiesForLeaderboard() && submitState === "idle" && (
              <>
                <PersonalBestText>{t.qualifies}</PersonalBestText>
                <p
                  style={{
                    color: "#4a3f37",
                    fontSize: "0.85rem",
                    margin: "0.3rem 0",
                  }}
                >
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
                <PersonalBestText
                  style={{ color: "#c62828", fontSize: "0.9rem" }}
                >
                  ⚠️ {submitError || "Submit failed"}
                </PersonalBestText>
                <SmallButton onClick={() => setSubmitState("idle")}>
                  Try again
                </SmallButton>
              </>
            )}

            <StartButton onClick={() => startGame(levelIdx)}>{t.retry}</StartButton>
            <StartButton onClick={() => setPhase("intro")}>
              {t.changeLevel}
            </StartButton>
          </ResultCard>
        )}

        <BackLink to="/games">{t.back}</BackLink>
      </PageContainer>
    </>
  );
}
