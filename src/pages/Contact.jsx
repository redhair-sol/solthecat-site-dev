import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { CONTACT_FORM_URL } from "../config.js";

const Heading = styled.h1`
  font-size: 2rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
  font-family: 'Poppins', sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #4a3f37;
  margin-bottom: 2rem;
  text-align: center;
`;

const IframeWrapper = styled.div`
  width: 100%;
  height: 800px;
  border: none;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  @media (max-width: 480px) {
    height: 900px;
  }
`;

const LanguageToggle = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const ToggleButton = styled.button`
  padding: 0.3rem 0.8rem;
  border: 1px solid #ccc;
  background-color: ${({ $active }) => ($active ? '#d4a5a5' : '#fff')};
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
`;

export default function Contact() {
  const { language, setLanguage } = useLanguage();

  const subtitles = {
    en: "Sol personally reviews every message you send – or so she claims.",
    el: "Η Sol λαμβάνει προσωπικά κάθε μήνυμα που της στέλνεις – ή τουλάχιστον έτσι θέλει να πιστεύεις.",
  };

  const forms = CONTACT_FORM_URL;

  return (
    <>
      <Helmet>
        <title>
          {language === "el" ? "Επικοινωνία" : "Contact"} – SolTheCat
        </title>
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
        {language === "el" ? "Επικοινώνησε με τη Sol 📬" : "Contact Sol the Cat 📬"}
      </Heading>

      <LanguageToggle>
        <ToggleButton onClick={() => setLanguage("en")} $active={language === "en"}>
          🇬🇧 English
        </ToggleButton>
        <ToggleButton onClick={() => setLanguage("el")} $active={language === "el"}>
          🇬🇷 Ελληνικά
        </ToggleButton>
      </LanguageToggle>

      <Subtitle>{subtitles[language]}</Subtitle>

      <IframeWrapper>
        <iframe
          src={forms[language]}
          title={language === "en" ? "Contact Form" : "Φόρμα Επικοινωνίας"}
          loading="lazy"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
        >
          {language === "en" ? "Contact form" : "Φόρμα επικοινωνίας"}
        </iframe>
      </IframeWrapper>
    </PageContainer>
    </>
  );
}
