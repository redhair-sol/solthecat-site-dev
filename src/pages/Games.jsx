import { Link } from "react-router-dom";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import TitleEm from "../components/TitleEm.jsx";

// ✅ ΙΔΙΟ BUTTON ΠΑΝΤΟΥ
const SolButton = styled(Link)`
  padding: 0.7rem 1.4rem;
  background-color: var(--sol-plum);
  color: var(--sol-cream);
  text-decoration: none;
  border-radius: 999px;
  font-weight: 600;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(26, 22, 20, 0.18);
  transition: background 0.2s ease, transform 0.2s ease;
  margin-top: 1rem;
  align-self: center;

  &:hover {
    background-color: var(--sol-mauve);
    transform: scale(1.03);
  }
`;

const Heading = styled.h1`
  font-family: 'Instrument Serif', serif;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  line-height: 1.05;
  color: var(--sol-ink);
  margin-bottom: 0.5rem;
  font-weight: 400;
`;

const Subheading = styled.p`
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: var(--sol-ink-soft);
  margin-bottom: 2rem;
`;

const GamesGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  /* width:100% required because PageContainer is flex+align-items:center;
     without it, the grid sizes to intrinsic content width and ends up
     visually shifted within the centered container. */
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  grid-template-columns: 1fr;
  margin-bottom: 2rem;

  @media (min-width: 640px) {
    /* 340px threshold ensures 2 columns on tablet portrait (~960px) instead
       of cramped 3-column layout. 3 columns kick in naturally on desktop
       (≥1024px viewport with PageContainer inner width >= ~1040px). */
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  }
`;

const GameCard = styled.div`
  background: var(--sol-cream-2);
  border: 1px solid var(--sol-line);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(26, 22, 20, 0.06);
  text-align: center;
  transition: transform 0.2s ease-in-out;

  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: scale(1.03);
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const GameEmoji = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
`;

const GameTitle = styled.h2`
  font-family: 'Instrument Serif', serif;
  font-size: 1.4rem;
  color: var(--sol-ink);
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const GameDescription = styled.p`
  font-size: 0.95rem;
  color: var(--sol-ink-soft);
  margin-bottom: auto;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

export default function Games() {
  const { language } = useLanguage();

  const content = {
    en: {
      pageTitle: "Sol’s Game Room – SolTheCat",
      metaDescription:
        "12 free Sol the Cat mini-games — quizzes, memory, puzzles, reaction challenges. Climb the leaderboard and beat today's daily challenge.",
      heading: <>Sol’s <TitleEm>Games</TitleEm> 🎮</>,
      subtitle: "Pick your royal challenge",
      playText: "Play",
      games: [
        {
          id: 1,
          emoji: "🐾",
          name: "Pawprints Memory",
          description: "Find matching pawprint pairs!",
          route: "/games/pawprints"
        },
        {
          id: 2,
          emoji: "🧩",
          name: "SOL's Puzzle Map",
          description: "Rebuild the cities Sol has visited!",
          route: "/games/puzzlemap"
        },
        {
          id: 3,
          emoji: "🧩",
          name: "Royal Puzzle",
          description: "Piece together the royal puzzle with Sol!",
          route: "/games/royalpuzzle"
        },
        {
          id: 4,
          emoji: "🧠",
          name: "SOL Quiz",
          description: "Test your knowledge!",
          route: "/games/cityquiz"
        },
        {
          id: 5,
          emoji: "📷",
          name: "SolSnap",
          description: "Snap decision: 3 yes/no questions per episode.",
          route: "/games/solsnap"
        },
        {
          id: 6,
          emoji: "🗺️",
          name: "Sol's Treasure Hunt",
          description: "Find 3 hidden treasures in each city!",
          route: "/games/treasurehunt"
        },
        {
          id: 7,
          emoji: "🎲",
          name: "Travel with Sol",
          description: "Let Sol pick your next stop together",
          route: "/games/sol-picks"
        },
        {
          id: 8,
          emoji: "🔍",
          name: "Spot the City",
          description: "Guess the city from a zoomed-in detail.",
          route: "/games/spotcity"
        },
        {
          id: 9,
          emoji: "🌍",
          name: "Where in the World?",
          description: "Pin Sol on the world map from a photo.",
          route: "/games/mapquiz"
        },
        {
          id: 10,
          emoji: "⚡",
          name: "Quick Paws",
          description: "Tap the cats before they vanish — speed reaction game.",
          route: "/games/quick-paws"
        },
        {
          id: 11,
          emoji: "🏠",
          name: "Cat Sort",
          description: "Sort cats into the nest. Pairs auto-rescue.",
          route: "/games/cat-sort"
        },
        {
          id: 12,
          emoji: "🧺",
          name: "Catch the Cats",
          description: "Catch falling cats with your basket. 3 difficulty levels.",
          route: "/games/catch-cats"
        },
      ],
    },
    el: {
      pageTitle: "Αίθουσα Παιχνιδιών της Sol – SolTheCat",
      metaDescription:
        "12 δωρεάν mini-games της Sol the Cat — quizzes, μνήμη, παζλ, αντανακλαστικά. Σκαρφάλωσε στη βαθμολογία και νίκα τη σημερινή πρόκληση.",
      heading: <>Παιχνίδια της <TitleEm>Sol</TitleEm> 🎮</>,
      subtitle: "Διάλεξε τη βασιλική σου πρόκληση",
      playText: "Παίξε",
      games: [
        {
          id: 1,
          emoji: "🐾",
          name: "Μνήμη με Πατουσάκια",
          description: "Βρες τα ζευγάρια των πατουσακιών!",
          route: "/games/pawprints"
        },
        {
          id: 2,
          emoji: "🧩",
          name: "Παζλ Χάρτης της Sol",
          description: "Συγκέντρωσε πάλι τις πόλεις που επισκέφθηκε η Sol!",
          route: "/games/puzzlemap"
        },
        {
          id: 3,
          emoji: "🧩",
          name: "Βασιλικό Παζλ",
          description: "Συναρμολόγησε το βασιλικό παζλ με τη Sol!",
          route: "/games/royalpuzzle"
        },
        {
          id: 4,
          emoji: "🧠",
          name: "Quiz της Sol",
          description: "Δοκίμασε τις γνώσεις σου!",
          route: "/games/cityquiz"
        },
        {
          id: 5,
          emoji: "📷",
          name: "SolSnap",
          description: "Απόφαση Snap: 3 ναι/όχι ερωτήσεις ανά επεισόδιο.",
          route: "/games/solsnap"
        },
        {
          id: 6,
          emoji: "🗺️",
          name: "Κυνήγι Θησαυρού της Sol",
          description: "Βρες 3 κρυμμένους θησαυρούς σε κάθε πόλη!",
          route: "/games/treasurehunt"
        },
        {
          id: 7,
          emoji: "🎲",
          name: "Ταξίδι με τη Sol",
          description: "Άσε τη Sol να διαλέξει τον επόμενο σας σταθμό",
          route: "/games/sol-picks"
        },
        {
          id: 8,
          emoji: "🔍",
          name: "Βρες την Πόλη",
          description: "Μάντεψε την πόλη από ένα μεγεθυσμένο κομμάτι.",
          route: "/games/spotcity"
        },
        {
          id: 9,
          emoji: "🌍",
          name: "Πού στον Κόσμο;",
          description: "Σημείωσε τη Sol στον παγκόσμιο χάρτη από μια φωτογραφία.",
          route: "/games/mapquiz"
        },
        {
          id: 10,
          emoji: "⚡",
          name: "Γρήγορες Πατούσες",
          description: "Πάτα τις γάτες πριν εξαφανιστούν — παιχνίδι αντανακλαστικών.",
          route: "/games/quick-paws"
        },
        {
          id: 11,
          emoji: "🏠",
          name: "Ταξινόμηση Γατών",
          description: "Στείλε τις γάτες στη φωλιά. Τα ζευγάρια εξαφανίζονται αυτόματα.",
          route: "/games/cat-sort"
        },
        {
          id: 12,
          emoji: "🧺",
          name: "Πιάσε τις Γάτες",
          description: "Πιάσε τις γάτες που πέφτουν με το καλάθι. 3 επίπεδα δυσκολίας.",
          route: "/games/catch-cats"
        },
      ],
    },
  };

  const t = content[language];

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <link rel="canonical" href="https://solthecat.com/games" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Heading>{t.heading}</Heading>
        <Subheading>{t.subtitle}</Subheading>

        <GamesGrid>
          {t.games.map((game) => (
            <GameCard key={game.id}>
              <CardContent>
                <GameEmoji>{game.emoji}</GameEmoji>
                <GameTitle>{game.name}</GameTitle>
                <GameDescription>{game.description}</GameDescription>
              </CardContent>
              <SolButton to={game.route}>{t.playText}</SolButton>
            </GameCard>
          ))}
        </GamesGrid>
      </PageContainer>
    </>
  );
}
