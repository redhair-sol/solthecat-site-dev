// src/pages/SpotTheCity.jsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { celebrate } from "../utils/celebrate.js";
import { markDailyDoneIfMatches, formatScore } from "../utils/dailyChallenge.js";

const ROUNDS = 5;

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

const CropFrame = styled.div`
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
  background-image: url(${(props) => props.$src});
  background-size: 250%;
  background-position: ${(props) => props.$x}% ${(props) => props.$y}%;
  border-radius: 1rem;
  border: 2px solid #8b6b8e;
  margin: 0.5rem auto 1rem;
  box-shadow: 0 6px 18px rgba(26, 22, 20, 0.18);
`;

const RevealImage = styled(motion.img)`
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 1rem;
  border: 2px solid #8b6b8e;
  margin: 0.5rem auto 1rem;
  box-shadow: 0 6px 18px rgba(26, 22, 20, 0.18);
  display: block;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  width: 100%;
  max-width: 500px;
  margin: 0.5rem auto 0;
`;

const OptionButton = styled.button`
  padding: 0.8rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  background: ${({ $state }) =>
    $state === "correct"
      ? "#a5d6a7"
      : $state === "wrong"
      ? "#ef9a9a"
      : $state === "missed"
      ? "#a5d6a7"
      : "#ffffff"};
  color: ${({ $state }) =>
    $state === "correct" || $state === "missed"
      ? "#1b5e20"
      : $state === "wrong"
      ? "#b71c1c"
      : "#4a3f37"};
  border: 2px solid
    ${({ $state }) =>
      $state === "correct" || $state === "missed"
        ? "#388e3c"
        : $state === "wrong"
        ? "#c62828"
        : "#8b6b8e"};
  border-radius: 12px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  transition: transform 0.15s ease, background 0.2s ease;

  &:hover {
    transform: ${({ disabled }) => (disabled ? "none" : "scale(1.03)")};
  }
`;

const FeedbackText = styled.p`
  font-size: 1rem;
  color: ${({ $correct }) => ($correct ? "#388e3c" : "#c62828")};
  font-weight: 700;
  margin: 1rem 0 0;
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

// Same helper as SolPicks — extract city name from localized title.
function cityFromTitle(title) {
  if (!title) return "";
  const m = title.match(/[–—-]\s+([^,–—\n]+?)(?:[,–—]|\s+\p{Extended_Pictographic}|$)/u);
  return m ? m[1].trim() : title;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRound(allEpisodes, exclude = []) {
  const pool = allEpisodes.filter((ep) => !exclude.includes(ep.id));
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffle(
    allEpisodes.filter((ep) => ep.id !== correct.id)
  ).slice(0, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    correct,
    options,
    cropX: 20 + Math.random() * 60,
    cropY: 20 + Math.random() * 60,
  };
}

export default function SpotTheCity() {
  const { language } = useLanguage();
  const [episodes, setEpisodes] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [phase, setPhase] = useState("intro"); // "intro" | "playing" | "final"
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [usedIds, setUsedIds] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [selected, setSelected] = useState(null);

  // Timer + composite score. Max-correct (5/5) is achievable enough that ties
  // dominate without a tiebreaker — so the leaderboard score is encoded as
  // `correct * 10000 - totalSeconds`, decoded for display by formatScore().
  const [startTime, setStartTime] = useState(null);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [winScore, setWinScore] = useState(0);

  // Leaderboard state — single board, level="default".
  const [topEntries, setTopEntries] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [submitName, setSubmitName] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [submittedRank, setSubmittedRank] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Refs for auto-scrolling so mobile users always see the relevant section.
  const gameTopRef = useRef(null);  // top of round area (after Next round)
  const feedbackRef = useRef(null); // feedback + Next button (after answer)
  const finalRef = useRef(null);    // final score card

  const t = {
    en: {
      pageTitle: "Spot the City – SolTheCat",
      title: "Spot the City 🔍",
      subtitle: `Sol zoomed in on a corner of one of her ${ROUNDS}-round adventures. Can you tell where she is?`,
      start: "🐾 Start guessing",
      progress: (r) => `Round ${r} / ${ROUNDS}`,
      scoreLine: (s) => `Score: ${s} / ${ROUNDS}`,
      correct: "🎉 Spot on!",
      wrong: (city) => `❌ It was ${city}.`,
      next: "Next round →",
      finishedTitle: "🎒 Adventure complete!",
      finishedScore: (s) => `You got ${s} out of ${ROUNDS} right.`,
      finishedTime: (s) => `⏱️ Total time: ${s}s`,
      finishedPerfect: "Pawfect score! 🏆",
      finishedGood: "Sol's proud of you. 🐾",
      finishedSoso: "Keep exploring with Sol!",
      playAgain: "🔁 Play again",
      back: "← Back to games",
      loadFail: "Couldn't load episodes. Please try refreshing the page.",
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
      pageTitle: "Βρες την Πόλη – SolTheCat",
      title: "Βρες την Πόλη 🔍",
      subtitle: `Η Sol εστίασε σε μια γωνιά από ${ROUNDS} περιπέτειες. Μπορείς να μαντέψεις πού βρίσκεται;`,
      start: "🐾 Ξεκίνα να μαντεύεις",
      progress: (r) => `Γύρος ${r} / ${ROUNDS}`,
      scoreLine: (s) => `Σκορ: ${s} / ${ROUNDS}`,
      correct: "🎉 Σωστά!",
      wrong: (city) => `❌ Ήταν ${city}.`,
      next: "Επόμενος γύρος →",
      finishedTitle: "🎒 Τέλος περιπέτειας!",
      finishedScore: (s) => `Έκανες ${s} σωστές στις ${ROUNDS}.`,
      finishedTime: (s) => `⏱️ Συνολικός χρόνος: ${s}δ.`,
      finishedPerfect: "Τέλειο σκορ! 🏆",
      finishedGood: "Η Sol είναι περήφανη! 🐾",
      finishedSoso: "Συνέχισε να εξερευνείς με τη Sol!",
      playAgain: "🔁 Παίξε ξανά",
      back: "← Επιστροφή στα παιχνίδια",
      loadFail: "Δεν φόρτωσαν τα επεισόδια. Παρακαλώ δοκίμασε refresh.",
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

  // Auto-scroll on phase / round / answer change so the relevant section
  // (feedback, new round image, or final card) is always in view on mobile.
  useEffect(() => {
    let target = null;
    let block = "center";
    if (phase === "final") {
      target = finalRef.current;
    } else if (phase === "playing") {
      if (selected !== null) target = feedbackRef.current;
      else if (round > 0) {
        target = gameTopRef.current;
        block = "start";
      }
    }
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block });
      });
    }
  }, [phase, round, selected]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}episodes.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const visible = data.filter((ep) => ep.visible);
        setEpisodes(visible);
        setLoadError(false);
      })
      .catch((err) => {
        console.error("Failed to load episodes:", err);
        setLoadError(true);
      });
  }, []);

  // Fetch top 3 + load personal best on mount.
  useEffect(() => {
    setPersonalBest(parseInt(localStorage.getItem("spotCity_best") || "0", 10));
    fetch("/leaderboard?game=spotcity&level=default")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setTopEntries(data.entries || []))
      .catch(() => setTopEntries([]));
  }, []);

  // Update personal best whenever the final phase begins. Personal best is
  // stored as the composite score so it sorts/compares with leaderboard data.
  useEffect(() => {
    if (phase !== "final" || !startTime) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    setTotalSeconds(elapsed);
    const composite = Math.max(0, score * 10000 - elapsed);
    setWinScore(composite);
    const prevBest = parseInt(localStorage.getItem("spotCity_best") || "0", 10);
    if (composite > prevBest) {
      localStorage.setItem("spotCity_best", String(composite));
      setPersonalBest(composite);
    }
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
    markDailyDoneIfMatches("spotcity", "default");
  }, [phase, score, startTime]);

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
          game: "spotcity",
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

  const startGame = () => {
    if (episodes.length < 4) return;
    const first = buildRound(episodes);
    setUsedIds([first.correct.id]);
    setCurrentRound(first);
    setRound(1);
    setScore(0);
    setSelected(null);
    setStartTime(Date.now());
    setTotalSeconds(0);
    setWinScore(0);
    setPhase("playing");
  };

  const handleSelect = (epId) => {
    if (selected !== null) return;
    setSelected(epId);
    if (epId === currentRound.correct.id) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (round >= ROUNDS) {
      setPhase("final");
      if (score === ROUNDS) celebrate();
      return;
    }
    const next = buildRound(episodes, usedIds);
    setUsedIds((prev) => [...prev, next.correct.id]);
    setCurrentRound(next);
    setRound((r) => r + 1);
    setSelected(null);
  };

  const getCityLabel = (ep) => {
    const title =
      typeof ep.title === "object" ? ep.title[language] : ep.title;
    return cityFromTitle(title);
  };

  const isAnswered = selected !== null;
  const isCorrect = isAnswered && selected === currentRound?.correct.id;

  const finalMessage =
    score === ROUNDS
      ? t.finishedPerfect
      : score >= 3
      ? t.finishedGood
      : t.finishedSoso;

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <link rel="canonical" href="https://solthecat.com/games/spotcity" />
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
                    <span><strong>{formatScore("spotcity", e.score)}</strong></span>
                  </Top3Row>
                ))
              )}
              <PersonalBestText>
                {personalBest > 0
                  ? t.personalBest(formatScore("spotcity", personalBest))
                  : t.noBest}
              </PersonalBestText>
            </Top3Box>

            <BigButton onClick={startGame} disabled={episodes.length < 4}>
              {t.start}
            </BigButton>
          </>
        )}

        {phase === "playing" && currentRound && (
          <>
            <Subtitle ref={gameTopRef}>{t.progress(round)}</Subtitle>
            <ScoreLine>{t.scoreLine(score)}</ScoreLine>

            {!isAnswered ? (
              <CropFrame
                key={`crop-${currentRound.correct.id}`}
                $src={`${import.meta.env.BASE_URL}${currentRound.correct.image}`}
                $x={currentRound.cropX}
                $y={currentRound.cropY}
                role="img"
                aria-label="Zoomed-in detail of an episode photo"
              />
            ) : (
              <RevealImage
                key={`reveal-${currentRound.correct.id}`}
                src={`${import.meta.env.BASE_URL}${currentRound.correct.image}`}
                alt={getCityLabel(currentRound.correct)}
                width="800"
                height="800"
                loading="eager"
                decoding="async"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              />
            )}

            <OptionGrid>
              {currentRound.options.map((ep) => {
                const isCorrectOpt = ep.id === currentRound.correct.id;
                const isSelectedOpt = selected === ep.id;
                let state = null;
                if (isAnswered) {
                  if (isSelectedOpt && isCorrectOpt) state = "correct";
                  else if (isSelectedOpt && !isCorrectOpt) state = "wrong";
                  else if (!isSelectedOpt && isCorrectOpt) state = "missed";
                }
                return (
                  <OptionButton
                    key={ep.id}
                    $state={state}
                    disabled={isAnswered}
                    onClick={() => handleSelect(ep.id)}
                  >
                    {getCityLabel(ep)}
                  </OptionButton>
                );
              })}
            </OptionGrid>

            {isAnswered && (
              <div ref={feedbackRef}>
                <FeedbackText $correct={isCorrect}>
                  {isCorrect ? t.correct : t.wrong(getCityLabel(currentRound.correct))}
                </FeedbackText>
                <BigButton onClick={handleNext}>{t.next}</BigButton>
              </div>
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
            <FinalMessage>{t.finishedTime(totalSeconds)}</FinalMessage>
            <FinalMessage>{finalMessage}</FinalMessage>

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

            <BigButton onClick={startGame}>{t.playAgain}</BigButton>
          </FinalCard>
        )}

        <BackLink to="/games">{t.back}</BackLink>
      </PageContainer>
    </>
  );
}
