// src/pages/QuizPlayer.jsx

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import TitleEm from "../components/TitleEm.jsx";
import { celebrate } from "../utils/celebrate.js";
import { formatScore } from "../utils/dailyChallenge.js";

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
  margin-bottom: 2rem;
`;

const DropdownWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 1rem;
`;

const Dropdown = styled.select`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 2px solid #8b6b8e;
  border-radius: 8px;
  background: #fff;
  color: #1a1614;
  cursor: pointer;
  max-width: 90vw;
`;

const StyledButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #8b6b8e;
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 4px 10px rgba(26, 22, 20, 0.3);
  transition: transform 0.2s ease-in-out;
  margin-top: 1.5rem;

  &:hover {
    transform: scale(1.05);
  }
`;

const QuestionCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(26, 22, 20, 0.2);
  margin-top: 2rem;
  text-align: center;
`;

const QuestionText = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const AnswerButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.6rem;
  margin: 0.4rem 0;
  border: 1px solid #7a5a7c;
  border-radius: 8px;
  background: ${({ selected, correct }) =>
    selected ? (correct ? "#a5d6a7" : "#ef9a9a") : "#ede4d3"};
  cursor: ${({ selectedAnswer }) => (selectedAnswer ? "default" : "pointer")};
  font-weight: 500;

  &:hover {
    background: ${({ selected }) => (selected ? undefined : "#d4a5a5")};
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const ScoreText = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 2rem;
  color: #1a1614;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const Message = styled.div`
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: red;

  @media (max-width: 480px) {
    font-size: 1rem;
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

export default function QuizPlayer() {
  // When an Adventures card links here with ?city=athens we pre-select that
  // episode's quiz instead of defaulting to the first visible one. The URL
  // is the source of truth: if it carries a city slug and we have the
  // matching episode loaded, the dropdown jumps to it on mount.
  const [searchParams] = useSearchParams();
  const cityFromUrl = searchParams.get("city");

  const [episodes, setEpisodes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const { language } = useLanguage();

  // Leaderboard state, per-episode board, level = city slug.
  const [topEntries, setTopEntries] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [submitName, setSubmitName] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [submittedRank, setSubmittedRank] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Timer + composite score. 8/8 is reachable enough that ties dominate
  // without a tiebreaker, score = correct * 10000 - totalSeconds, decoded
  // for display by formatScore("quiz", ...).
  const [startTime, setStartTime] = useState(null);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [winScore, setWinScore] = useState(0);

  const content = {
    en: {
      title: <>Sol's <TitleEm>Quiz</TitleEm> 🧠</>,
      subtitle: selectedId ? `Quiz: SOLadventure #${selectedId}` : "",
      loading: "Loading...",
      start: "Start Quiz",
      quizUrl: "https://solthecat.com/games/cityquiz",
      back: "← Back to games",
      scoreText: (s, total) => `🎉 You got ${s} out of ${total} correct!`,
      timeText: (s) => `⏱️ Time: ${s}s`,
      playAgain: "🔁 Play Again",
      errLoadEpisodes: "Failed to load episodes.",
      errLoadQuiz: "Quiz file not found or invalid.",
      dropdownLabel: (title) => title,
      personalBest: (s) => `🏆 Your best: ${s}`,
      noBest: "🏆 No personal record yet",
      top3Title: "🏆 Top 5 (this quiz)",
      top3Empty: "No scores yet, be the first!",
      newRecord: "🎉 NEW PERSONAL BEST!",
      qualifies: "🌟 You made the leaderboard!",
      enterName: "Enter your name:",
      submit: "Submit",
      skip: "Skip",
      submittedRank: (r) => `You're #${r} on the board!`,
    },
    el: {
      title: <><TitleEm>Quiz</TitleEm> της Sol 🧠</>,
      subtitle: selectedId ? `Quiz: SOLadventure #${selectedId}` : "",
      loading: "Φόρτωση...",
      start: "Εκκίνηση Quiz",
      quizUrl: "https://solthecat.com/games/cityquiz",
      back: "← Επιστροφή στα παιχνίδια",
      scoreText: (s, total) => `🎉 Είχες ${s} σωστές από ${total}!`,
      timeText: (s) => `⏱️ Χρόνος: ${s}δ.`,
      playAgain: "🔁 Παίξε Ξανά",
      errLoadEpisodes: "Αποτυχία φόρτωσης επεισοδίων.",
      errLoadQuiz: "Το αρχείο quiz δεν βρέθηκε ή δεν είναι έγκυρο.",
      dropdownLabel: (title) => title,
      personalBest: (s) => `🏆 Καλύτερο σου: ${s}`,
      noBest: "🏆 Κανένα ρεκόρ ακόμη",
      top3Title: "🏆 Top 5 (αυτό το quiz)",
      top3Empty: "Κανένα σκορ ακόμη, γίνε ο πρώτος!",
      newRecord: "🎉 ΝΕΟ ΠΡΟΣΩΠΙΚΟ ΡΕΚΟΡ!",
      qualifies: "🌟 Μπήκες στη βαθμολογία!",
      enterName: "Όνομα:",
      submit: "Καταχώρηση",
      skip: "Παράλειψη",
      submittedRank: (r) => `Είσαι #${r} στη βαθμολογία!`,
    },
  };
  const t = content[language];

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}episodes.json`)
      .then((res) => res.json())
      .then((data) => {
        const visible = data.filter((ep) => ep.visible);
        setEpisodes(visible);
      })
      .catch(() => setError(t.errLoadEpisodes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-select an episode once we have the list. Priority: ?city=... param
  // (Adventures-card deep link), otherwise the first visible episode. If
  // the user later changes language and the URL still has a city, we keep
  // honoring it so the selection survives the re-mount.
  useEffect(() => {
    if (episodes.length === 0) return;
    if (cityFromUrl) {
      const target = episodes.find(
        (ep) => (ep.city || "").toLowerCase() === cityFromUrl.toLowerCase()
      );
      if (target) {
        setSelectedId(target.id.toString());
        return;
      }
    }
    if (!selectedId) setSelectedId(episodes[0].id.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodes, cityFromUrl]);

  const selectedEpisode = episodes.find((ep) => ep.id.toString() === selectedId);
  const city = selectedEpisode?.city;

  // Refresh leaderboard + personal best when the user selects a different city.
  useEffect(() => {
    if (!city) return;
    const lvl = String(city).toLowerCase();
    setPersonalBest(parseInt(localStorage.getItem(`quiz_best_${lvl}`) || "0", 10));
    setTopEntries([]);
    fetch(`/leaderboard?game=quiz&level=${encodeURIComponent(lvl)}`)
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setTopEntries(data.entries || []))
      .catch(() => setTopEntries([]));
  }, [city]);

  // After every result reveal, freeze the timer, compute the composite
  // score, and update personal best.
  useEffect(() => {
    if (!showResults || !city || !startTime) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    setTotalSeconds(elapsed);
    const composite = Math.max(0, score * 10000 - elapsed);
    setWinScore(composite);

    const lvl = String(city).toLowerCase();
    const prevBest = parseInt(localStorage.getItem(`quiz_best_${lvl}`) || "0", 10);
    if (composite > prevBest) {
      localStorage.setItem(`quiz_best_${lvl}`, String(composite));
      setPersonalBest(composite);
    }
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
  }, [showResults, city, score, startTime]);

  const qualifiesForLeaderboard = () => {
    if (winScore <= 0) return false;
    if (topEntries.length < 3) return true;
    return winScore > topEntries[2].score;
  };

  const submitToLeaderboard = async () => {
    const name = submitName.trim();
    if (!name || !city) return;
    setSubmitState("submitting");
    try {
      const res = await fetch("/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: "quiz",
          level: String(city).toLowerCase(),
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

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const loadQuiz = () => {
    if (!city) return;
    fetch(`${import.meta.env.BASE_URL}data/quiz/${city}.json`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        // Anti-repeat: keep the IDs of the last 2 rounds (16 questions) so
        // the next round draws from the remaining pool first. Falls back to
        // the full pool when too few unseen questions remain (e.g., a file
        // with fewer than 24 questions on its second consecutive replay).
        // Identifier prefers q.id; falls back to file index for quizzes
        // that don't carry ids (e.g. tallinn.json).
        const withIds = data.map((q, idx) => ({
          ...q,
          _qid: q.id != null ? `id-${q.id}` : `idx-${idx}`,
        }));

        const recentKey = `quizRecent_${city}`;
        let recent = [];
        try {
          recent = JSON.parse(localStorage.getItem(recentKey) || "[]");
        } catch { /* corrupt, ignore */ }

        let pool = withIds.filter((q) => !recent.includes(q._qid));
        if (pool.length < 8) pool = withIds; // not enough fresh, reset

        const shuffled = shuffleArray(pool);
        // Also shuffle the answer order inside each question so a repeated
        // question doesn't have "the correct answer is always the 3rd one".
        // The `correct: true` flag stays attached to its answer object, so
        // handleAnswer() keeps working unchanged.
        const eightQuestions = shuffled.slice(0, 8).map((q) => ({
          ...q,
          answers: shuffleArray(q.answers),
        }));

        const newRecent = [
          ...eightQuestions.map((q) => q._qid),
          ...recent,
        ].slice(0, 16);
        try {
          localStorage.setItem(recentKey, JSON.stringify(newRecent));
        } catch { /* quota / private-mode, non-fatal */ }

        setQuestions(eightQuestions);
        setCurrent(0);
        setScore(0);
        setShowResults(false);
        setError("");
        setSelectedAnswer(null);
        setStartTime(Date.now());
        setTotalSeconds(0);
        setWinScore(0);
      })
      .catch(() => {
        setQuestions([]);
        setError(t.errLoadQuiz);
      });
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    const correct = questions[current].answers[index].correct;
    setSelectedAnswer(index);
    if (correct) setScore((prev) => prev + 1);

    setTimeout(() => {
      const nextIndex = current + 1;
      if (nextIndex < questions.length) {
        setCurrent(nextIndex);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
        celebrate();
      }
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>{t.title} – SolTheCat</title>
        <link rel="canonical" href={t.quizUrl} />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title>{t.title}</Title>
        <Subtitle>{t.subtitle}</Subtitle>

        <DropdownWrapper>
          <Dropdown
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setQuestions([]);
              setShowResults(false);
              setError("");
              setSelectedAnswer(null);
            }}
          >
            {episodes.map((ep) => {
              const epTitle =
                typeof ep.title === "object"
                  ? ep.title[language]
                  : ep.title;
              return (
                <option key={ep.id} value={ep.id}>
                  {t.dropdownLabel(epTitle)}
                </option>
              );
            })}
          </Dropdown>
        </DropdownWrapper>

        {city && questions.length === 0 && !showResults && (
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
                  <span><strong>{formatScore("quiz", e.score)}</strong></span>
                </Top3Row>
              ))
            )}
            <PersonalBestText>
              {personalBest > 0
                ? t.personalBest(formatScore("quiz", personalBest))
                : t.noBest}
            </PersonalBestText>
          </Top3Box>
        )}

        <StyledButton onClick={loadQuiz}>{t.start}</StyledButton>

        {error && <Message>{error}</Message>}

        {questions.length > 0 && !showResults && (
          <QuestionCard>
            <QuestionText>{questions[current].question[language]}</QuestionText>
            {questions[current].answers.map((ansObj, i) => (
              // key includes `current` so React unmounts old buttons and
              // mounts fresh ones at each question change. Prevents the
              // "previously correct answer stays green on the next question"
              // visual bug where the same DOM node hung onto its styled-
              // components state across questions.
              <AnswerButton
                key={`${current}-${i}`}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                selected={selectedAnswer === i}
                correct={ansObj.correct}
                selectedAnswer={selectedAnswer}
              >
                {ansObj.text[language]}
              </AnswerButton>
            ))}
          </QuestionCard>
        )}

        {showResults && (
          <>
            <ScoreText>{t.scoreText(score, questions.length)}</ScoreText>
            <ScoreText style={{ fontSize: "1rem", marginTop: "0.4rem" }}>
              {t.timeText(totalSeconds)}
            </ScoreText>

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

            <StyledButton onClick={loadQuiz}>{t.playAgain}</StyledButton>
          </>
        )}

        <BackLink to="/games">{t.back}</BackLink>
      </PageContainer>
    </>
  );
}
