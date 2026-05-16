// src/pages/PuzzleMapGame.jsx

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { celebrate } from "../utils/celebrate.js";
import { markDailyDoneIfMatches } from "../utils/dailyChallenge.js";

const Title = styled.h1`
  font-family: 'Instrument Serif', serif;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  line-height: 1.05;
  color: var(--sol-ink);
  margin-bottom: 0.5rem;
  @media (max-width: 480px) { font-size: 1.6rem; }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #4a3f37;
  margin-bottom: 2rem;
`;

const DropdownWrapper = styled.div`
  display: flex;
  justify-content: center;
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

const PuzzleWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  width: 100%;
  max-width: 300px;
`;

const Tile = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  cursor: pointer;
  position: relative;
`;

const EmptyTile = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  background: #ede4d3;
  border-radius: 6px;
`;

const Message = styled.p`
  margin-top: 1.5rem;
  font-size: 1.2rem;
  color: #1a1614;
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

const StyledButton = styled.button`
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background: #8b6b8e;
  color: #fff;
  border: none;
  border-radius: 16px;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 4px 10px rgba(26, 22, 20,0.3);
  transition: transform 0.2s;

  &:hover { transform: scale(1.05); }
`;

const BackLink = styled(Link)`
  display: block;
  margin-top: 1.5rem;
  color: #7a5a7c;
  text-decoration: none;
  font-weight: bold;

  &:hover { text-decoration: underline; }
`;

const TimerLine = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  color: #1a1614;
  font-weight: 600;
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

// Score cap matches functions/leaderboard.js MAX_SCORES["puzzlemap_default"].
// Anyone who solves faster than 9999 seconds (~2.7h) lands on the board.
const PUZZLE_SCORE_CAP = 9999;

const initialArr = [...Array(9).keys()];

export default function PuzzleMapGame() {
  const [episodes, setEpisodes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [tiles, setTiles] = useState(initialArr);
  const [isSolved, setIsSolved] = useState(false);
  const [slices, setSlices] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const { language } = useLanguage();

  // Timer + leaderboard state. Score = max(0, CAP - elapsed) so faster
  // = higher score, matching the leaderboard's "higher is better" sort.
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [winScore, setWinScore] = useState(0);
  const [topEntries, setTopEntries] = useState([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [submitName, setSubmitName] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [submittedRank, setSubmittedRank] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const content = {
    en: {
      pageTitle: "Sol’s Puzzle Game – SolTheCat",
      title: "Sol’s Puzzle Game 🧩",
      subtitle: selectedId ? `Puzzle: SOLadventure #${selectedId}` : "",
      playAgain: "🔁 Play Again",
      startPuzzle: "🐾 Start puzzle",
      pickEpisodeHint: "Pick an episode and press Start when you're ready.",
      solvedMessage: "🎉 Puzzle Solved!",
      back: "← Back to games",
      loadFail: "Couldn't load episodes. Please try refreshing the page.",
      timeLabel: (s) => `⏱️ ${s}s`,
      finalScore: (s) => `⏱️ Solved in ${s}s!`,
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
      pageTitle: "Παζλ της Sol – SolTheCat",
      title: "Παζλ της Sol 🧩",
      subtitle: selectedId ? `Παζλ: SOLadventure #${selectedId}` : "",
      playAgain: "🔁 Παίξε Ξανά",
      startPuzzle: "🐾 Ξεκίνα το παζλ",
      pickEpisodeHint: "Διάλεξε επεισόδιο και πάτα Start όταν είσαι έτοιμος.",
      solvedMessage: "🎉 Λύθηκε το Παζλ!",
      back: "← Επιστροφή στα παιχνίδια",
      loadFail: "Δεν φόρτωσαν τα επεισόδια. Παρακαλώ δοκίμασε refresh.",
      timeLabel: (s) => `⏱️ ${s}δ.`,
      finalScore: (s) => `⏱️ Το έλυσες σε ${s}δ.!`,
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
  };
  const t = content[language];

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

  const selectedEpisode = episodes.find((ep) => ep.id.toString() === selectedId);
  const imagePath = selectedEpisode && `${import.meta.env.BASE_URL}${selectedEpisode.image}`;

  // Slice the selected episode image into 9 canvas tiles. This runs whenever
  // the user picks a different episode. The puzzle stays in "not started"
  // state until the user explicitly presses the Start button — that way the
  // timer doesn't run while the user is still deciding which episode to play.
  useEffect(() => {
    if (!imagePath) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imagePath;
    img.onload = () => {
      const w = img.width / 3;
      const h = img.height / 3;
      const tmp = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, col * w, row * h, w, h, 0, 0, w, h);
          tmp.push(canvas.toDataURL());
        }
      }
      setSlices(tmp);
      // Switching episodes resets play state — user must press Start again
      // before the timer can resume. Also covers the page-load case where
      // the first episode auto-selects.
      setHasStarted(false);
      setIsSolved(false);
      setStartTime(null);
      setElapsed(0);
      setWinScore(0);
    };
  }, [imagePath]);

  // Shuffle the tiles and kick off the timer. Used by both the initial Start
  // button and Play Again — same flow, no image reload required.
  const startPuzzle = () => {
    if (slices.length !== 9) return;
    let arr = [...initialArr];
    let emptyIdx = 8;
    const swap = (a, b) => {
      const c = [...arr];
      [c[a], c[b]] = [c[b], c[a]];
      return c;
    };
    for (let i = 0; i < 100; i++) {
      const moves = [];
      if (emptyIdx % 3 !== 0) moves.push(emptyIdx - 1);
      if (emptyIdx % 3 !== 2) moves.push(emptyIdx + 1);
      if (emptyIdx >= 3) moves.push(emptyIdx - 3);
      if (emptyIdx < 6) moves.push(emptyIdx + 3);
      const to = moves[Math.floor(Math.random() * moves.length)];
      arr = swap(emptyIdx, to);
      emptyIdx = to;
    }
    setTiles(arr);
    setIsSolved(false);
    setStartTime(Date.now());
    setElapsed(0);
    setWinScore(0);
    setSubmitName("");
    setSubmitState("idle");
    setSubmittedRank(null);
    setHasStarted(true);
  };

  // Count-up timer. Pauses on solve via the dependency on isSolved.
  useEffect(() => {
    if (!startTime || isSolved) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime, isSolved]);

  // Fetch top 3 + load personal best on mount.
  useEffect(() => {
    setPersonalBest(parseInt(localStorage.getItem("puzzleMap_best") || "0", 10));
    fetch("/leaderboard?game=puzzlemap&level=default")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setTopEntries(data.entries || []))
      .catch(() => setTopEntries([]));
  }, []);

  const handleClick = (idx) => {
    if (isSolved) return;
    const emptyIdx = tiles.indexOf(8);
    if ([idx - 1, idx + 1, idx - 3, idx + 3].includes(emptyIdx)) {
      const c = [...tiles];
      [c[idx], c[emptyIdx]] = [c[emptyIdx], c[idx]];
      setTiles(c);
      const sol = [...Array(9).keys()];
      const chk = [...c];
      const e = chk.indexOf(8);
      chk.splice(e, 1);
      sol.splice(e, 1);
      if (chk.every((v, i) => v === sol[i])) {
        setIsSolved(true);
        // Freeze the final elapsed value at solve time. The timer effect
        // also stops here via isSolved dependency, so elapsed won't tick
        // further.
        const finalElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsed(finalElapsed);
        const score = Math.max(0, PUZZLE_SCORE_CAP - finalElapsed);
        setWinScore(score);
        const prevBest = parseInt(localStorage.getItem("puzzleMap_best") || "0", 10);
        if (score > prevBest) {
          localStorage.setItem("puzzleMap_best", String(score));
          setPersonalBest(score);
        }
        markDailyDoneIfMatches("puzzlemap", "default");
        celebrate();
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
          game: "puzzlemap",
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

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <link rel="canonical" href="https://solthecat.com/games/puzzlemap" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title>{t.title}</Title>
        {selectedId && <Subtitle>{t.subtitle}</Subtitle>}

        {loadError && <ErrorBox role="alert">{t.loadFail}</ErrorBox>}

        <DropdownWrapper>
          <Dropdown
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {episodes.map((ep) => {
              const lbl =
                typeof ep.title === "object"
                  ? ep.title[language]
                  : ep.title;
              return (
                <option key={ep.id} value={ep.id}>
                  {lbl}
                </option>
              );
            })}
          </Dropdown>
        </DropdownWrapper>

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

        {/* Pre-start: dropdown is settled, image is loading or loaded, but
            the user hasn't pressed Start yet. Show the Start button + hint
            and keep the puzzle grid hidden so the timer can't tick. */}
        {!hasStarted && !isSolved && (
          <>
            <Subtitle style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
              {t.pickEpisodeHint}
            </Subtitle>
            <StyledButton onClick={startPuzzle} disabled={slices.length !== 9}>
              {t.startPuzzle}
            </StyledButton>
          </>
        )}

        {hasStarted && !isSolved && (
          <TimerLine>{t.timeLabel(elapsed)}</TimerLine>
        )}

        {(hasStarted || isSolved) && (
          <PuzzleWrapper>
            <Grid>
              {tiles.map((tile, i) =>
                tile === 8 ? (
                  <EmptyTile key={i} />
                ) : (
                  <Tile key={i} onClick={() => handleClick(i)}>
                    <img
                      src={slices[tile]}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Tile>
                )
              )}
            </Grid>
          </PuzzleWrapper>
        )}

        {isSolved && (
          <>
            <Message>{t.solvedMessage}</Message>
            <Message style={{ fontSize: "1rem" }}>{t.finalScore(elapsed)}</Message>

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

            <StyledButton onClick={startPuzzle}>
              {t.playAgain}
            </StyledButton>
          </>
        )}

        <BackLink to="/games">{t.back}</BackLink>
      </PageContainer>
    </>
  );
}
