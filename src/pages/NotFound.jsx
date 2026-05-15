import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function NotFound() {
  const { language } = useLanguage();

  const t = {
    en: {
      message: "This corner of the world hasn’t been explored yet — not even by Sol.",
      back: "Back to safety",
    },
    el: {
      message: "Αυτή η γωνιά του κόσμου δεν έχει εξερευνηθεί ακόμη — ούτε από τη Sol.",
      back: "Επιστροφή στην ασφάλεια",
    },
  }[language];

  return (
    <>
      <Helmet>
        <title>404 – SolTheCat</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div
        className="w-full min-h-screen relative bg-[#ede4d3]"
        style={{
          backgroundImage: "url('/images/404.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-[#ede4d3]/60 z-0"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 min-h-screen">
          <h1
            className="text-[clamp(6rem,18vw,11rem)] leading-none text-[var(--sol-ink)]/70 mb-6"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            4 <em className="not-italic" style={{ fontStyle: "italic", color: "var(--sol-sun)" }}>0</em> 4
          </h1>
          <p
            className="text-2xl max-w-3xl text-[var(--sol-ink-soft)] leading-relaxed mb-8 italic"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {t.message}
          </p>

          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[var(--sol-plum)] text-[var(--sol-cream)] font-medium rounded-full shadow-md hover:bg-[var(--sol-mauve)] transition"
          >
            {t.back}
          </Link>
        </div>
      </div>
    </>
  );
}
