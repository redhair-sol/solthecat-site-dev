// src/pages/Shop.jsx

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import PageContainer from "../components/PageContainer.jsx";
import { upperLocal } from "../utils/greekUpper.js";

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
  font-family: 'Poppins', sans-serif;
`;

const ProductGrid = styled.div`
  display: grid;
  gap: 2rem;
  /* width:100% required because PageContainer is flex+align-items:center;
     without it, the grid sizes to intrinsic content width and ends up
     visually shifted within the centered container. */
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    /* 340px threshold ensures 2 columns on tablet portrait (~960px) instead
       of cramped 3-column layout. 3 columns kick in on desktop (≥1024px). */
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  }
`;

const ProductCard = styled.div`
  background: #ffffffee;
  border-radius: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 20px rgba(26, 22, 20, 0.18);
  }
`;

const ImageFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: ${({ $dim }) => ($dim ? "saturate(0.85)" : "none")};
  transition: filter 0.3s ease;
`;

const RibbonCorner = styled.span`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: #8b6b8e;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 2px 6px rgba(26, 22, 20, 0.3);
`;

const FlavorPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #ede4d3;
  color: #4a3f37;
  font-size: 0.8rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  margin-bottom: 0.5rem;
  font-family: 'Poppins', sans-serif;
`;

const ProductName = styled.h2`
  font-size: 1.25rem;
  color: #1a1614;
  margin-bottom: 0.5rem;
  font-family: 'Poppins', sans-serif;
`;

const ProductDescription = styled.p`
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const StatusLabel = styled.span`
  display: inline-block;
  padding: 0.3rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 999px;
  background-color: ${(props) =>
    props.status === "coming_soon"
      ? "#d4a5a5"
      : props.status === "available"
      ? "#c8e6c9"
      : "#ef9a9a"};
  color: ${(props) =>
    props.status === "coming_soon"
      ? "#1a1614"
      : props.status === "available"
      ? "#2e7d32"
      : "#c62828"};
  align-self: center;
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

// Map flavor (keyed by EN value) to a friendly emoji.
const FLAVOR_EMOJI = {
  Chicken: "🐔",
  Fish: "🐟",
  Vegetables: "🥕",
};

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const { language } = useLanguage();

  const t = {
    en: {
      pageTitle: "SOLicious Delights – SolTheCat",
      metaDescription:
        "Sol the Cat's shop — SOLicious treats and royal goodies inspired by her travels. Coming soon.",
      heading: "Sol’s Shop 🛍️",
      subtitle: "Every feline deserves treats",
      ribbon: "Soon",
      status: {
        coming_soon: "Coming Soon",
        available: "Available",
        sold_out: "Sold Out",
      },
      loadFail: "Couldn't load products. Please try refreshing the page.",
    },
    el: {
      pageTitle: "Επιλογές SOL – SolTheCat",
      metaDescription:
        "Το κατάστημα της Sol the Cat — SOLicious λιχουδιές και βασιλικά treats εμπνευσμένα από τα ταξίδια της. Έρχεται σύντομα.",
      heading: "Το Κατάστημα της Sol 🛍️",
      subtitle: "Κάθε γάτα αξίζει λιχουδιές",
      ribbon: "Σύντομα",
      status: {
        coming_soon: "Σύντομα διαθέσιμο",
        available: "Διαθέσιμο",
        sold_out: "Εξαντλήθηκε",
      },
      loadFail: "Δεν φόρτωσαν τα προϊόντα. Παρακαλώ δοκίμασε refresh.",
    },
  }[language];

  useEffect(() => {
    fetch("/data/products.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoadError(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setLoadError(true);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>{t.pageTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <link rel="canonical" href="https://solthecat.com/shop" />
      </Helmet>

      <PageContainer
        alignTop
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Heading>{t.heading}</Heading>
        <Subtitle>{t.subtitle}</Subtitle>

        {loadError && <ErrorBox role="alert">{t.loadFail}</ErrorBox>}

        <ProductGrid>
          {products.map((product) => {
            const name = language === "en" ? product.nameEN : product.nameGR;
            const flavor =
              language === "en" ? product.flavor.en : product.flavor.gr;
            const description =
              language === "en"
                ? product.description.en
                : product.description.gr;
            const isComingSoon = product.status === "coming_soon";
            const emoji = FLAVOR_EMOJI[product.flavor.en] || "🍽️";

            return (
              <ProductCard key={product.id}>
                <ImageFrame>
                  <ProductImage
                    src={product.image}
                    alt={name}
                    width="1122"
                    height="1402"
                    loading="lazy"
                    decoding="async"
                    $dim={isComingSoon}
                  />
                  {isComingSoon && <RibbonCorner>{upperLocal(t.ribbon)}</RibbonCorner>}
                </ImageFrame>
                <FlavorPill>
                  <span aria-hidden="true">{emoji}</span> {flavor}
                </FlavorPill>
                <ProductName>{name}</ProductName>
                <ProductDescription>{description}</ProductDescription>
                <StatusLabel status={product.status}>
                  {t.status[product.status]}
                </StatusLabel>
              </ProductCard>
            );
          })}
        </ProductGrid>
      </PageContainer>
    </>
  );
}
