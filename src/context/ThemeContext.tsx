import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type SkinType = 'classic' | 'modern' | 'ocean' | 'sunset' | 'forest';
type ModeType = 'light' | 'dark';

interface ThemeContextType {
  skin: SkinType;
  mode: ModeType;
  setSkin: (skin: SkinType) => void;
  setMode: (mode: ModeType) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_SKIN_KEY = 'theme-skin';
const STORAGE_MODE_KEY = 'theme-mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [skin, setSkinState] = useState<SkinType>(() => {
    const stored = localStorage.getItem(STORAGE_SKIN_KEY);
    const validSkins: SkinType[] = ['classic', 'modern', 'ocean', 'sunset', 'forest'];
    return validSkins.includes(stored as SkinType) ? (stored as SkinType) : 'classic';
  });

  const [mode, setModeState] = useState<ModeType>(() => {
    const stored = localStorage.getItem(STORAGE_MODE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'classic-light', 'classic-dark',
      'modern-light', 'modern-dark',
      'ocean-light', 'ocean-dark',
      'sunset-light', 'sunset-dark',
      'forest-light', 'forest-dark'
    );
    root.classList.add(`${skin}-${mode}`);
  }, [skin, mode]);

  const setSkin = (newSkin: SkinType) => {
    setSkinState(newSkin);
    localStorage.setItem(STORAGE_SKIN_KEY, newSkin);
  };

  const setMode = (newMode: ModeType) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_MODE_KEY, newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ skin, mode, setSkin, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
