// src/styles/GlobalStyle.js

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* reset ή normalize αν θες */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    background: var(--sol-cream);
    color: var(--sol-ink);
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* ό,τι άλλο κοινό styling χρειάζεσαι */
`;

export default GlobalStyle;
