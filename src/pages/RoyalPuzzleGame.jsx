import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import TitleEm from "../components/TitleEm.jsx";
import SolButton from "../components/SolButton.jsx";
import { celebrate } from "../utils/celebrate.js";
import { markDailyDoneIfMatches } from "../utils/dailyChallenge.js";

// ✅ Styled Components
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
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 2rem;
  max-width: 500px;
  text-align: center;
`;

const Dropdown = styled.select`
  padding: 0.5rem 1rem;
  border: 2px solid #8b6b8e;
  border-radius: 8px;
  color: #1a1614;
  margin-bottom: 1rem;
  max-width: 90vw;
`;

const LevelButton = styled(SolButton).attrs({ as: "button" })`
  margin: 0.5rem;
`;

const PuzzleArea = styled.div`
  position: relative;
  width: 100%;
  max-width: 90vw;
  max-width: 600px;
  aspect-ratio: 1 / 1;
  background: #ede4d3;
  border-radius: 12px;
  overflow: hidden;
  margin: 2rem auto;
  box-sizing: border-box;
`;

const Piece = styled.img`
  position: absolute;
  user-select: none;
  touch-action: none;
`;

const Info = styled.p`
  text-align: center;
  font-weight: bold;
  color: #1a1614;
  margin-top: 1rem;
`;

const BackLink = styled(Link)`
  display: block;
  margin-top: 2rem;
  text-align: center;
  color: #7a5a7c;
  text-decoration: none;
  font-weight: bold;
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

const PUZZLE_SCORE_CAP = 9999;

export default function RoyalPuzzleGame() {
  const { language } = useLanguage();
  const [episodes, setEpisodes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [level, setLevel] = useState("");
  const [pieces, setPieces] = useState([]);
  const [solved, setSolved] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const areaRef = useRef();

  // Explicit start gate, pieces are previewed (scattered) the moment a
  // level is picked, but the timer waits until the user presses Start.
  // Same intent as PuzzleMap: don't penalise the user for the time spent
  // picking which episode they actually want to play.
  const [hasStarted, setHasStarted] = useState(false);

  // Leaderboard state, single board across all difficulties (per user
  // decision). Score formula = max(0, CAP - elapsed) so faster solves rank
  // higher on the board's "highest score wins" sort.
  const [winScore, setWinScore] = useState(0);
  const [topEntries, setTopEntries] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [submitName, setSubmitName] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [submittedRank, setSubmittedRank] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Auto-scroll the solved message + Download/Play Again buttons into view —
  // they appear below a tall puzzle area which on mobile pushes them off-screen.
  const solvedRef = useRef(null);
  useEffect(() => {
    if (solved && solvedRef.current) {
      requestAnimationFrame(() => {
        solvedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [solved]);

  const gridMap = { easy: [2, 5], medium: [4, 5], hard: [5, 6] };

  const t = {
    en: {
      pageTitle: "Royal Puzzle – SolTheCat",
      title: <>Royal <TitleEm>Puzzle</TitleEm> 🧩</>,
      subtitle: "Puzzle: SOLadventure:",
      description: "Choose your episode, pick your challenge level and piece together the royal puzzle!",
      back: "← Back to games",
      download: "⬇️ Download Puzzle",
      best: "🏆 Best Time: ",
      solvedMessage: "🎉 Royal Puzzle Solved!",
      playAgain: "🔁 Play Again",
      startPuzzle: "🐾 Start puzzle",
      readyHint: "Ready when you are, press Start to begin the timer.",
      levels: { easy: "Easy", medium: "Medium", hard: "Hard" },
      loadFail: "Couldn't load episodes. Please try refreshing the page.",
      finalScore: (s) => `⏱️ Solved in ${s}s!`,
      personalBest: (s) => `🏆 Your best: ${s} pts`,
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
      pageTitle: "Βασιλικό Παζλ – SolTheCat",
      title: <>Βασιλικό <TitleEm>Παζλ</TitleEm> 🧩</>,
      subtitle: "Παζλ: SOLadventure:",
      description: "Διάλεξε επεισόδιο, επίπεδο δυσκολίας και συναρμολόγησε το βασιλικό παζλ!",
      back: "← Επιστροφή στα παιχνίδια",
      download: "⬇️ Κατέβασε το Παζλ",
      best: "🏆 Καλύτερος Χρόνος: ",
      solvedMessage: "🎉 Λύθηκε το Βασιλικό Παζλ!",
      playAgain: "🔁 Παίξε Ξανά",
      startPuzzle: "🐾 Ξεκίνα το παζλ",
      readyHint: "Έτοιμος; Πάτα Start για να ξεκινήσει ο χρόνος.",
      levels: { easy: "Εύκολο", medium: "Μέσο", hard: "Δύσκολο" },
      loadFail: "Δεν φόρτωσαν τα επεισόδια. Παρακαλώ δοκίμασε refresh.",
      finalScore: (s) => `⏱️ Το έλυσες σε ${s}δ.!`,
      personalBest: (s) => `🏆 Καλύτερο σου: ${s} πόντοι`,
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

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}episodes.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const vis = data.filter((ep) => ep.visible);
        setEpisodes(vis);
        if (vis.length) setSelectedId(vis[0].id.toString());
        setLoadError(false);
      })
      .catch((err) => {
        console.error("Failed to load episodes:", err);
        setLoadError(true);
      });
  }, []);

  useEffect(() => {
    setLevel("");
    setPieces([]);
    setSolved(false);
    setStartTime(null);
    setElapsed(0);
    setHasStarted(false);
    setWinScore(0);
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
  }, [selectedId]);

  // Fetch top 3 + load personal best on mount.
  useEffect(() => {
    setPersonalBest(parseInt(localStorage.getItem("royalPuzzle_best") || "0", 10));
    fetch("/leaderboard?game=royalpuzzle&level=default")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setTopEntries(data.entries || []))
      .catch(() => setTopEntries([]));
  }, []);

  const selectedEpisode = episodes.find((ep) => ep.id.toString() === selectedId);
  const imagePath = selectedEpisode && `${import.meta.env.BASE_URL}${selectedEpisode.puzzleImage || selectedEpisode.image}`;
  const [rows, cols] = gridMap[level] || [];

  useEffect(() => {
    if (!imagePath || !level) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imagePath;

    img.onload = () => {
      const areaSize = areaRef.current.clientWidth;
      const w = img.width / cols;
      const h = img.height / rows;
      const tmp = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, c * w, r * h, w, h, 0, 0, w, h);

          tmp.push({
            id: r * cols + c,
            img: canvas.toDataURL(),
            x: Math.random() * (areaSize - areaSize / cols),
            y: Math.random() * (areaSize - areaSize / rows),
            correctX: c * (areaSize / cols),
            correctY: r * (areaSize / rows),
          });
        }
      }

      setPieces(tmp);
      setSolved(false);
      // Pieces are scattered (preview); timer does NOT start here. The
      // user presses Start (or Play Again later) to engage the timer.
      setStartTime(null);
      setElapsed(0);
      setHasStarted(false);
    };
  }, [imagePath, level]);

  // Engages the timer. Used by both initial Start and Play Again, pieces
  // are already scattered, this just flips the gate and records start time.
  const startPuzzle = () => {
    if (pieces.length === 0) return;
    setStartTime(Date.now());
    setElapsed(0);
    setHasStarted(true);
    setWinScore(0);
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
  };

  useEffect(() => {
    if (!startTime || solved) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, solved]);

  const handleDrag = (idx, e) => {
    const newPieces = [...pieces];
    newPieces[idx].x += e.movementX;
    newPieces[idx].y += e.movementY;
    setPieces(newPieces);

    const snapDist = 20;
    if (
      Math.abs(newPieces[idx].x - newPieces[idx].correctX) < snapDist &&
      Math.abs(newPieces[idx].y - newPieces[idx].correctY) < snapDist
    ) {
      newPieces[idx].x = newPieces[idx].correctX;
      newPieces[idx].y = newPieces[idx].correctY;
      setPieces(newPieces);

      if (newPieces.every(p => p.x === p.correctX && p.y === p.correctY)) {
        setSolved(true);
        celebrate();
        const key = `royalpuzzle_${selectedId}_${level}`;
        const best = localStorage.getItem(key);
        if (!best || elapsed < parseInt(best)) {
          localStorage.setItem(key, elapsed);
        }
        // Leaderboard: compute global "higher = faster" score and update PB.
        const score = Math.max(0, PUZZLE_SCORE_CAP - elapsed);
        setWinScore(score);
        const prevGlobalBest = parseInt(localStorage.getItem("royalPuzzle_best") || "0", 10);
        if (score > prevGlobalBest) {
          localStorage.setItem("royalPuzzle_best", String(score));
          setPersonalBest(score);
        }
        markDailyDoneIfMatches("royalpuzzle", "default");
      }
    }
  };

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
          game: "royalpuzzle",
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

  const handlePointerDown = (e, idx) => {
    // Pre-start preview: pieces are visible but inert until the user
    // presses Start. Prevents accidentally solving (or pre-burning time
    // off) while still browsing episodes.
    if (!hasStarted) return;
    e.target.setPointerCapture(e.pointerId);
    const move = (ev) => handleDrag(idx, ev);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const downloadImage = async () => {
    if (!areaRef.current) return;
    const canvas = await html2canvas(areaRef.current);
    const link = document.createElement("a");
    link.download = "sol_puzzle.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const bestKey = `royalpuzzle_${selectedId}_${level}`;
  const best = localStorage.getItem(bestKey);

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <link rel="canonical" href="https://solthecat.com/games/royalpuzzle" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title>{t.title}</Title>
        {selectedId && <Subtitle>{t.subtitle} {selectedId}</Subtitle>}
        <Description>{t.description}</Description>

        {loadError && <ErrorBox role="alert">{t.loadFail}</ErrorBox>}

        <Dropdown value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {episodes.map((ep) => (
            <option key={ep.id} value={ep.id}>
              {typeof ep.title === "object" ? ep.title[language] : ep.title}
            </option>
          ))}
        </Dropdown>

        {!level && (
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
        )}

        {!level && ["easy", "medium", "hard"].map(l => (
          <LevelButton key={l} onClick={() => setLevel(l)}>
            {t.levels[l]}
          </LevelButton>
        ))}

        {/* Pre-start gate: pieces are previewed but the timer doesn't tick.
            Lets the user verify the episode selection before committing. */}
        {level && !hasStarted && !solved && pieces.length > 0 && (
          <>
            <Info style={{ fontWeight: 400 }}>{t.readyHint}</Info>
            <SolButton as="button" onClick={startPuzzle}>
              {t.startPuzzle}
            </SolButton>
          </>
        )}

        {level && (
          <PuzzleArea ref={areaRef}>
            {pieces.map((p, i) => (
              <Piece
                key={p.id}
                src={p.img}
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: `${100 / cols}%`,
                  height: `${100 / rows}%`,
                  zIndex: p.x === p.correctX && p.y === p.correctY ? 1 : 2,
                  cursor: hasStarted ? "grab" : "default",
                  opacity: hasStarted ? 1 : 0.85,
                }}
                draggable="false"
                onPointerDown={(e) => handlePointerDown(e, i)}
              />
            ))}
          </PuzzleArea>
        )}

        {level && hasStarted && <Info>⏱️ {elapsed}s {best && `, ${t.best} ${best}s`}</Info>}

        {solved && (
          <div ref={solvedRef}>
            <Info>{t.solvedMessage}</Info>
            <Info style={{ fontWeight: 600 }}>{t.finalScore(elapsed)}</Info>

            {winScore > 0 && winScore >= personalBest && (
              <PersonalBestText style={{ fontSize: "1rem" }}>
                {t.newRecord}
              </PersonalBestText>
            )}

            {qualifiesForLeaderboard() && submitState === "idle" && (
              <>
                <PersonalBestText>{t.qualifies}</PersonalBestText>
                <p style={{ color: "#4a3f37", fontSize: "0.85rem", margin: "0.3rem 0", textAlign: "center" }}>
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

            <SolButton as="button" onClick={downloadImage}>{t.download}</SolButton>
            <SolButton
              as="button"
              onClick={() => {
                setLevel("");
                setPieces([]);
                setSolved(false);
                setStartTime(null);
                setElapsed(0);
                setHasStarted(false);
                setWinScore(0);
                setSubmitName("");
                setSubmitState("idle");
                setSubmittedRank(null);
              }}
            >
              {t.playAgain}
            </SolButton>
          </div>
        )}

        <BackLink to="/games">{t.back}</BackLink>
      </PageContainer>
    </>
  );
}
