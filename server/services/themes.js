// Server-side theme definitions
// All themes are free - payment is only for download ($2.99)

// Base instructions for all themes - ensures professional, clean output
const BASE_INSTRUCTIONS = `
CRITICAL LAYOUT REQUIREMENTS:
- Create a CLEAR, PROFESSIONAL family tree diagram
- Each person gets ONE large, prominent portrait frame (NO small duplicates)
- Arrange in CLEAR GENERATIONS: oldest at top, youngest at bottom
- Use THICK, CLEAR connecting lines between related people
- Names must be LARGE and READABLE, placed directly below each portrait
- Birth years in smaller text under the name
- Plenty of spacing between portraits - NO overlapping
- Portrait frames should be at least 150px equivalent in the final image
- Maximum 4 people per row for readability
- Spouses should be side by side on the same level
- Children should be centered below their parents

PORTRAIT STYLE (VERY IMPORTANT):
- Create ILLUSTRATED/ARTISTIC portraits that match the theme's art style
- DO NOT use photo-realistic images - ILLUSTRATE/DRAW each person
- Use reference photos only to capture likeness, then render in the theme's style
- All portraits should look hand-drawn or digitally illustrated
- Portraits must be stylistically consistent with the overall artwork
`;

export const themes = {
  classic: {
    id: 'classic',
    name: 'Classic',
    category: 'standard',
    description: 'Traditional family tree on elegant parchment paper',
    promptTemplate: `Create a PROFESSIONAL family tree diagram on elegant aged parchment paper.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Warm cream/sepia parchment background with subtle aged texture
- Large CIRCULAR portrait frames with ornate GOLD borders
- Elegant curved branch lines connecting family members
- Classic serif typography for names (large, readable)
- Decorative corner flourishes but NO clutter in the main area
- Soft warm lighting, museum-quality presentation
- Each of the {{memberCount}} people gets exactly ONE prominent portrait frame`,
  },

  modern: {
    id: 'modern',
    name: 'Modern',
    category: 'standard',
    description: 'Clean, contemporary design with minimalist aesthetics',
    promptTemplate: `Create a CLEAN, MODERN family tree with contemporary minimalist design.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Pure white background with subtle geometric accent patterns
- Large CIRCULAR portraits with thin elegant borders
- Clean straight connecting lines (not curved)
- Modern sans-serif typography (Helvetica/Arial style)
- Accent colors: soft teal and warm coral touches
- Generous white space between elements
- Drop shadows for subtle depth
- Each of the {{memberCount}} people gets exactly ONE clean portrait frame`,
  },

  vintage: {
    id: 'vintage',
    name: 'Vintage',
    category: 'standard',
    description: 'Nostalgic 1920s art deco inspired design',
    promptTemplate: `Create a SOPHISTICATED Art Deco family tree in 1920s vintage style.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Rich burgundy and gold color palette on cream background
- Large OVAL portrait frames with Art Deco geometric borders
- Geometric connecting lines with chevron accents
- Elegant serif typography with gold coloring
- Art Deco corner decorations and borders
- Subtle aged paper texture
- Each of the {{memberCount}} people gets exactly ONE elegant portrait frame`,
  },

  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'standard',
    description: 'Ultra-simple black and white design',
    promptTemplate: `Create an ULTRA-CLEAN minimalist family tree with maximum clarity.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Pure white background, no texture
- Simple large CIRCULAR frames with thin black borders
- Single-weight thin black lines for connections
- Clean sans-serif typography in black
- Zero decorative elements - only portraits, names, and lines
- Maximum negative space
- Each of the {{memberCount}} people gets exactly ONE simple portrait frame`,
  },

  gameOfThrones: {
    id: 'gameOfThrones',
    name: 'Game of Thrones',
    category: 'fun',
    description: 'Medieval house lineage chart inspired by Westeros',
    promptTemplate: `Create a MAJESTIC medieval family tree like a Westeros noble house lineage chart.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Aged parchment with subtle map elements in background
- Large CIRCULAR portrait frames with ornate medieval GOLD borders
- Thick decorative chain or vine connections between family members
- Medieval calligraphy style names (but still readable)
- Heraldic shield at the top with family name
- Sepia and gold colors with deep red accents
- Dragon, wolf, or lion decorative elements in corners only
- Each of the {{memberCount}} people gets exactly ONE noble portrait frame`,
  },

  simpsons: {
    id: 'simpsons',
    name: 'The Simpsons',
    category: 'fun',
    description: 'Springfield-style cartoon family tree',
    promptTemplate: `Create a FUN cartoon family tree in The Simpsons animated style.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Bright yellow background with blue sky gradient
- Large TV-SCREEN shaped portrait frames with colorful borders
- Playful bouncy connection lines
- Bold cartoon typography (rounded, fun)
- Springfield cloud and donut decorations in corners only
- Cheerful, vibrant colors throughout
- Each of the {{memberCount}} people gets exactly ONE cartoon portrait frame`,
  },

  harryPotter: {
    id: 'harryPotter',
    name: 'Harry Potter',
    category: 'fun',
    description: 'Magical wizarding world family tree',
    promptTemplate: `Create a MAGICAL family tree like a Hogwarts wizarding ancestry chart.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Deep purple/midnight blue parchment with starry atmosphere
- Large ORNATE golden portrait frames (like moving paintings)
- Magical golden vine or light trail connections
- Elegant magical script typography (readable)
- Subtle star constellations in background
- Warm candlelit glow effect
- Magical sparkles as subtle accents only
- Each of the {{memberCount}} people gets exactly ONE magical portrait frame`,
  },

  peakyBlinders: {
    id: 'peakyBlinders',
    name: 'Peaky Blinders',
    category: 'fun',
    description: '1920s Birmingham gangster aesthetic',
    promptTemplate: `Create a DRAMATIC noir family tree in 1920s Peaky Blinders style.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Dark moody background with industrial brick texture
- Large RECTANGULAR portrait frames like vintage photographs
- Strong geometric gold connecting lines
- Bold industrial typography in gold/white
- Film noir dramatic lighting with shadows
- Art Deco gold accents
- Smoke/fog subtle atmosphere
- Each of the {{memberCount}} people gets exactly ONE dramatic portrait frame`,
  },

  botanical: {
    id: 'botanical',
    name: 'Botanical Garden',
    category: 'nature',
    description: 'Beautiful botanical illustration style',
    promptTemplate: `Create a BEAUTIFUL botanical family tree with nature illustrations.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Soft cream background like vintage botanical prints
- Large CIRCULAR portrait frames wrapped in delicate leaf wreaths
- Graceful vine tendrils as connection lines
- Elegant cursive typography in forest green
- Watercolor flowers and leaves as subtle decorations
- Muted greens, soft pinks, cream colors
- Pressed flower aesthetic
- Each of the {{memberCount}} people gets exactly ONE botanical portrait frame`,
  },

  celestial: {
    id: 'celestial',
    name: 'Celestial',
    category: 'nature',
    description: 'Mystical stars and moon theme',
    promptTemplate: `Create a MYSTICAL celestial family tree with cosmic elements.

FAMILY STRUCTURE:
{{familyStructure}}

${BASE_INSTRUCTIONS}

VISUAL STYLE:
- Deep midnight blue/purple gradient background
- Large CIRCULAR portrait frames with gold constellation borders
- Starlight trail connecting lines in gold/silver
- Elegant gold typography
- Moon phases in top corners
- Subtle nebula and cosmic dust textures
- Twinkling star accents (not overwhelming)
- Each of the {{memberCount}} people gets exactly ONE celestial portrait frame`,
  },

  custom: {
    id: 'custom',
    name: 'Custom Theme',
    category: 'custom',
    description: 'User-defined custom style',
    promptTemplate: `{{customPrompt}}`,
  },
};

export const getTheme = (themeId) => themes[themeId] || themes.classic;

// All themes are now free
export const isPremiumTheme = () => false;

export const DOWNLOAD_PRICE = 2.99;
