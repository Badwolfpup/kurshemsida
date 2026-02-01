import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type LanguageType = 'sv' | 'en';

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'app-language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    const stored = localStorage.getItem(STORAGE_LANG_KEY);
    return stored === 'en' ? 'en' : 'sv';
  });

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
