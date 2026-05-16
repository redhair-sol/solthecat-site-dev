// src/pages/SolPicks.jsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { celebrate } from "../utils/celebrate.js";

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
  max-width: 600px;
  text-align: center;
  line-height: 1.5;
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

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PawSpinner = styled(motion.div)`
  font-size: 3rem;
  user-select: none;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: #4a3f37;
  font-style: italic;
`;

const RevealWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin-top: 1rem;
`;

const RevealHeadline = styled.h2`
  font-size: 1.3rem;
  color: #1a1614;
  text-align: center;
  margin-bottom: 1rem;
  font-family: 'Poppins', sans-serif;
  line-height: 1.4;
`;

const HighlightCity = styled.span`
  color: #8b6b8e;
  font-weight: 700;
`;

const RevealCard = styled.div`
  background: #ffffffcc;
  padding: 1.5rem;
  border-radius: 1.5rem;
  width: 100%;
  box-shadow: 0 4px 16px rgba(26, 22, 20, 0.18);
  text-align: center;
`;

const RevealImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 1rem;
  object-fit: cover;
  margin-bottom: 1rem;
`;

const RevealTitle = styled.h3`
  font-size: 1.1rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
`;

const RevealQuote = styled.p`
  font-style: italic;
  color: #944f9e;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const RevealCaption = styled.p`
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 1.2rem;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.5rem;
`;

const PrimaryAction = styled(Link)`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #8b6b8e;
  color: white;
  text-decoration: none;
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

const SecondaryAction = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #ffffff;
  color: #1a1614;
  border: 2px solid #8b6b8e;
  border-radius: 16px;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(26, 22, 20, 0.15);
  transition: transform 0.2s ease-in-out, background 0.2s ease;

  &:hover {
    background-color: #ede4d3;
    transform: scale(1.05);
  }
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

// Extract just the city name from an episode title like:
//   "SOLadventure #1 – Athens, obviously 🦉 🇬🇷" → "Athens"
//   "SOLadventure #1 – Αθήνα, προφανώς 🦉 🇬🇷" → "Αθήνα"
function cityFromTitle(title) {
  if (!title) return "";
  const m = title.match(/[–—-]\s+([^,–—\n]+?)(?:[,–—]|\s+\p{Extended_Pictographic}|$)/u);
  return m ? m[1].trim() : title;
}

export default function SolPicks() {
  const { language } = useLanguage();
  const [episodes, setEpisodes] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [phase, setPhase] = useState("intro"); // "intro" | "loading" | "reveal"
  const [currentPick, setCurrentPick] = useState(null);

  // Auto-scroll the reveal card into view when Sol picks an episode, the
  // card is large and lands below the fold on mobile after the loading delay.
  const revealRef = useRef(null);
  useEffect(() => {
    if (phase === "reveal" && revealRef.current) {
      requestAnimationFrame(() => {
        revealRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [phase, currentPick]);

  const t = {
    en: {
      pageTitle: "Travel with Sol – SolTheCat",
      title: "Travel with Sol 🎲",
      subtitle: "Where would Sol travel with you?",
      pickButton: "🐾 Pick our next stop",
      loading: "Sol is checking her map...",
      revealHeadline: (city) => (
        <>🎒 Sol picked <HighlightCity>{city}</HighlightCity> for the two of you!</>
      ),
      viewEpisode: "Read this adventure",
      pickAgain: "🎲 Pick another stop",
      back: "← Back to games",
      loadFail: "Couldn't load episodes. Please try refreshing the page.",
    },
    el: {
      pageTitle: "Ταξίδι με τη Sol – SolTheCat",
      title: "Ταξίδι με τη Sol 🎲",
      subtitle: "Πού θα ταξίδευε η Sol μαζί σου;",
      pickButton: "🐾 Διάλεξε επόμενο σταθμό",
      loading: "Η Sol κοιτάζει τον χάρτη...",
      revealHeadline: (city) => (
        <>🎒 Η Sol διάλεξε την <HighlightCity>{city}</HighlightCity> για τους δυο σας!</>
      ),
      viewEpisode: "Διάβασε την περιπέτεια",
      pickAgain: "🎲 Διάλεξε άλλον σταθμό",
      back: "← Επιστροφή στα παιχνίδια",
      loadFail: "Δεν φόρτωσαν τα επεισόδια. Παρακαλώ δοκίμασε refresh.",
    },
  }[language];

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}episodes.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
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

  const pickRandom = () => {
    if (!episodes.length) return;
    setPhase("loading");
    // 1 second of "Sol is thinking" build-up before reveal.
    setTimeout(() => {
      // Avoid showing the same episode twice in a row when picking again.
      const pool = currentPick
        ? episodes.filter((ep) => ep.id !== currentPick.id)
        : episodes;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setCurrentPick(pick);
      setPhase("reveal");
      celebrate();
    }, 1000);
  };

  const epTitle =
    currentPick && (typeof currentPick.title === "object"
      ? currentPick.title[language]
      : currentPick.title);
  const epCaption =
    currentPick && (typeof currentPick.caption === "object"
      ? currentPick.caption[language]
      : currentPick.caption);
  const epCity = cityFromTitle(epTitle);

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <link rel="canonical" href="https://solthecat.com/games/sol-picks" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title>{t.title}</Title>
        <Subtitle>{t.subtitle}</Subtitle>

        {loadError && <ErrorBox role="alert">{t.loadFail}</ErrorBox>}

        {phase === "intro" && !loadError && (
          <BigButton onClick={pickRandom} disabled={!episodes.length}>
            {t.pickButton}
          </BigButton>
        )}

        {phase === "loading" && (
          <LoadingWrapper>
            <PawSpinner
              animate={{ y: [0, -10, 0], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              🐾
            </PawSpinner>
            <LoadingText>{t.loading}</LoadingText>
          </LoadingWrapper>
        )}

        {phase === "reveal" && currentPick && (
          <RevealWrapper
            ref={revealRef}
            key={currentPick.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RevealHeadline>{t.revealHeadline(epCity)}</RevealHeadline>
            <RevealCard>
              <RevealImage
                src={`${import.meta.env.BASE_URL}${currentPick.image}`}
                alt={epTitle}
                width="800"
                height="800"
                loading="lazy"
                decoding="async"
              />
              <RevealTitle>{epTitle}</RevealTitle>
              {currentPick.quote && <RevealQuote>{currentPick.quote}</RevealQuote>}
              <RevealCaption>{epCaption}</RevealCaption>
              <ButtonRow>
                <PrimaryAction to="/episodes">{t.viewEpisode}</PrimaryAction>
                <SecondaryAction type="button" onClick={pickRandom}>
                  {t.pickAgain}
                </SecondaryAction>
              </ButtonRow>
            </RevealCard>
          </RevealWrapper>
        )}

        <BackLink to="/games">{t.back}</BackLink>
      </PageContainer>
    </>
  );
}
