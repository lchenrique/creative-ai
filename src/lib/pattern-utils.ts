// Utilitários para gerenciar cores dos patterns CSS

interface PatternColors {
  [key: string]: string; // --c1, --c2, --c3, --c4
}

// Mapeamento dos patterns com suas cores padrão (mesmo do PatternColorEditor)
export const PATTERN_DEFAULTS: Record<string, PatternColors> = {
  'pattern-sunburst-dots': {
    '--c1': '#ecbe13',
    '--c2': '#309292'
  },
  'pattern-windmill': {
    '--c1': '#5e9fa3',
    '--c2': '#dcd1b4'
  },
  'pattern-elegant-curves': {
    '--c1': '#b38184',
    '--c2': '#413e4a'
  },
  'pattern-striped-waves': {
    '--c1': '#cc2a41',
    '--c2': '#351330'
  },
  'pattern-woven-texture': {
    '--c1': '#f8edd1',
    '--c2': '#d88a8a',
    '--c3': '#9d9d93'
  },
  'pattern-rainbow-ripples': {
    '--c1': '#ab3e5b',
    '--c2': '#ffbe40',
    '--c3': '#accec0',
    '--c4': '#61a6ab'
  },
  'pattern-crossed-lines': {
    '--c1': '#ecd078',
    '--c2': '#542437'
  },
  'pattern-vintage-circles': {
    '--c1': '#6b5344',
    '--c2': '#f8ecc9'
  },
  'pattern-waves-flow': {
    '--c1': '#d95b43',
    '--c2': '#a7dbd8'
  },
  'pattern-colorful-mosaic': {
    '--c1': '#f77825',
    '--c2': '#60b99a',
    '--c3': '#f1efa5',
    '--c4': '#554236'
  },
  'pattern-geometric-waves': {
    '--c1': '#f6d86b',
    '--c2': '#f10c49'
  },
  'pattern-sunflower': {
    '--c1': '#f8ca00',
    '--c2': '#bd1550'
  },
  'pattern-autumn-leaves': {
    '--c1': '#ffdc56',
    '--c2': '#fe6601',
    '--c3': '#803201'
  },
  'pattern-rhombus-octagons': {
    '--c1': '#4e395d',
    '--c2': '#8ebe94'
  },
  'pattern-zen-garden': {
    '--c1': '#80bca3',
    '--c2': '#655643'
  },
  'pattern-bamboo-forest': {
    '--c1': '#e4844a',
    '--c2': '#0d6759'
  },
  'pattern-sunset-gradient': {
    '--c1': '#f8b195',
    '--c2': '#355c7d'
  },
  'pattern-leaf-shadows': {
    '--c1': '#e9e0d1',
    '--c2': '#59a80f'
  },
  'pattern-desert-sand': {
    '--c1': '#dfba69',
    '--c2': '#5a2e2e'
  },
  'pattern-vintage-paper': {
    '--c1': '#d9ceb2',
    '--c2': '#948c75'
  },
  'pattern-diamond-grid': {
    '--c1': '#292522',
    '--c2': '#efd9b4'
  },
  'pattern-spring-meadow': {
    '--c1': '#f2f26f',
    '--c2': '#a0c55f'
  },
  'pattern-sunset-stripes': {
    '--c1': '#d3643b',
    '--c2': '#333333'
  },
  'pattern-mint-petals': {
    '--c1': '#90c0b2',
    '--c2': '#f9fbef'
  },
  'pattern-forest-maze': {
    '--c1': '#1c2130',
    '--c2': '#b3e099'
  },
  'pattern-ocean-waves': {
    '--c1': '#f8e4c1',
    '--c2': '#2b4e72'
  },
  'pattern-ruby-diamonds': {
    '--c1': '#cf4647',
    '--c2': '#524656'
  },
  'pattern-golden-weave': {
    '--c1': '#e8bf56',
    '--c2': '#91204d'
  },
  'pattern-meander': {
    '--c1': '#72e21f',
    '--c2': '#044012'
  },
  'pattern-retangular-with-3d-effect': {
    '--c1': '#f6edb3',
    '--c2': '#acc4a3',
    '--c3': '#55897c'
  },
  // Novos patterns com variações de tamanho
  'pattern-checks-sm': { '--c1': '#4a90e2', '--c2': '#f5a623' },
  'pattern-checks-md': { '--c1': '#417505', '--c2': '#b8e986' },
  'pattern-checks-lg': { '--c1': '#d0021b', '--c2': '#f8e71c' },
  'pattern-checks-xl': { '--c1': '#9013fe', '--c2': '#50e3c2' },
  'pattern-grid-sm': { '--c1': '#7ed6df', '--c2': '#e17055' },
  'pattern-grid-md': { '--c1': '#00b894', '--c2': '#fdcb6e' },
  'pattern-grid-lg': { '--c1': '#636e72', '--c2': '#fab1a0' },
  'pattern-grid-xl': { '--c1': '#fd79a8', '--c2': '#00cec9' },
  'pattern-dots-sm': { '--c1': '#f6e58d', '--c2': '#30336b' },
  'pattern-dots-md': { '--c1': '#6ab04c', '--c2': '#eb4d4b' },
  'pattern-dots-lg': { '--c1': '#4834d4', '--c2': '#f9ca24' },
  'pattern-dots-xl': { '--c1': '#e056fd', '--c2': '#686de0' },
  'pattern-cross-dots-sm': { '--c1': '#00b894', '--c2': '#d35400' },
  'pattern-cross-dots-md': { '--c1': '#fdcb6e', '--c2': '#0984e3' },
  'pattern-cross-dots-lg': { '--c1': '#e17055', '--c2': '#00b894' },
  'pattern-cross-dots-xl': { '--c1': '#6c5ce7', '--c2': '#fd79a8' },
  'pattern-diagonal-lines-sm': { '--c1': '#00bcd4', '--c2': '#ffeb3b' },
  'pattern-diagonal-lines-md': { '--c1': '#ff5722', '--c2': '#607d8b' },
  'pattern-diagonal-lines-lg': { '--c1': '#8bc34a', '--c2': '#e91e63' },
  'pattern-diagonal-lines-xl': { '--c1': '#3f51b5', '--c2': '#cddc39' },
  'pattern-horizontal-lines-sm': { '--c1': '#f1c40f', '--c2': '#2ecc71' },
  'pattern-horizontal-lines-md': { '--c1': '#e67e22', '--c2': '#1abc9c' },
  'pattern-horizontal-lines-lg': { '--c1': '#9b59b6', '--c2': '#34495e' },
  'pattern-horizontal-lines-xl': { '--c1': '#e74c3c', '--c2': '#3498db' },
  'pattern-vertical-lines-sm': { '--c1': '#16a085', '--c2': '#f39c12' },
  'pattern-vertical-lines-md': { '--c1': '#2980b9', '--c2': '#c0392b' },
  'pattern-vertical-lines-lg': { '--c1': '#8e44ad', '--c2': '#27ae60' },
  'pattern-vertical-lines-xl': { '--c1': '#2c3e50', '--c2': '#f1c40f' },
  'pattern-diagonal-stripes-sm': { '--c1': '#00cec9', '--c2': '#ff7675' },
  'pattern-diagonal-stripes-md': { '--c1': '#fdcb6e', '--c2': '#0984e3' },
  'pattern-diagonal-stripes-lg': { '--c1': '#e17055', '--c2': '#00b894' },
  'pattern-diagonal-stripes-xl': { '--c1': '#6c5ce7', '--c2': '#fd79a8' },
  'pattern-horizontal-stripes-sm': { '--c1': '#fab1a0', '--c2': '#636e72' },
  'pattern-horizontal-stripes-md': { '--c1': '#00b894', '--c2': '#fdcb6e' },
  'pattern-horizontal-stripes-lg': { '--c1': '#7ed6df', '--c2': '#e17055' },
  'pattern-horizontal-stripes-xl': { '--c1': '#fd79a8', '--c2': '#00cec9' },
  'pattern-vertical-stripes-sm': { '--c1': '#f6e58d', '--c2': '#30336b' },
  'pattern-vertical-stripes-md': { '--c1': '#6ab04c', '--c2': '#eb4d4b' },
  'pattern-vertical-stripes-lg': { '--c1': '#4834d4', '--c2': '#f9ca24' },
  'pattern-vertical-stripes-xl': { '--c1': '#e056fd', '--c2': '#686de0' },
  'pattern-triangles-sm': { '--c1': '#00b894', '--c2': '#d35400' },
  'pattern-triangles-md': { '--c1': '#fdcb6e', '--c2': '#0984e3' },
  'pattern-triangles-lg': { '--c1': '#e17055', '--c2': '#00b894' },
  'pattern-triangles-xl': { '--c1': '#6c5ce7', '--c2': '#fd79a8' },
  'pattern-zigzag-sm': { '--c1': '#00bcd4', '--c2': '#ffeb3b' },
  'pattern-zigzag-md': { '--c1': '#ff5722', '--c2': '#607d8b' },
  'pattern-zigzag-lg': { '--c1': '#8bc34a', '--c2': '#e91e63' },
  'pattern-zigzag-xl': { '--c1': '#3f51b5', '--c2': '#cddc39' },

  // Animated Patterns
  'pattern-square-animated': { '--c1': '#C3CCAF', '--c2': '#67434F' },
  'pattern-square-rectangle-animated': { '--c1': '#C3CCAF', '--c2': '#67434F' },
  'pattern-square-sliding-animated': { '--c1': '#424a72', '--c2': '#0f111a' },
  'pattern-arrow-sliding-animated': { '--c1': '#ECD078', '--c2': '#0B486B' },
};

/**
 * Aplica as cores customizadas de um pattern específico nos elementos que tem a classe e nos IDs específicos
 */
export const applyPatternColors = (
  patternName: string,
  customColors: PatternColors = {}
) => {

  if (!patternName || !patternName.startsWith('pattern-')) return;

  const defaultColors = PATTERN_DEFAULTS[patternName];
  if (!defaultColors) return;
  const style = document.createElement('style');
  const variables = {}
  if (customColors['--c1']) {
    Object.assign(variables, { '--c1': customColors['--c1'] });
  }
  if (customColors['--c2']) {
    Object.assign(variables, { '--c2': customColors['--c2'] });
  }
  if (customColors['--c3']) {
    Object.assign(variables, { '--c3': customColors['--c3'] });
  }
  if (customColors['--c4']) {
    Object.assign(variables, { '--c4': customColors['--c4'] });
  }
  style.innerHTML = `.${patternName} { ${Object.entries(variables).map(([key, value]) => `${key}: ${value};`).join(' ')} transition: all 0.3s ease-in-out; }`;

  document.head.appendChild(style);

};

/**
 * Reseta um pattern para suas cores padrão
 */
export const resetPatternColors = (patternName: string) => {

  if (!patternName || !patternName.startsWith('pattern-')) return;

  const defaultColors = PATTERN_DEFAULTS[patternName];
  if (!defaultColors) return;

  const style = document.createElement('style');
  style.innerHTML = `.${patternName} { --c1:${defaultColors['--c1']}; --c2:${defaultColors['--c2']}; --c3:${defaultColors['--c3']}; --c4:${defaultColors['--c4']}; }`;
  document.head.appendChild(style);
};

/**
 * Reseta todos os patterns para cores padrão
 */
export const resetAllPatternColors = () => {
  Object.keys(PATTERN_DEFAULTS).forEach(patternName => {
    resetPatternColors(patternName);
  });
}; 