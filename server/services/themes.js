// Server-side theme definitions (mirrors client themes)

export const themes = {
  classic: {
    id: 'classic',
    name: 'Classic',
    category: 'free',
    price: 0,
    description: 'Traditional family tree on elegant parchment paper',
    promptTemplate: `Create a classic family tree diagram on aged cream-colored parchment paper with an elegant vintage design.

FAMILY STRUCTURE:
{{familyStructure}}

STYLE GUIDELINES:
- Traditional hand-drawn calligraphy style for names
- Ornate decorative borders with floral and vine motifs
- Warm sepia and cream color palette
- Connecting lines made of elegant curved branches
- {{memberCount}} circular portrait frames with decorative gold borders, each labeled with the person's name
- Soft shadows and aged paper texture
- Classic serif typography for any text
- Layout should flow from top (oldest generation) to bottom (youngest)`,
  },

  modern: {
    id: 'modern',
    name: 'Modern',
    category: 'free',
    price: 0,
    description: 'Clean, contemporary design with minimalist aesthetics',
    promptTemplate: `Create a modern, minimalist family tree with a clean contemporary design.

FAMILY STRUCTURE:
{{familyStructure}}

STYLE GUIDELINES:
- Clean white background with subtle geometric patterns
- Sans-serif typography, modern and readable
- Circular profile placeholders with thin borders
- {{memberCount}} portrait spots in a clean grid layout
- Connecting lines are thin, straight with right angles
- Accent colors: soft teal and coral
- Plenty of white space
- Names in clean, modern typography below each portrait
- Subtle drop shadows for depth`,
  },

  vintage: {
    id: 'vintage',
    name: 'Vintage',
    category: 'free',
    price: 0,
    description: 'Nostalgic 1920s art deco inspired design',
    promptTemplate: `Create a vintage Art Deco style family tree inspired by the 1920s aesthetic.

FAMILY STRUCTURE:
{{familyStructure}}

STYLE GUIDELINES:
- Rich burgundy, gold, and cream color palette
- Art Deco geometric patterns and borders
- Ornate gold frames around each portrait
- {{memberCount}} oval portrait frames with decorative Art Deco borders
- Elegant serif typography with gold accents
- Geometric connecting lines with chevron patterns
- Aged paper texture with subtle grain
- Names in elegant uppercase lettering`,
  },

  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'free',
    price: 0,
    description: 'Ultra-simple black and white design',
    promptTemplate: `Create an ultra-minimalist family tree with maximum simplicity.

FAMILY STRUCTURE:
{{familyStructure}}

STYLE GUIDELINES:
- Pure white background
- Simple black line drawings
- {{memberCount}} simple circular frames for portraits
- Thin single-weight lines for connections
- Clean sans-serif typography
- No decorative elements
- Names in lowercase, small text
- Maximum negative space
- Subtle gray tones only`,
  },

  gameOfThrones: {
    id: 'gameOfThrones',
    name: 'Game of Thrones',
    category: 'premium',
    price: 4.99,
    description: 'Medieval house lineage chart inspired by Westeros',
    promptTemplate: `Create a medieval family tree on aged parchment paper in the style of Game of Thrones house lineage charts.

FAMILY STRUCTURE:
{{familyStructure}}

STYLE GUIDELINES:
- Aged parchment with burnt edges and wax seal marks
- Medieval calligraphy style for all text
- Golden borders with dragon, wolf, and lion motifs
- {{memberCount}} circular portrait frames with ornate medieval borders featuring house sigil decorations
- Connecting lines made of ornate iron chains or vines
- Sepia and gold color palette with red accents
- Heraldic shields and banners
- Gothic architectural elements
- Names written in medieval script
- Faded map elements in background`,
  },

  simpsons: {
    id: 'simpsons',
    name: 'The Simpsons',
    category: 'premium',
    price: 4.99,
    description: 'Springfield-style cartoon family tree',
    promptTemplate: `Create a colorful, cartoon-style family tree inspired by The Simpsons animated series.

FAMILY STRUCTURE:
{{familyStructure}}

STYLE GUIDELINES:
- Bright yellow, blue, and pink color palette
- Cartoon illustration style with bold black outlines
- {{memberCount}} cartoon-style portrait frames shaped like TV screens
- Playful, bouncy connecting lines
- Springfield-inspired background elements (donuts, nuclear symbols, clouds)
- Comic sans or cartoon-style typography
- Fun, exaggerated proportions
- Each portrait frame has a colorful border
- Names in speech bubbles or cartoon labels
- Cheerful, family-friendly aesthetic`,
  },

  harryPotter: {
    id: 'harryPotter',
    name: 'Harry Potter',
    category: 'premium',
    price: 4.99,
    description: 'Magical wizarding world family tree',
    promptTemplate: `Create a magical family tree in the style of Harry Potter wizarding world ancestry charts.

FAMILY STRUCTURE:
{{familyStructure}}

STYLE GUIDELINES:
- Ancient magical parchment with glowing edges
- Dark purple, gold, and emerald color palette
- {{memberCount}} ornate portrait frames with magical golden frames like moving paintings
- Connecting lines that look like magical golden vines or light trails
- Hogwarts-inspired Gothic elements
- Star constellations in the background
- Mystical symbols and runes as decorative elements
- Names in elegant magical script
- Subtle sparkles and magical effects
- Candle-lit atmosphere with warm glow`,
  },

  peakyBlinders: {
    id: 'peakyBlinders',
    name: 'Peaky Blinders',
    category: 'premium',
    price: 4.99,
    description: '1920s Birmingham gangster aesthetic',
    promptTemplate: `Create a gritty, noir family tree inspired by Peaky Blinders 1920s Birmingham aesthetic.

FAMILY STRUCTURE:
{{familyStructure}}

STYLE GUIDELINES:
- Dark, moody atmosphere with industrial textures
- Black, charcoal gray, and gold color palette
- {{memberCount}} portrait frames styled like vintage police mugshots or formal 1920s photographs
- Connecting lines made of razor blade motifs or chain links
- Brick wall texture in background
- Art Deco typography with gold accents
- Smoke and fog atmospheric effects
- Flat cap and newsboy style decorative elements
- Names in bold, industrial typeface
- Film noir dramatic lighting
- Vintage newspaper clipping aesthetics`,
  },
};

export const getTheme = (themeId) => themes[themeId] || themes.classic;

export const isPremiumTheme = (themeId) => {
  const theme = themes[themeId];
  return theme?.category === 'premium';
};

