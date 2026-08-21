import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * Hook personnalisé centralisé pour la gestion du Thème (Mode Clair / Sombre) et de la couleur d'accentuation.
 * Permet à tout composant React d'accéder et de modifier l'état du thème de manière homogène.
 */
export function useTheme() {
  const preferences = useSettingsStore((state) => state.preferences);
  const updatePreferences = useSettingsStore((state) => state.updatePreferences);

  const themeMode = preferences?.themeMode || 'dark';
  const accentColor = preferences?.accentColor || 'violet';
  const isLight = themeMode === 'light';

  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
    }
    root.setAttribute('data-accent', accentColor);
  }, [isLight, accentColor]);

  const toggleTheme = () => {
    updatePreferences({ themeMode: isLight ? 'dark' : 'light' });
  };

  const setThemeMode = (mode) => {
    updatePreferences({ themeMode: mode });
  };

  const setAccentColor = (color) => {
    updatePreferences({ accentColor: color });
  };

  return {
    themeMode,
    isLight,
    accentColor,
    toggleTheme,
    setThemeMode,
    setAccentColor,
  };
}

export default useTheme;
