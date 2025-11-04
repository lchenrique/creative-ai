export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting';
  preview?: string;
}

export const fontOptions: FontOption[] = [
  // Sans-serif (Modernas e limpas)
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'sans-serif',
    preview: 'Texto moderno e legível'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: "'Roboto', sans-serif",
    category: 'sans-serif',
    preview: 'Design Google Material'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: "'Poppins', sans-serif",
    category: 'sans-serif',
    preview: 'Geométrica e amigável'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    category: 'sans-serif',
    preview: 'Inspirada em Buenos Aires'
  },
  {
    id: 'lato',
    name: 'Lato',
    family: "'Lato', sans-serif",
    category: 'sans-serif',
    preview: 'Humanista e elegante'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    family: "'Open Sans', sans-serif",
    category: 'sans-serif',
    preview: 'Neutra e amigável'
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    family: "'DM Sans', sans-serif",
    category: 'sans-serif',
    preview: 'Design system friendly'
  },
  {
    id: 'nunito',
    name: 'Nunito',
    family: "'Nunito', sans-serif",
    category: 'sans-serif',
    preview: 'Arredondada e calorosa'
  },
  {
    id: 'raleway',
    name: 'Raleway',
    family: "'Raleway', sans-serif",
    category: 'sans-serif',
    preview: 'Elegante e sofisticada'
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    category: 'sans-serif',
    preview: 'Moderna e tech'
  },
  {
    id: 'ibm-plex-sans',
    name: 'IBM Plex Sans',
    family: "'IBM Plex Sans', sans-serif",
    category: 'sans-serif',
    preview: 'Corporate e tecnológica'
  },
  {
    id: 'source-sans-pro',
    name: 'Source Sans Pro',
    family: "'Source Sans Pro', sans-serif",
    category: 'sans-serif',
    preview: 'Desenvolvida pela Adobe'
  },
  {
    id: 'archivo',
    name: 'Archivo',
    family: "'Archivo', sans-serif",
    category: 'sans-serif',
    preview: 'Condensada e impactante'
  },
  {
    id: 'quicksand',
    name: 'Quicksand',
    family: "'Quicksand', sans-serif",
    category: 'sans-serif',
    preview: 'Amigável e moderna'
  },
  // Novas fontes modernas
  {
    id: 'manrope',
    name: 'Manrope',
    family: "'Manrope', sans-serif",
    category: 'sans-serif',
    preview: 'Geométrica moderna 2024'
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    category: 'sans-serif',
    preview: 'Limpa e versátil para UI'
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    category: 'sans-serif',
    preview: 'Friendlier que Inter'
  },
  {
    id: 'lexend',
    name: 'Lexend',
    family: "'Lexend', sans-serif",
    category: 'sans-serif',
    preview: 'Otimizada para legibilidade'
  },
  {
    id: 'sora',
    name: 'Sora',
    family: "'Sora', sans-serif",
    category: 'sans-serif',
    preview: 'Moderna e tech-friendly'
  },

  // Serif (Clássicas e elegantes)
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    category: 'serif',
    preview: 'Elegante e tradicional'
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    family: "'Merriweather', serif",
    category: 'serif',
    preview: 'Ótima para leitura'
  },
  {
    id: 'crimson-text',
    name: 'Crimson Text',
    family: "'Crimson Text', serif",
    category: 'serif',
    preview: 'Clássica para textos longos'
  },
  {
    id: 'libre-baskerville',
    name: 'Libre Baskerville',
    family: "'Libre Baskerville', serif",
    category: 'serif',
    preview: 'Refinada e legível'
  },
  {
    id: 'cormorant-garamond',
    name: 'Cormorant Garamond',
    family: "'Cormorant Garamond', serif",
    category: 'serif',
    preview: 'Elegante e sofisticada'
  },

  // Monospace (Técnicas)
  {
    id: 'fira-code',
    name: 'Fira Code',
    family: "'Fira Code', monospace",
    category: 'monospace',
    preview: 'Code com ligatures'
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', monospace",
    category: 'monospace',
    preview: 'Desenvolvida para código'
  },

  // Display (Chamativas)
  {
    id: 'oswald',
    name: 'Oswald',
    family: "'Oswald', sans-serif",
    category: 'display',
    preview: 'Condensada e forte'
  },
  {
    id: 'bebas-neue',
    name: 'Bebas Neue',
    family: "'Bebas Neue', sans-serif",
    category: 'display',
    preview: 'Maiúscula e impactante'
  },
  {
    id: 'orbitron',
    name: 'Orbitron',
    family: "'Orbitron', sans-serif",
    category: 'display',
    preview: 'Futurista e tech'
  },
  {
    id: 'press-start-2p',
    name: 'Press Start 2P',
    family: "'Press Start 2P', monospace",
    category: 'display',
    preview: 'Retro gaming 8-bit'
  },
  // Novas fontes display
  {
    id: 'unbounded',
    name: 'Unbounded',
    family: "'Unbounded', sans-serif",
    category: 'display',
    preview: 'Futurista e tech moderna'
  },
  {
    id: 'bricolage-grotesque',
    name: 'Bricolage Grotesque',
    family: "'Bricolage Grotesque', sans-serif",
    category: 'display',
    preview: 'Quirky e moderna'
  },

  // Handwriting (Manuscritas)
  {
    id: 'caveat',
    name: 'Caveat',
    family: "'Caveat', cursive",
    category: 'handwriting',
    preview: 'Manuscrita casual'
  },
  {
    id: 'pacifico',
    name: 'Pacifico',
    family: "'Pacifico', cursive",
    category: 'handwriting',
    preview: 'Surf e verão'
  },
  {
    id: 'permanent-marker',
    name: 'Permanent Marker',
    family: "'Permanent Marker', cursive",
    category: 'handwriting',
    preview: 'Marcador permanente'
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    family: "'Dancing Script', cursive",
    category: 'handwriting',
    preview: 'Elegante e fluida'
  },
  // Novas fontes handwriting
  {
    id: 'kalam',
    name: 'Kalam',
    family: "'Kalam', cursive",
    category: 'handwriting',
    preview: 'Casual e amigável'
  },
  {
    id: 'shadows-into-light',
    name: 'Shadows Into Light',
    family: "'Shadows Into Light', cursive",
    category: 'handwriting',
    preview: 'Leve e moderna'
  },

  // Novas fontes adicionadas das imagens
  {
    id: 'arvo',
    name: 'Arvo',
    family: "'Arvo', serif",
    category: 'serif',
    preview: 'Serif robusta e legível'
  },
  {
    id: 'titillium-web',
    name: 'Titillium Web',
    family: "'Titillium Web', sans-serif",
    category: 'sans-serif',
    preview: 'Geométrica moderna'
  },
  {
    id: 'anton',
    name: 'Anton',
    family: "'Anton', sans-serif",
    category: 'display',
    preview: 'Display condensada impactante'
  },
  {
    id: 'fira-sans-condensed',
    name: 'Fira Sans Condensed',
    family: "'Fira Sans Condensed', sans-serif",
    category: 'sans-serif',
    preview: 'Técnica condensada'
  },
  {
    id: 'roboto-slab',
    name: 'Roboto Slab',
    family: "'Roboto Slab', serif",
    category: 'serif',
    preview: 'Slab serif amigável'
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    family: "'Ubuntu', sans-serif",
    category: 'sans-serif',
    preview: 'Humanista contemporânea'
  }
];

export const fontCategories = {
  'sans-serif': 'Sans-serif',
  'serif': 'Serif', 
  'monospace': 'Monospace',
  'display': 'Display',
  'handwriting': 'Manuscrita'
} as const;

export const getFontsByCategory = (category: FontOption['category']) => {
  return fontOptions.filter(font => font.category === category);
};

export const getFontById = (id: string) => {
  return fontOptions.find(font => font.id === id);
};

export const getFontByFamily = (family: string) => {
  return fontOptions.find(font => font.family === family);
}; 