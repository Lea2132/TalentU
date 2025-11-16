import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('blue');

  useEffect(() => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'blue';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName) => {
    const root = document.documentElement;
    const themeColors = {
      blue: {
        primary: '#2563eb',
        secondary: '#1e40af',
        light: '#dbeafe',
      },
      green: {
        primary: '#16a34a',
        secondary: '#15803d',
        light: '#dcfce7',
      }
    };

    const colors = themeColors[themeName];
    if (colors) {
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-secondary', colors.secondary);
      root.style.setProperty('--color-light', colors.light);
      // Color to use for text/icons when placed on primary backgrounds
      root.style.setProperty('--color-on-primary', colors.onPrimary || '#ffffff');
      root.setAttribute('data-theme', themeName);
      document.body.setAttribute('data-theme', themeName);
    }
  };

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    applyTheme(selectedTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};
