import { useRef, useState } from "react";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import TitleEm from "../components/TitleEm.jsx";

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

const FormCard = styled.form`
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: var(--sol-cream);
  border-radius: 14px;
  box-shadow:
    0 1px 3px rgba(26, 22, 20, 0.08),
    0 12px 32px -8px rgba(26, 22, 20, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  @media (max-width: 480px) {
    padding: 1.25rem;
    border-radius: 10px;
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-family: 'Inter', system-ui, sans-serif;
`;

const FieldLabel = styled.span`
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  color: var(--sol-ink-soft);
  text-transform: uppercase;
`;

const inputStyles = `
  width: 100%;
  padding: 0.7rem 0.85rem;
  font-family: inherit;
  font-size: 1rem;
  color: var(--sol-ink);
  background: #fff;
  border: 1px solid var(--sol-line);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;

  &::placeholder {
    color: var(--sol-ink-soft);
    opacity: 0.7;
  }

  &:focus {
    border-color: var(--sol-rose);
    box-shadow: 0 0 0 3px rgba(212, 165, 165, 0.25);
  }

  &:disabled {
    background: var(--sol-cream-2);
    color: var(--sol-ink-soft);
    cursor: not-allowed;
  }
`;

const Input = styled.input`${inputStyles}`;
const Textarea = styled.textarea`
  ${inputStyles}
  min-height: 160px;
  resize: vertical;
  line-height: 1.5;
`;

// Honeypot. Bots that auto-fill every input get caught here. Visually hidden
// for sighted users, removed from accessibility tree, and never gets focus.
const Honeypot = styled.div`
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const Submit = styled.button`
  align-self: flex-start;
  padding: 0.8rem 1.6rem;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  color: var(--sol-cream);
  background: var(--sol-ink);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover:not(:disabled) {
    background: #2a221d;
    transform: translateY(-1px);
  }

  &:disabled {
    background: var(--sol-ink-soft);
    cursor: not-allowed;
  }
`;

const StatusMsg = styled.p`
  margin: 0;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  font-size: 0.95rem;
  line-height: 1.4;
  background: ${({ $tone }) =>
    $tone === "success" ? "rgba(180, 200, 160, 0.22)" :
    $tone === "error"   ? "rgba(212, 165, 165, 0.22)" : "transparent"};
  border: 1px solid ${({ $tone }) =>
    $tone === "success" ? "rgba(120, 150, 100, 0.5)" :
    $tone === "error"   ? "var(--sol-rose)" : "transparent"};
  color: var(--sol-ink);
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

const TEXT = {
  en: {
    subtitle: "Sol personally reviews every message you send, or so she claims.",
    name: "Your name",
    namePh: "How shall the queen address you?",
    email: "Your email",
    emailPh: "name@example.com",
    subject: "Subject",
    subjectPh: "What's this about?",
    message: "Message",
    messagePh: "Whisper away, she's listening.",
    send: "Send to Sol",
    sending: "Sending...",
    success: "Message sent. Sol will judge it shortly. Thank you.",
    errorGeneric: "Could not send right now. Please try again, or email info@solthecat.com.",
    directIntro: "Or whisper directly,",
  },
  el: {
    subtitle: "Η Sol λαμβάνει προσωπικά κάθε μήνυμα που της στέλνεις, ή τουλάχιστον έτσι θέλει να πιστεύεις.",
    name: "Όνομα",
    namePh: "Πώς να σε προσφωνήσει η βασίλισσα;",
    email: "Email",
    emailPh: "name@example.com",
    subject: "Θέμα",
    subjectPh: "Σε τι αφορά;",
    message: "Μήνυμα",
    messagePh: "Ψιθύρισέ της, σε ακούει.",
    send: "Αποστολή στη Sol",
    sending: "Αποστολή...",
    success: "Το μήνυμα στάλθηκε. Η Sol θα το αξιολογήσει σύντομα. Ευχαριστούμε.",
    errorGeneric: "Δεν στάλθηκε αυτή τη στιγμή. Δοκίμασε ξανά ή στείλε email στο info@solthecat.com.",
    directIntro: "Ή ψιθύρισέ της απευθείας,",
  },
};

export default function Contact() {
  const { language } = useLanguage();
  const t = TEXT[language];

  // Captured at first render so submissions that complete in < 3s look bot-y.
  const formLoadedAtRef = useRef(Date.now());
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: data.get("name") || "",
      email: data.get("email") || "",
      subject: data.get("subject") || "",
      message: data.get("message") || "",
      _gotcha: data.get("_gotcha") || "",
      elapsedMs: Date.now() - formLoadedAtRef.current,
      language,
    };

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json.error || t.errorGeneric);
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg(t.errorGeneric);
      setStatus("error");
    }
  };

  return (
    <>
      <Helmet>
        <title>{language === "el" ? "Επικοινωνία" : "Contact"} – SolTheCat</title>
        <meta
          name="description"
          content={
            language === "el"
              ? "Επικοινώνησε με τη Sol the Cat, προτάσεις, συνεργασίες, ή απλά για να πεις γεια στη βασίλισσα."
              : "Get in touch with Sol the Cat, suggestions, collaborations, or just say hi to the queen."
          }
        />
        <link rel="canonical" href="https://solthecat.com/contact" />
        <meta property="og:title" content={`${language === "el" ? "Επικοινωνία" : "Contact"} – SolTheCat`} />
        <meta
          property="og:description"
          content={
            language === "el"
              ? "Επικοινώνησε με τη Sol the Cat, προτάσεις, συνεργασίες, ή απλά για να πεις γεια στη βασίλισσα."
              : "Get in touch with Sol the Cat, suggestions, collaborations, or just say hi to the queen."
          }
        />
        <meta property="og:url" content="https://solthecat.com/contact" />
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

        <Subtitle>{t.subtitle}</Subtitle>

        <FormCard onSubmit={onSubmit} noValidate>
          <Field>
            <FieldLabel>{t.name}</FieldLabel>
            <Input
              name="name"
              type="text"
              required
              maxLength={80}
              placeholder={t.namePh}
              autoComplete="name"
              disabled={status === "submitting"}
            />
          </Field>

          <Field>
            <FieldLabel>{t.email}</FieldLabel>
            <Input
              name="email"
              type="email"
              required
              maxLength={120}
              placeholder={t.emailPh}
              autoComplete="email"
              disabled={status === "submitting"}
            />
          </Field>

          <Field>
            <FieldLabel>{t.subject}</FieldLabel>
            <Input
              name="subject"
              type="text"
              required
              maxLength={120}
              placeholder={t.subjectPh}
              disabled={status === "submitting"}
            />
          </Field>

          <Field>
            <FieldLabel>{t.message}</FieldLabel>
            <Textarea
              name="message"
              required
              maxLength={3000}
              rows={6}
              placeholder={t.messagePh}
              disabled={status === "submitting"}
            />
          </Field>

          <Honeypot aria-hidden="true">
            <label>
              Leave this field empty if you are human:
              <input name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </Honeypot>

          <Submit type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? t.sending : t.send}
          </Submit>

          {status === "success" && (
            <StatusMsg $tone="success" role="status">{t.success}</StatusMsg>
          )}
          {status === "error" && (
            <StatusMsg $tone="error" role="alert">{errorMsg || t.errorGeneric}</StatusMsg>
          )}
        </FormCard>

        <DirectContact>
          {t.directIntro}
          <a href="https://www.instagram.com/solthecat01/" target="_blank" rel="noreferrer">@solthecat01</a>
          ·
          <a href="mailto:info@solthecat.com">info@solthecat.com</a>
        </DirectContact>
      </PageContainer>
    </>
  );
}
