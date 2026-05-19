// src/context/LanguageContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';

// Δημιουργούμε το Context με default value 'en'
const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {}
});

export function LanguageProvider({ children }) {
  // Πρώτη επίσκεψη: δοκιμάζουμε το browser language (π.χ. "el-GR" → EL).
  // Επιστρέφοντες χρήστες: η αποθηκευμένη τους επιλογή στο localStorage πάντα νικά,
  // ώστε ένα χειροκίνητο override να επιβιώνει σε επόμενες επισκέψεις ακόμα και αν
  // αλλάξει το browser locale.
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('appLanguage');
    if (saved === 'el' || saved === 'en') return saved;
    const browserLang = (
      (typeof navigator !== 'undefined' &&
        (navigator.language || navigator.userLanguage)) ||
      'en'
    ).toLowerCase();
    return browserLang.startsWith('el') ? 'el' : 'en';
  });

  // Κάθε φορά που αλλάζει το language, το σώζουμε στο localStorage
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook για εύκολη πρόσβαση
export function useLanguage() {
  return useContext(LanguageContext);
}
