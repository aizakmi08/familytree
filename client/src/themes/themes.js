// Theme definitions

export const themes = {
  classic: {
    id: 'classic',
    name: 'Classic',
    category: 'free',
    colors: {
      bgPrimary: '#fef9f6',
      bgSecondary: '#ffffff',
      textPrimary: '#2d2d2d',
      textSecondary: '#6b6b6b',
      accent: '#ed5632',
      border: '#e5e5e5',
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'DM Sans',
    },
    nodeStyle: {
      borderRadius: '12px',
      borderWidth: '2px',
      shadow: 'md',
    },
    background: {
      type: 'texture',
      opacity: 0.03,
    },
  },

  cozy: {
    id: 'cozy',
    name: 'Cozy',
    category: 'free',
    colors: {
      bgPrimary: '#f5ede4',
      bgSecondary: '#faf7f2',
      textPrimary: '#3d2817',
      textSecondary: '#6b5d4a',
      accent: '#c97d60',
      border: '#d4c4b0',
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'DM Sans',
    },
    nodeStyle: {
      borderRadius: '16px',
      borderWidth: '2px',
      shadow: 'lg',
    },
    background: {
      type: 'texture',
      opacity: 0.05,
      pattern: 'paper',
    },
  },

  modern: {
    id: 'modern',
    name: 'Modern',
    category: 'free',
    colors: {
      bgPrimary: '#f8f9fa',
      bgSecondary: '#ffffff',
      textPrimary: '#1a1a1a',
      textSecondary: '#6c757d',
      accent: '#0d6efd',
      border: '#dee2e6',
    },
    fonts: {
      heading: 'DM Sans',
      body: 'DM Sans',
    },
    nodeStyle: {
      borderRadius: '8px',
      borderWidth: '1px',
      shadow: 'sm',
    },
    background: {
      type: 'solid',
      opacity: 1,
    },
  },

  nature: {
    id: 'nature',
    name: 'Nature',
    category: 'free',
    colors: {
      bgPrimary: '#f0f7f4',
      bgSecondary: '#ffffff',
      textPrimary: '#1a3d2e',
      textSecondary: '#5a7a6a',
      accent: '#2d8659',
      border: '#c8ddd4',
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'DM Sans',
    },
    nodeStyle: {
      borderRadius: '20px',
      borderWidth: '2px',
      shadow: 'md',
    },
    background: {
      type: 'texture',
      opacity: 0.04,
      pattern: 'leaves',
    },
  },

  gameOfThrones: {
    id: 'gameOfThrones',
    name: 'Game of Thrones',
    category: 'premium',
    price: 4.99,
    colors: {
      bgPrimary: '#f4e8d0',
      bgSecondary: '#faf5e8',
      textPrimary: '#2c1810',
      textSecondary: '#6b5a4a',
      accent: '#8b4513',
      border: '#d4c4a8',
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'Crimson Pro',
    },
    nodeStyle: {
      borderRadius: '8px',
      borderWidth: '3px',
      shadow: 'xl',
      borderStyle: 'medieval',
    },
    background: {
      type: 'texture',
      opacity: 0.08,
      pattern: 'parchment',
    },
  },

  simpsons: {
    id: 'simpsons',
    name: 'The Simpsons',
    category: 'premium',
    price: 4.99,
    colors: {
      bgPrimary: '#fff8dc',
      bgSecondary: '#ffffe0',
      textPrimary: '#1a1a1a',
      textSecondary: '#4a4a4a',
      accent: '#ffd700',
      border: '#ffed4e',
    },
    fonts: {
      heading: 'Comic Sans MS',
      body: 'Comic Sans MS',
    },
    nodeStyle: {
      borderRadius: '20px',
      borderWidth: '4px',
      shadow: 'lg',
      borderStyle: 'cartoon',
    },
    background: {
      type: 'texture',
      opacity: 0.05,
      pattern: 'springfield',
    },
  },

  harryPotter: {
    id: 'harryPotter',
    name: 'Harry Potter',
    category: 'premium',
    price: 4.99,
    colors: {
      bgPrimary: '#f5f0e8',
      bgSecondary: '#faf8f3',
      textPrimary: '#2c2416',
      textSecondary: '#6b5d4a',
      accent: '#740001',
      border: '#d4c4a8',
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'Crimson Pro',
    },
    nodeStyle: {
      borderRadius: '12px',
      borderWidth: '2px',
      shadow: 'xl',
      borderStyle: 'magical',
    },
    background: {
      type: 'texture',
      opacity: 0.06,
      pattern: 'parchment',
    },
  },

  peakyBlinders: {
    id: 'peakyBlinders',
    name: 'Peaky Blinders',
    category: 'premium',
    price: 4.99,
    colors: {
      bgPrimary: '#1a1a1a',
      bgSecondary: '#2d2d2d',
      textPrimary: '#e5e5e5',
      textSecondary: '#a0a0a0',
      accent: '#8b0000',
      border: '#404040',
    },
    fonts: {
      heading: 'Crimson Pro',
      body: 'DM Sans',
    },
    nodeStyle: {
      borderRadius: '4px',
      borderWidth: '1px',
      shadow: '2xl',
      borderStyle: 'vintage',
    },
    background: {
      type: 'texture',
      opacity: 0.1,
      pattern: 'film-grain',
    },
  },
};

export const getTheme = (themeId) => {
  return themes[themeId] || themes.classic;
};

export const getFreeThemes = () => {
  return Object.values(themes).filter((theme) => theme.category === 'free');
};

export const getPremiumThemes = () => {
  return Object.values(themes).filter((theme) => theme.category === 'premium');
};

