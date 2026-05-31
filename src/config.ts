export type TabType = 'dock' | 'bookmark' | 'buttons' | 'cards' | 'icons' | 'tables' | 'timeline' | 'snippets' | 'rss' | 'history';

export const tabOrder: TabType[] = ['dock', 'bookmark', 'buttons', 'cards', 'icons', 'tables', 'timeline', 'snippets', 'rss', 'history'];

export const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
  "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
  "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
  "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"
];

export const clockFonts = [
  { name: 'Standard (Sans)', value: 'ui-sans-serif, system-ui' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Cormorant Garamond', value: 'Cormorant Garamond, serif' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
  { name: 'Orbitron', value: 'Orbitron, sans-serif' },
  { name: 'Bebas Neue', value: 'Bebas Neue, sans-serif' },
  { name: 'Righteous', value: 'Righteous, sans-serif' },
  { name: 'Unbounded', value: 'Unbounded, sans-serif' },
  { name: 'Press Start 2P', value: '"Press Start 2P", system-ui' },
  { name: 'Bangers', value: 'Bangers, system-ui' },
  { name: 'Lobster', value: 'Lobster, system-ui' },
  { name: 'Pacifico', value: 'Pacifico, system-ui' },
  { name: 'Caveat', value: 'Caveat, cursive' },
  { name: 'Dancing Script', value: 'Dancing Script, cursive' },
  { name: 'Special Elite', value: 'Special Elite, system-ui' }
];
