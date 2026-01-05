import { createContext, useContext, useState, useEffect } from 'react';
import { getTheme } from '../themes/themes';
import { useTreeStore } from '../store/treeStore';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { tree, setTree } = useTreeStore();
  const [currentTheme, setCurrentTheme] = useState(() => getTheme(tree.theme || 'classic'));

  // Update theme when tree theme changes
  useEffect(() => {
    const theme = getTheme(tree.theme || 'classic');
    setCurrentTheme(theme);
    applyTheme(theme);
  }, [tree.theme]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg-primary', theme.colors.bgPrimary);
    root.style.setProperty('--color-bg-secondary', theme.colors.bgSecondary);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--texture-opacity', theme.background.opacity || 0.03);
  };

  const changeTheme = (themeId) => {
    const theme = getTheme(themeId);
    setCurrentTheme(theme);
    applyTheme(theme);
    
    // Update tree theme
    const updatedTree = {
      ...tree,
      theme: themeId,
      updatedAt: new Date().toISOString(),
    };
    setTree(updatedTree);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        changeTheme,
        getTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

