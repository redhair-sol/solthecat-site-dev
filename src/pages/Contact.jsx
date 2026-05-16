import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import TitleEm from "../components/TitleEm.jsx";
import { CONTACT_FORM_URL } from "../config.js";

const Heading = styled.h1`
  font-family: 'Instrument Serif', serif;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  line-height: 1.05;
  color: var(--sol-ink);
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: var(--sol-ink-soft);
  margin-bottom: 2.5rem;
  text-align: center;
`;

const FormFrame = styled.div`
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: 10px;
  background: var(--sol-cream);
  border-radius: 14px;
  box-shadow:
    0 1px 3px rgba(26, 22, 20, 0.08),
    0 12px 32px -8px rgba(26, 22, 20, 0.18);

  iframe {
    width: 100%;
    height: 1400px;
    border: none;
    border-radius: 8px;
    display: block;
    background: #fff;
  }

  @media (max-width: 480px) {
    padding: 6px;
    border-radius: 10px;
    iframe { height: 1600px; }
  }
`;

const DirectContact = styled.div`
  max-width: 640px;
  margin: 2.5rem auto 0;
  text-align: center;
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 1rem;
  color: var(--sol-ink-soft);

  a {
    color: var(--sol-ink);
    text-decoration: none;
    border-bottom: 1px solid var(--sol-line);
    margin: 0 0.4rem;
    transition: border-color 0.2s, color 0.2s;
  }
  a:hover {
    color: var(--sol-rose);
    border-color: var(--sol-rose);
  }
`;

export default function Contact() {
  const { language } = useLanguage();

  const subtitles = {
    en: "Sol personally reviews every message you send, or so she claims.",
    el: "Η Sol λαμβάνει προσωπικά κάθε μήνυμα που της στέλνεις, ή τουλάχιστον έτσι θέλει να πιστεύεις.",
  };

  const directIntro = {
    en: "Or whisper directly,",
    el: "Ή ψιθύρισέ της απευθείας,",
  };

  const forms = CONTACT_FORM_URL;

  return (
    <>
      <Helmet>
        <title>{language === "el" ? "Επικοινωνία" : "Contact"} – SolTheCat</title>
        <meta
          name="description"
          content={
            language === "el"
              ? "Επικοινώνησε με τη Sol the Cat — προτάσεις, συνεργασίες, ή απλά για να πεις γεια στη βασίλισσα."
              : "Get in touch with Sol the Cat — suggestions, collaborations, or just say hi to the queen."
          }
        />
        <link rel="canonical" href="https://solthecat.com/contact" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Heading>
          {language === "el"
            ? <>Επικοινώνησε με τη <TitleEm>Sol</TitleEm></>
            : <>Contact <TitleEm>Sol</TitleEm> the Cat</>}
        </Heading>

        <Subtitle>{subtitles[language]}</Subtitle>

        <FormFrame>
          <iframe
            src={forms[language]}
            title={language === "en" ? "Contact Form" : "Φόρμα Επικοινωνίας"}
            loading="lazy"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
          >
            {language === "en" ? "Contact form" : "Φόρμα επικοινωνίας"}
          </iframe>
        </FormFrame>

        <DirectContact>
          {directIntro[language]}
          <a href="https://www.instagram.com/solthecat01/" target="_blank" rel="noreferrer">@solthecat01</a>
          ·
          <a href="mailto:info@solthecat.com">info@solthecat.com</a>
        </DirectContact>
      </PageContainer>
    </>
  );
}
