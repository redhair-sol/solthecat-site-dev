import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import Hero from "../components/Hero.jsx";
import useStreakBadges from "../hooks/useStreakBadges";
import {
  getTodayChallenge,
  getPersonalBest,
  isDailyDoneToday,
  getDailyStreak,
  formatScore,
} from "../utils/dailyChallenge.js";
import { upperLocal } from "../utils/greekUpper.js";

// ----- LIVE BADGE -----
const LiveBadge = styled.div`
  background: #47c9a0;
  color: white;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 9999;
`;

const LiveDot = styled.div`
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2.5s infinite ease-in-out;

  @keyframes pulse {
    0% { transform: scale(0.7); opacity: 0.6; }
    50% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0.7); opacity: 0.6; }
  }
`;

const LiveBadgeLink = styled(Link)`
  position: absolute;
  top: 18px;
  right: 18px;
  text-decoration: none;
  z-index: 9999;

  @media (max-width: 768px) {
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    right: auto;
  }

  @media (max-width: 360px) {
    top: 30px;
  }
`;

const LanguageToggle = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.2rem;
  flex-wrap: wrap;
`;

const ToggleButton = styled.button`
  padding: 0.3rem 0.8rem;
  min-width: 150px;
  border: 1px solid var(--sol-line);
  background-color: ${({ $active }) => ($active ? "var(--sol-rose)" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--sol-cream)" : "var(--sol-ink-soft)")};
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
`;

const QuoteBox = styled(motion.div)`
  background-color: rgba(255, 248, 235, 0.7);
  border: 1px solid var(--sol-line);
  padding: 1.2rem;
  border-radius: 1.5rem;
  margin-top: 1.6rem;
  max-width: 600px;
  box-shadow:
    0 1px 3px rgba(26, 22, 20, 0.06),
    0 12px 32px -10px rgba(26, 22, 20, 0.14);
  text-align: center;
`;

const QuoteTitle = styled.h3`
  font-family: var(--sol-serif);
  font-size: 1.6rem;
  color: var(--sol-ink);
  margin-bottom: 0.5rem;
`;

const QuoteText = styled.p`
  font-style: italic;
  color: var(--sol-ink-soft);
`;

const BadgeBox = styled(motion.div)`
  background-color: rgba(255, 248, 235, 0.7);
  border: 1px solid var(--sol-line);
  padding: 1rem;
  border-radius: 1.5rem;
  max-width: 600px;
  box-shadow:
    0 1px 3px rgba(26, 22, 20, 0.06),
    0 12px 32px -10px rgba(26, 22, 20, 0.14);
  text-align: center;
  margin-top: 1.6rem;
`;

const BadgeIntro = styled.p`
  color: var(--sol-ink-soft);
`;

const BadgeName = styled.p`
  font-size: 1.1rem;
  color: var(--sol-ink);
  font-weight: 500;
`;

const BadgeDesc = styled.p`
  color: var(--sol-ink-soft);
`;

const StreakText = styled.p`
  color: var(--sol-ink);
  margin-top: 0.5rem;
`;

const NextBadgeText = styled.p`
  color: var(--sol-ink-soft);
  font-size: 0.9rem;
  margin-top: 0.4rem;
  font-style: italic;
`;

const UnlockedText = styled.p`
  color: var(--sol-ink);
  margin-top: 0.5rem;
`;

const GamesCard = styled(motion.div)`
  background-color: rgba(255, 248, 235, 0.7);
  border: 1px solid var(--sol-line);
  padding: 1.5rem;
  border-radius: 1.5rem;
  max-width: 600px;
  margin-top: 1.6rem;
  text-align: center;
  box-shadow:
    0 1px 3px rgba(26, 22, 20, 0.06),
    0 12px 32px -10px rgba(26, 22, 20, 0.14);
`;

const GamesTitle = styled.h3`
  font-family: var(--sol-serif);
  color: var(--sol-ink);
  font-size: 1.7rem;
  font-weight: 600;
`;

const GamesText = styled.p`
  color: var(--sol-ink-soft);
  margin-bottom: 1.2rem;
`;

const GamesCTA = styled(Link)`
  display: inline-block;
  padding: 0.6rem 1.4rem;
  background-color: var(--sol-plum);
  color: var(--sol-cream);
  text-decoration: none;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(26, 22, 20, 0.12);
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    background-color: var(--sol-mauve);
    transform: translateY(-1px);
  }
`;

// --- Daily Challenge card ---
// Deeper-pink accent so it visually distinguishes from the soft pink Games
// card right below it (the "hot now" vs "browse all" relationship).
const ChallengeCard = styled(motion.div)`
  background-color: rgba(255, 248, 235, 0.7);
  border: 1px solid var(--sol-line);
  padding: 1.5rem;
  border-radius: 1.5rem;
  max-width: 600px;
  margin-top: 1.6rem;
  text-align: center;
  box-shadow:
    0 1px 3px rgba(26, 22, 20, 0.06),
    0 12px 32px -10px rgba(26, 22, 20, 0.14);
`;

const ChallengeKicker = styled.p`
  color: var(--sol-sun);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  margin: 0 0 0.4rem;
`;

const ChallengeTitle = styled.h3`
  font-family: var(--sol-serif);
  color: var(--sol-ink);
  font-size: 1.7rem;
  font-weight: 600;
  margin: 0 0 0.3rem;
`;

const ChallengeSubtitle = styled.p`
  color: var(--sol-ink-soft);
  margin: 0 0 1rem;
  font-size: 0.95rem;
`;

const ChallengeTop3 = styled.div`
  background: rgba(255, 248, 235, 0.9);
  border: 1px solid var(--sol-line);
  border-radius: 0.8rem;
  padding: 0.6rem 0.9rem;
  margin: 0.5rem auto 1rem;
  max-width: 280px;
  font-family: 'Poppins', sans-serif;
`;

const ChallengeTop3Title = styled.p`
  font-weight: 700;
  color: var(--sol-ink-soft);
  margin: 0 0 0.3rem;
  text-align: center;
  font-size: 0.85rem;
`;

const ChallengeTop3Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--sol-ink);
  padding: 0.1rem 0;
`;

const ChallengeTop3Empty = styled.p`
  color: var(--sol-ink-soft);
  font-size: 0.8rem;
  font-style: italic;
  text-align: center;
  margin: 0;
`;

const ChallengeCTA = styled(Link)`
  display: inline-block;
  padding: 0.6rem 1.4rem;
  background-color: var(--sol-plum);
  color: var(--sol-cream);
  text-decoration: none;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(26, 22, 20, 0.12);
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    background-color: var(--sol-mauve);
    transform: translateY(-1px);
  }
`;

const ChallengeStatusRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 0.5rem 0 1rem;
`;

const ChallengePill = styled.span`
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  background: ${({ $variant }) =>
    $variant === "done" ? "#a5d6a7" :
    $variant === "streak" ? "#ffe0b2" :
    "rgba(255, 248, 235, 0.9)"};
  color: ${({ $variant }) =>
    $variant === "done" ? "#1b5e20" :
    $variant === "streak" ? "#bf360c" :
    "var(--sol-mauve)"};
  border: 1px solid ${({ $variant }) =>
    $variant === "done" || $variant === "streak"
      ? "transparent"
      : "var(--sol-line)"};
`;

const RelativePageContainer = styled(PageContainer)`
  position: relative;
`;

// Daily Challenge state (rotation pool, picker, streak helpers) lives in
// utils/dailyChallenge.js, shared with the games that mark completion.

export default function Home() {
  const { language } = useLanguage();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const hasSearchParam = Boolean(queryParams.get("s"));

  const [quote, setQuote] = useState("");
  const [mode, setMode] = useState("mood");
  const [isLive, setIsLive] = useState(false);

  // Daily challenge, picked from today's date, then top 3 fetched live.
  const dailyChallenge = getTodayChallenge();
  const [challengeTop3, setChallengeTop3] = useState([]);
  const [challengePB, setChallengePB] = useState(0);
  const [challengeDone, setChallengeDone] = useState(false);
  const [challengeStreak, setChallengeStreak] = useState(0);

  useEffect(() => {
    const { game, level } = dailyChallenge;
    fetch(`/leaderboard?game=${encodeURIComponent(game)}&level=${encodeURIComponent(level)}`)
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data) => setChallengeTop3(data.entries || []))
      .catch(() => setChallengeTop3([]));
    setChallengePB(getPersonalBest(game, level));
    setChallengeDone(isDailyDoneToday());
    setChallengeStreak(getDailyStreak());
  }, [dailyChallenge.game, dailyChallenge.level]);

  // Same-origin endpoint backed by functions/solcam-check.js (prod) and a
  // matching Vite middleware (dev). Always returns { live: boolean }, status 200.
  const checkStream = async () => {
    try {
      const res = await fetch(`/solcam-check?t=${Date.now()}`);
      if (!res.ok) {
        setIsLive(false);
        return;
      }
      const data = await res.json();
      setIsLive(data.live === true);
    } catch {
      setIsLive(false);
    }
  };

  useEffect(() => { checkStream(); }, []);
  useEffect(() => {
    // 30s polling. Live stream status doesn't change second-by-second, so 5s
    // was overkill (720 req/h/visitor on /solcam-check). 30s = 120 req/h —
    // the LIVE badge can appear up to half a minute late, acceptable trade.
    const interval = setInterval(checkStream, 30000);
    return () => clearInterval(interval);
  }, []);

  const { streak, currentBadge, nextBadge, unlockedToday } = useStreakBadges();

  function getDailyMessage(mode, language, options) {
    if (!options || options.length === 0) return null;
    const today = new Date().toISOString().slice(0, 10);
    const key = `solDaily-${mode}-${language}-${today}`;
    const cached = localStorage.getItem(key);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Corrupt cache (e.g. legacy "undefined" entry), fall through and re-pick.
      }
    }

    const selected = options[Math.floor(Math.random() * options.length)];
    localStorage.setItem(key, JSON.stringify(selected));
    return selected;
  }

  useEffect(() => {
    const today = new Date();
    const isoDate = today.toISOString().slice(0, 10); // 2026-05-06
    const monthDay = isoDate.slice(5);                // 05-06, recurring annual key
    const dayOfWeek = today
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const month = today.getMonth();

    const season = [
      "winter","winter","spring","spring","spring",
      "summer","summer","summer","autumn","autumn","autumn","winter"
    ][month];

    const file =
      mode === "fortune"
        ? "/data/smartFortunes.json"
        : "/data/smartQuotes.json";

    fetch(file)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Lookup priority: full-ISO one-time override → MM-DD recurring →
        // weekday → season → default. MM-DD lets entries like "12-25" trigger
        // every Christmas without needing yearly updates.
        const options =
          mode === "fortune"
            ? data.fortunes.map((f) => f[language]).filter(Boolean)
            : data[isoDate]?.[language] ||
              data[monthDay]?.[language] ||
              data[dayOfWeek]?.[language] ||
              data[season]?.[language] ||
              data["default"]?.[language] ||
              [];

        const selected = getDailyMessage(mode, language, options);
        setQuote(
          selected ||
            (language === "el"
              ? "Η Sol ξεκουράζεται βασιλικά σήμερα. 🐾"
              : "Sol is taking a royal pause today. 🐾")
        );
      })
      .catch((err) => {
        console.error("Failed to load daily quote:", err);
        setQuote(
          language === "el"
            ? "Η Sol ξεκουράζεται βασιλικά σήμερα. 🐾"
            : "Sol is taking a royal pause today. 🐾"
        );
      });
  }, [language, mode]);

  const content = {
    en: {
      metaDescription:
        "Follow Sol the Cat across 50+ cities, from Athens to Petra. Read travel stories, play 12 free mini-games, and beat the daily challenge.",
      quoteTitle:
        mode === "fortune"
          ? "Royal Fortune of the Day"
          : "Royal Mood of the Day",
      toggleMood: "Mood of the Day",
      toggleFortune: "Words of Sol",
      gamesTitle: "Ready to play with Sol?",
      gamesText: "Explore mini-games inspired by her travels!",
      gamesCTA: "Play the Games",
      live: "LIVE",
      challengeKicker: "Daily Challenge",
      challengeSubtitle: "Today's pick, beat the board!",
      challengeCTA: "Play today's challenge",
      challengeCTADone: "Play again today",
      challengeTop3: "🏆 Today's leaderboard",
      challengeTop3Empty: "No scores yet, be the first!",
      challengePB: (s) => `🎯 Your best on this: ${s}`,
      challengeDone: "✅ Played today's challenge!",
      challengeStreak: (n) => `🔥 ${n}-day streak`,
      visitStreak: (n) => `Visit Streak: ${n} day${n > 1 ? "s" : ""}`,
      newBadge: "🎉 New Badge Unlocked Today!",
      nextBadge: (name, days) =>
        `Next badge: ${name} in ${days} day${days > 1 ? "s" : ""}`,
    },
    el: {
      metaDescription:
        "Ακολούθα τη Sol the Cat σε 50+ πόλεις, από την Αθήνα μέχρι την Πέτρα. Διάβασε ταξιδιωτικές ιστορίες, παίξε 12 δωρεάν mini-games και νίκα την καθημερινή πρόκληση.",
      quoteTitle:
        mode === "fortune"
          ? "Η Πατουσένια Συμβουλή της Ημέρας"
          : "Η Πατουσένια Στιγμή της Ημέρας",
      toggleMood: "Διάθεση Ημέρας",
      toggleFortune: "Λόγια της Sol",
      gamesTitle: "Παίξε με τη Sol!",
      gamesText: "Ανακάλυψε mini-games...",
      gamesCTA: "Παίξε Παιχνίδια",
      live: "ΖΩΝΤΑΝΑ",
      challengeKicker: "Πρόκληση Ημέρας",
      challengeSubtitle: "Η σημερινή επιλογή, νίκα τον πίνακα!",
      challengeCTA: "Παίξε τη σημερινή πρόκληση",
      challengeCTADone: "Παίξε ξανά σήμερα",
      challengeTop3: "🏆 Σημερινή βαθμολογία",
      challengeTop3Empty: "Κανένα σκορ ακόμη, γίνε ο πρώτος!",
      challengePB: (s) => `🎯 Το καλύτερο σου εδώ: ${s}`,
      challengeDone: "✅ Έπαιξες τη σημερινή πρόκληση!",
      challengeStreak: (n) => `🔥 Σερί ${n} ημερών`,
      visitStreak: (n) => `Σερί επισκέψεων: ${n} ${n === 1 ? "ημέρα" : "ημέρες"}`,
      newBadge: "🎉 Ξεκλείδωσες νέο Badge σήμερα!",
      nextBadge: (name, days) =>
        `Επόμενο badge: ${name} σε ${days} ${days === 1 ? "ημέρα" : "ημέρες"}`,
    },
  };

  const t = content[language];

  return (
    <>
      <Helmet>
        <title>Sol’s Adventures – Home</title>
        <meta name="description" content={t.metaDescription} />
        <link rel="canonical" href="https://solthecat.com/" />
        {hasSearchParam && <meta name="robots" content="noindex, follow" />}
        <meta property="og:title" content="Sol’s Adventures – Home" />
        <meta property="og:description" content={t.metaDescription} />
        <meta property="og:url" content="https://solthecat.com/" />
      </Helmet>

      <RelativePageContainer
        noBg
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >

        {isLive && (
          <LiveBadgeLink to="/solcam">
            <LiveBadge>
              <LiveDot /> {t.live}
            </LiveBadge>
          </LiveBadgeLink>
        )}

        {/* Hero v2, Warm Editorial. Portrait photo with cozy golden-hour
            lighting; pairs with the cream/sun/ink palette. */}
        <Hero photo="/images/sol-hero.webp" isLive={isLive} />

        {/* QUOTE TOGGLE */}
        <LanguageToggle style={{ marginTop: "2.4rem" }}>
          <ToggleButton onClick={() => setMode("mood")} $active={mode === "mood"}>
            {t.toggleMood}
          </ToggleButton>
          <ToggleButton onClick={() => setMode("fortune")} $active={mode === "fortune"}>
            {t.toggleFortune}
          </ToggleButton>
        </LanguageToggle>

        {/* QUOTE BOX */}
        {quote && (
          <QuoteBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <QuoteTitle>{t.quoteTitle}</QuoteTitle>
            <QuoteText>{quote}</QuoteText>
          </QuoteBox>
        )}

        {/* BADGE */}
        {currentBadge && (
          <BadgeBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BadgeIntro>
              {language === "en"
                ? "Your loyalty badge shows how many days you’ve walked the royal path with Sol."
                : "Το badge πίστης σου δείχνει πόσες μέρες ακολουθείς το βασιλικό μονοπάτι με τη Sol."}
            </BadgeIntro>

            <BadgeName>
              {currentBadge.emoji} {currentBadge.name[language]}
            </BadgeName>

            <BadgeDesc>{currentBadge.description[language]}</BadgeDesc>

            <StreakText>{t.visitStreak(streak)}</StreakText>

            {nextBadge && (
              <NextBadgeText>
                {t.nextBadge(nextBadge.name[language], nextBadge.day - streak)}
              </NextBadgeText>
            )}

            {unlockedToday && <UnlockedText>{t.newBadge}</UnlockedText>}
          </BadgeBox>
        )}

        {/* DAILY CHALLENGE, sits right above the general Games card so the
            two "play" surfaces cluster together (hot-now vs browse-all). */}
        <ChallengeCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <ChallengeKicker>{upperLocal(t.challengeKicker)}</ChallengeKicker>
          <ChallengeTitle>
            {dailyChallenge.emoji}{" "}
            {language === "el" ? dailyChallenge.titleEl : dailyChallenge.titleEn}
          </ChallengeTitle>
          <ChallengeSubtitle>{t.challengeSubtitle}</ChallengeSubtitle>

          {(challengeDone || challengeStreak > 0 || challengePB > 0) && (
            <ChallengeStatusRow>
              {challengeDone && (
                <ChallengePill $variant="done">{t.challengeDone}</ChallengePill>
              )}
              {challengeStreak > 0 && (
                <ChallengePill $variant="streak">
                  {t.challengeStreak(challengeStreak)}
                </ChallengePill>
              )}
              {challengePB > 0 && (
                <ChallengePill>
                  {t.challengePB(formatScore(dailyChallenge.game, challengePB))}
                </ChallengePill>
              )}
            </ChallengeStatusRow>
          )}

          <ChallengeTop3>
            <ChallengeTop3Title>{t.challengeTop3}</ChallengeTop3Title>
            {challengeTop3.length === 0 ? (
              <ChallengeTop3Empty>{t.challengeTop3Empty}</ChallengeTop3Empty>
            ) : (
              challengeTop3.map((e, i) => (
                <ChallengeTop3Row key={`${e.name}-${e.score}-${i}`}>
                  <span>
                    <span style={{display:"inline-block",width:"1.5em"}}>{["🥇", "🥈", "🥉"][i] || ""}</span>{e.name}
                  </span>
                  <span><strong>{formatScore(dailyChallenge.game, e.score)}</strong></span>
                </ChallengeTop3Row>
              ))
            )}
          </ChallengeTop3>

          <ChallengeCTA to={dailyChallenge.route}>
            {challengeDone ? t.challengeCTADone : t.challengeCTA}
          </ChallengeCTA>
        </ChallengeCard>

        {/* GAMES */}
        <GamesCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GamesTitle>{t.gamesTitle}</GamesTitle>
          <GamesText>{t.gamesText}</GamesText>
          <GamesCTA to="/games">{t.gamesCTA}</GamesCTA>
        </GamesCard>

      </RelativePageContainer>
    </>
  );
}
