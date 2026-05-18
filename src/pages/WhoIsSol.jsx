// src/pages/WhoIsSol.jsx

import React from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import TitleEm from "../components/TitleEm.jsx";
import styled from "styled-components";

const Title = styled.h1`
  font-family: 'Instrument Serif', serif;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  line-height: 1.05;
  color: var(--sol-ink);
  margin-bottom: 0.5rem;
  font-weight: 400;
`;

const Subtitle = styled.p`
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: var(--sol-ink-soft);
  margin-bottom: 2rem;
`;

// Hero portrait at the top of the page. 16:10 landscape source; stays in
// proportion across breakpoints. Rounded corners + soft ink shadow tie it
// to the editorial system without competing with the wordmark above.
const HeroPhoto = styled.img`
  display: block;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 2.5rem;
  border-radius: 16px;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  box-shadow: 0 8px 30px -10px rgba(26, 22, 20, 0.18);
`;

const IntroText = styled.p`
  font-size: 1rem;
  color: var(--sol-ink-soft);
  margin: 0 auto 1.5rem;
  line-height: 1.6;
  max-width: 720px;
  text-align: left;

  @media (max-width: 600px) {
    text-align: justify;
  }
`;

const SectionHeading = styled.h2`
  font-family: 'Instrument Serif', serif;
  font-size: clamp(1.7rem, 3.5vw, 2.3rem);
  color: var(--sol-ink);
  font-weight: 500;
  margin: 3rem 0 1.5rem;
  text-align: center;
`;

// 2-column "photo + paragraph" block. Stacks on tablet portrait via the
// same 1023 breakpoint we use elsewhere for hero/footer.
const InlineBlock = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 3rem;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto 3rem;
  text-align: left;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 560px;
  }
`;

const InlinePhoto = styled.img`
  display: block;
  width: 100%;
  border-radius: 12px;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  box-shadow: 0 4px 18px -6px rgba(26, 22, 20, 0.18);
`;

const InlineParagraph = styled.p`
  font-size: 1.02rem;
  color: var(--sol-ink-soft);
  line-height: 1.7;
  margin: 0 0 1rem;
  &:last-child { margin-bottom: 0; }
`;

const FunFactsTitle = styled.h2`
  font-family: 'Instrument Serif', serif;
  font-size: 1.9rem;
  color: var(--sol-ink);
  font-weight: 500;
  margin: 3rem 0 1rem;
  text-align: center;
`;

// 3 candids that act as a visual breath between the Life in Athens block
// and the Fun Facts list. Frame matches the Gallery Tile exactly (same
// cream padding + ink shadow + 4px / 2px radii) so the two pages read as
// one collection.
const PolaroidGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 1rem auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
    max-width: 360px;
  }
`;

const Polaroid = styled.figure`
  margin: 0;
  background: var(--sol-cream);
  padding: 8px 8px 10px;
  border-radius: 4px;
  box-shadow:
    0 1px 2px rgba(26, 22, 20, 0.08),
    0 8px 20px -8px rgba(26, 22, 20, 0.18);
`;

const PolaroidImg = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 2px;
`;

const FunFactsList = styled.ul`
  list-style: disc;
  padding-left: 1.5rem;
  text-align: left;
  color: var(--sol-ink);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 720px;
  margin: 0 auto;
`;

const FunFactItem = styled.li`
  margin-bottom: 0.5rem;

  strong {
    color: var(--sol-ink);
    font-weight: 600;
  }
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: var(--sol-ink-soft);
  margin: 2rem auto 0;
  max-width: 720px;
`;

const ContactLink = styled.a`
  color: var(--sol-mauve);
  text-decoration: underline;
  text-decoration-color: var(--sol-line);
  text-underline-offset: 3px;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
  &:hover {
    color: var(--sol-ink);
    text-decoration-color: var(--sol-rose);
  }
`;

export default function WhoIsSol() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: <>Sol’s <TitleEm>Story</TitleEm></>,
      subtitle: "The tale behind the stare",
      intro1: [
        "Sol, known online as solthecat, wasn’t born to go unnoticed. She has the stillness that speaks louder than words, the grace of a queen without a crown, and the step of a cat who knows everything belongs to her. She’s the soul of SOLadventures, a storyteller with paws full of tales, wandering from Athens' marble to the pages of imagination… and then, to Instagram.",
        "What makes her hers is the stare. A long, patient look that decides whether you are worth the second glance. She is suspicious of grand gestures and unimpressed by gifts that cost more than a sunbeam. She trusts slowly, judges quickly, and forgives only her dad, who has been her favorite human since the first time he let her sleep on his keyboard. Everything you read on this site, every reel, every adventure, begins with that look.",
      ],
      lifeInAthens: <>Life in <TitleEm>Athens</TitleEm></>,
      intro2: [
        "She was raised in Athens, on a balcony that smelled of basil and warm marble. The city taught her early. Sun is currency, and the best one is the one you don’t share. She learned the geography of her neighborhood by ear: the gate that creaks at six, the moped that rounds the corner at noon, the cat across the road who is, frankly, no competition.",
        "Somewhere between the Parthenon and her first reel, the world got bigger. The windows of the apartment stopped being enough. She started traveling, first in her dad’s lap, then in his stories, then on her own terms. Athens stayed her ground. The rest became her stage. Quietly, queenly, on her own schedule, she became Sol.",
      ],
      funFactsTitle: "✨ Fun Facts About Sol",
      funFacts: [
        { label: "Favorite food:", value: "Cooked chicken. With attitude." },
        { label: "Treat of choice:", value: "Tuna mousse. She sniffs. She approves." },
        { label: "Nap spots:", value: "Sunny patches, velvet chairs, your keyboard." },
        { label: "Morning routine:", value: "One dramatic stretch. Three slow blinks." },
        { label: "Hobbies:", value: "Judging humans, starring in reels, ignoring expensive toys." },
        { label: "Dislikes:", value: `Loud noises, closed doors and the "no" word.` },
        { label: "Secret talent:", value: "Looking royal even mid-yawn." },
        { label: "Zodiac sign:", value: "Virgo ♍." },
        { label: "Favorite human:", value: "Her dad (obviously)." },
      ],
      footer: "Yes, she has staff. You’re one of them now. 🐾",
      contact: "For press or collaborations: ",
      heroAlt: "Sol the cat, editorial portrait",
      portraitAlt: "Sol at home in Athens",
      polaroidAlts: [
        "Candid moment with Sol",
        "Sol in a quiet pose",
        "Sol with her signature stare",
      ],
    },
    el: {
      title: <>Η Ιστορία της <TitleEm>Sol</TitleEm></>,
      subtitle: "Η ιστορία πίσω από το βλέμμα",
      intro1: [
        "Η Sol, γνωστή στο διαδίκτυο ως solthecat, δεν γεννήθηκε για να περάσει απαρατήρητη. Έχει το βλέμμα της σιωπής που σε καθηλώνει, τη χάρη μιας βασίλισσας που δε χρειάζεται στέμμα και το βήμα μιας γάτας που ξέρει πως όλα της ανήκουν. Είναι η ψυχή των SOLadventures, μια αφηγήτρια με πατούσες γεμάτες ιστορίες, που περιπλανιούνται από τα μάρμαρα της Αθήνας ώς τις σελίδες της φαντασίας… κι από εκεί, στο Instagram.",
        "Αυτό που την κάνει εκείνη είναι το βλέμμα. Μια μακριά, υπομονετική ματιά που αποφασίζει αν αξίζεις τη δεύτερη. Δυσπιστεί στις μεγάλες χειρονομίες και αδιαφορεί για δώρα που κοστίζουν περισσότερο από μια λωρίδα ηλιαχτίδας. Εμπιστεύεται αργά, κρίνει γρήγορα, και συγχωρεί μόνο τον μπαμπά της, τον αγαπημένο της άνθρωπο από την πρώτη φορά που την άφησε να κοιμηθεί πάνω στο πληκτρολόγιο. Κάθε ιστορία εδώ μέσα, κάθε reel, κάθε περιπέτεια, ξεκινάει από εκείνη τη ματιά.",
      ],
      lifeInAthens: <>Ζωή στην <TitleEm>Αθήνα</TitleEm></>,
      intro2: [
        "Μεγάλωσε στην Αθήνα, σε ένα μπαλκόνι που μύριζε βασιλικό και ζεστό μάρμαρο. Η πόλη της έμαθε νωρίς δύο πράγματα. Ο ήλιος είναι νόμισμα, και ο καλύτερος είναι αυτός που δεν μοιράζεσαι. Έμαθε τη γεωγραφία της γειτονιάς της ακούγοντας: την πόρτα που τρίζει στις έξι, το μηχανάκι που στρίβει τη γωνία το μεσημέρι, τη γάτα απέναντι που, ειλικρινά, δεν αποτελεί ανταγωνισμό.",
        "Κάπου ανάμεσα στον Παρθενώνα και το πρώτο της reel, ο κόσμος μεγάλωσε. Τα παράθυρα του διαμερίσματος έπαψαν να της φτάνουν. Άρχισε να ταξιδεύει, πρώτα στην αγκαλιά του μπαμπά της, μετά στις ιστορίες του, μετά με τους δικούς της όρους. Η Αθήνα παρέμεινε το έδαφός της. Ο υπόλοιπος κόσμος έγινε η σκηνή της. Αθόρυβα, βασιλικά, με το δικό της ωράριο, έγινε Sol.",
      ],
      funFactsTitle: "✨ Μικρά Μυστικά της Sol",
      funFacts: [
        { label: "Αγαπημένο φαγητό:", value: "Ψητό κοτόπουλο. Με ύφος." },
        { label: "Λιχουδιά:", value: "Μους τόνου. Την μυρίζει. Την εγκρίνει." },
        { label: "Μέρη για ύπνο:", value: "Ηλιόλουστα σημεία, βελούδινες καρέκλες, το πληκτρολόγιό σου." },
        { label: "Πρωινή ρουτίνα:", value: "Ένα δραματικό τέντωμα. Τρία αργά ανοιγοκλεισίματα ματιών." },
        { label: "Χόμπι:", value: "Να κρίνει ανθρώπους, να πρωταγωνιστεί σε reels, να αγνοεί ακριβά παιχνίδια." },
        { label: "Αντιπάθειες:", value: `Οι φασαρίες, οι κλειστές πόρτες και το "όχι".` },
        { label: "Κρυφό ταλέντο:", value: "Να δείχνει βασιλική ακόμη και με χασμουρητό." },
        { label: "Ζώδιο:", value: "Παρθένος ♍." },
        { label: "Αγαπημένος άνθρωπος:", value: "Ο μπαμπάς της (προφανώς)." },
      ],
      footer: "Ναι, έχει προσωπικό. Τώρα είσαι κι εσύ μέλος. 🐾",
      contact: "Για συνεργασίες ή δημοσιογραφική επικοινωνία: ",
      heroAlt: "Η Sol, editorial πορτρέτο",
      portraitAlt: "Η Sol στο σπίτι στην Αθήνα",
      polaroidAlts: [
        "Στιγμή με τη Sol",
        "Η Sol σε ήρεμη πόζα",
        "Η Sol με το χαρακτηριστικό της βλέμμα",
      ],
    },
  };

  const t = content[language];

  return (
    <>
      <Helmet>
        <title>
          {language === "en"
            ? "Who is Sol the Cat? – SolTheCat"
            : "Ποια είναι η Sol; – SolTheCat"}
        </title>
        <meta
          name="description"
          content={
            language === "en"
              ? "Meet Sol the Cat, the calico feline queen behind 50+ SOLadventures around the world. Her story, her stare, her travels."
              : "Γνώρισε τη Sol the Cat, τη βασίλισσα γάτα πίσω από 50+ SOLadventures σε όλο τον κόσμο. Η ιστορία της, το βλέμμα της, τα ταξίδια της."
          }
        />
        <link rel="canonical" href="https://solthecat.com/whoissol" />
        <meta
          property="og:title"
          content={
            language === "en"
              ? "Who is Sol the Cat? – SolTheCat"
              : "Ποια είναι η Sol; – SolTheCat"
          }
        />
        <meta
          property="og:description"
          content={
            language === "en"
              ? "Meet Sol the Cat, the calico feline queen behind 50+ SOLadventures around the world. Her story, her stare, her travels."
              : "Γνώρισε τη Sol the Cat, τη βασίλισσα γάτα πίσω από 50+ SOLadventures σε όλο τον κόσμο. Η ιστορία της, το βλέμμα της, τα ταξίδια της."
          }
        />
        <meta property="og:url" content="https://solthecat.com/whoissol" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Title>{t.title}</Title>
        <Subtitle>{t.subtitle}</Subtitle>

        <HeroPhoto
          src="/images/about/hero.webp"
          alt={t.heroAlt}
          width="1586"
          height="992"
          loading="eager"
          decoding="async"
        />

        {t.intro1.map((para, i) => (
          <IntroText key={i}>{para}</IntroText>
        ))}

        <SectionHeading>{t.lifeInAthens}</SectionHeading>
        <InlineBlock>
          <InlinePhoto
            src="/images/about/portrait.webp"
            alt={t.portraitAlt}
            width="1122"
            height="1402"
            loading="lazy"
            decoding="async"
          />
          <div>
            {t.intro2.map((para, i) => (
              <InlineParagraph key={i}>{para}</InlineParagraph>
            ))}
          </div>
        </InlineBlock>

        <PolaroidGrid>
          {[1, 2, 3].map((n, i) => (
            <Polaroid key={n}>
              <PolaroidImg
                src={`/images/about/square0${n}.webp`}
                alt={t.polaroidAlts[i]}
                width="1254"
                height="1254"
                loading="lazy"
                decoding="async"
              />
            </Polaroid>
          ))}
        </PolaroidGrid>

        <FunFactsTitle>{t.funFactsTitle}</FunFactsTitle>

        <FunFactsList>
          {t.funFacts.map((fact, idx) => (
            <FunFactItem key={idx}>
              <strong>{fact.label}</strong> {fact.value}
            </FunFactItem>
          ))}
        </FunFactsList>

        <FooterText>{t.footer}</FooterText>
        <FooterText>
          {t.contact}
          <ContactLink href="mailto:info@solthecat.com">
            info@solthecat.com
          </ContactLink>
        </FooterText>
      </PageContainer>
    </>
  );
}
