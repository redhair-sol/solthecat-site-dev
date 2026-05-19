// src/context/LanguageContext.jsx

import React, { createContext, useState, useContext } from 'react';

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
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('appLanguage');
    if (saved === 'el' || saved === 'en') return saved;
    const browserLang = (
      (typeof navigator !== 'undefined' &&
        (navigator.language || navigator.userLanguage)) ||
      'en'
    ).toLowerCase();
    return browserLang.startsWith('el') ? 'el' : 'en';
  });

  // Persist μόνο όταν ο χρήστης αλλάζει γλώσσα ρητά μέσω toggle.
  // Παλιότερα το κάναμε σε useEffect που έτρεχε ακόμα και στο mount, και
  // έγραφε το auto-detected default στο localStorage σαν να ήταν "ρητή
  // επιλογή". Αποτέλεσμα: η detection δεν ξανατρέχει ποτέ σε επόμενη
  // επίσκεψη επειδή υπάρχει ήδη "saved" value. Με αυτή την προσέγγιση το
  // saved value σημαίνει πραγματικά "ο χρήστης πάτησε toggle".
  const setLanguage = (newLang) => {
    if (newLang !== 'el' && newLang !== 'en') return;
    try {
      localStorage.setItem('appLanguage', newLang);
    } catch {
      // localStorage μπλοκαρισμένο (private mode quirks) — δεν θεωρούμε σφάλμα
    }
    setLanguageState(newLang);
  };

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
