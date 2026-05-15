// src/pages/SolSnap.jsx

import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { celebrate } from "../utils/celebrate.js";
import { markDailyDoneIfMatches } from "../utils/dailyChallenge.js";

const Title = styled.h1`
  font-size: 2rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #4a3f37;
  margin-bottom: 2rem;
`;

const StartButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #8b6b8e;
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 4px 10px rgba(26, 22, 20, 0.3);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

const BackLink = styled(Link)`
  display: block;
  margin-top: 1.5rem;
  color: #7a5a7c;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

const QuestionBox = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(26, 22, 20, 0.15);
  max-width: 600px;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const Timer = styled.p`
  font-size: 0.9rem;
  color: #d32f2f;
  margin-bottom: 0.8rem;
`;

const QuestionText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const AnswerButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const AnswerButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: #d4a5a5;
  color: white;
  border: none;
  border-radius: 2rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #f48fb1;
  }
`;

const Result = styled.p`
  font-weight: bold;
  font-size: 1rem;
  margin-top: 1rem;
  color: ${({ correct }) => (correct ? "#388e3c" : "#d32f2f")};
`;

const NextButton = styled(StartButton)`
  margin-top: 1rem;
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

export default function SolSnap() {
  const { language } = useLanguage();
  const [hasStarted, setHasStarted] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [epIndex, setEpIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [epScore, setEpScore] = useState(0);
  const [inSummary, setInSummary] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(10);
  const [feedback, setFeedback] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const countdown = useRef(null);

  // Leaderboard state — single board, level="default".
  const [topEntries, setTopEntries] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [submitName, setSubmitName] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [submittedRank, setSubmittedRank] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const t = {
    en: {
      pageTitle: "SolSnap – SolTheCat",
      title: "Sol’s Snap Game 📸",
      subtitle: "Ready to test your knowledge? Press Start to begin!",
      start: "Start Game",
      back: "← Back to games",
      timeLeft: (s) => `Time left: ${s}s`,
      correct: "Correct! 🎉",
      incorrect: "Wrong! ❌",
      restart: "Restarting the game…",
      summaryPerfectUnlock: (title) =>
        `🎉 You got 3/3 in ${title}! You unlocked the next episode!`,
      summaryPerfectLast: (title) =>
        `🎉 You got 3/3 in ${title}! Stay tuned for next episodes!`,
      summaryScore: (sc) => `You got ${sc}/3 correct.`,
      nextEp: "Next Episode",
      gameOver: (s, t) => `Game Over! You scored ${s} out of ${t}.`,
      yes: "Yes",
      no: "No",
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
      pageTitle: "SolSnap – SolTheCat",
      title: "Το Snap Παιχνίδι της Sol 📸",
      subtitle: "Έτοιμος να δοκιμάσεις τις γνώσεις σου; Πάτα Έναρξη!",
      start: "Έναρξη Παιχνιδιού",
      back: "← Επιστροφή στα παιχνίδια",
      timeLeft: (s) => `Χρόνος: ${s}δ.`,
      correct: "Σωστό! 🎉",
      incorrect: "Λάθος! ❌",
      restart: "Επανεκκίνηση παιχνιδιού…",
      summaryPerfectUnlock: (title) =>
        `🎉 3/3 στο ${title}! Ξεκλείδωσες το επόμενο επεισόδιο!`,
      summaryPerfectLast: (title) =>
        `🎉 3/3 στο ${title}! Μείνε συντονισμένος για τα επόμενα επεισόδια!`,
      summaryScore: (sc) => `Έκανες ${sc}/3 σωστές.`,
      nextEp: "Επόμενο Επεισόδιο",
      gameOver: (s, t) => `Τέλος παιχνιδιού! Σκορ: ${s} από ${t}`,
      yes: "Ναι",
      no: "Όχι",
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

  const resetGame = () => {
    setHasStarted(false);
    setEpisodes([]);
    setEpIndex(0);
    setQuestions([]);
    setQIndex(0);
    setScore(0);
    setEpScore(0);
    setInSummary(false);
    setShowResult(false);
  };

  // Fetch top 3 + load personal best on mount.
  useEffect(() => {
    setPersonalBest(parseInt(localStorage.getItem("solSnap_best") || "0", 10));
    fetch("/leaderboard?game=solsnap&level=default")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setTopEntries(data.entries || []))
      .catch(() => setTopEntries([]));
  }, []);

  // When the player completes the full run (showResult), update personal best.
  useEffect(() => {
    if (!showResult) return;
    const prevBest = parseInt(localStorage.getItem("solSnap_best") || "0", 10);
    if (score > prevBest) {
      localStorage.setItem("solSnap_best", String(score));
      setPersonalBest(score);
    }
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
    markDailyDoneIfMatches("solsnap", "default");
  }, [showResult, score]);

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
          game: "solsnap",
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

  const startGame = async () => {
    const res = await fetch(`${import.meta.env.BASE_URL}episodes.json`);
    const data = await res.json();
    const vis = data.filter(
      (ep) => ep.visible && Array.isArray(ep.snapQuestions)
    );
    setEpisodes(vis);
    if (vis.length) {
      const first3 = shuffle(vis[0].snapQuestions).slice(0, 3);
      setQuestions(first3);
      setHasStarted(true);
    }
  };

  useEffect(() => {
    if (!hasStarted || inSummary || feedback) return;
    setTimer(10);
    countdown.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(countdown.current);
          answer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(countdown.current);
  }, [hasStarted, qIndex, inSummary, feedback]);

  const answer = (ans) => {
    clearInterval(countdown.current);
    const correctAns = questions[qIndex].answer;
    const isCorrect = ans === correctAns;
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      setScore((s) => s + 1);
      setEpScore((s) => s + 1);
      setTimeout(() => {
        setFeedback(null);
        if (qIndex < 2) {
          setQIndex((i) => i + 1);
        } else {
          setInSummary(true);
          if (epScore + 1 === 3) celebrate();
        }
      }, 800);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setShowReset(true);
        setTimeout(() => {
          setShowReset(false);
          resetGame();
        }, 1200);
      }, 800);
    }
  };

  const nextEpisode = () => {
    const next = epIndex + 1;
    if (next < episodes.length) {
      const qs = shuffle(episodes[next].snapQuestions).slice(0, 3);
      setQuestions(qs);
      setEpIndex(next);
      setQIndex(0);
      setEpScore(0);
      setInSummary(false);
    } else {
      setShowResult(true);
    }
  };

  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <link rel="canonical" href="https://solthecat.com/games/solsnap" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {showReset && (
          <>
            <Title>{t.incorrect}</Title>
            <Subtitle>{t.restart}</Subtitle>
          </>
        )}

        {!hasStarted && !showReset && (
          <>
            <Title>{t.title}</Title>
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
            <BackLink to="/games">{t.back}</BackLink>
          </>
        )}

        {hasStarted && !inSummary && !showResult && !showReset && questions.length > 0 && (
          <QuestionBox>
            <Subtitle>
              {typeof episodes[epIndex].title === "object"
                ? episodes[epIndex].title[language]
                : episodes[epIndex].title}
            </Subtitle>
            <Timer>{t.timeLeft(timer)}</Timer>
            <QuestionText>{questions[qIndex].question[language]}</QuestionText>
            <AnswerButtons>
              <AnswerButton aria-label={t.yes} onClick={() => answer(true)}>✔️</AnswerButton>
              <AnswerButton aria-label={t.no} onClick={() => answer(false)}>❌</AnswerButton>
            </AnswerButtons>
            {feedback && <Result correct={feedback === "correct"}>{t[feedback]}</Result>}
          </QuestionBox>
        )}

        {inSummary && !showResult && !showReset && (
          <>
            <Title>{t.title}</Title>
            <Subtitle>
              {epScore === 3
                ? epIndex < episodes.length - 1
                  ? t.summaryPerfectUnlock(
                      typeof episodes[epIndex].title === "object"
                        ? episodes[epIndex].title[language]
                        : episodes[epIndex].title
                    )
                  : t.summaryPerfectLast(
                      typeof episodes[epIndex].title === "object"
                        ? episodes[epIndex].title[language]
                        : episodes[epIndex].title
                    )
                : t.summaryScore(epScore)}
            </Subtitle>

            {epIndex < episodes.length - 1 ? (
              <NextButton onClick={nextEpisode}>{t.nextEp}</NextButton>
            ) : (
              <BackLink to="/games">{t.back}</BackLink>
            )}
          </>
        )}

        {showResult && !showReset && (
          <>
            <Title>{t.title}</Title>
            <Subtitle>{t.gameOver(score, episodes.length * 3)}</Subtitle>

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

            <BackLink to="/games">{t.back}</BackLink>
          </>
        )}
      </PageContainer>
    </>
  );
}
