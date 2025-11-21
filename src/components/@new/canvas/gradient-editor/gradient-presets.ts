export interface GradientPreset {
  name: string;
  css: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  // --- Lote Original (RGB) ---
  {
    name: "Neon Lagoon",
    css: "linear-gradient(90deg, rgb(0, 255, 135) 0%, rgb(96, 239, 255) 100%)",
  },
  {
    name: "Digital Sky",
    css: "linear-gradient(90deg, rgb(0, 97, 255) 0%, rgb(96, 239, 255) 100%)",
  },
  {
    name: "Synth Dusk",
    css: "linear-gradient(90deg, rgb(255, 27, 107) 0%, rgb(69, 202, 255) 100%)",
  },
  {
    name: "Cosmic Pop",
    css: "linear-gradient(90deg, rgb(64, 201, 255) 0%, rgb(232, 28, 255) 100%)",
  },
  {
    name: "Citrus Shine",
    css: "linear-gradient(90deg, rgb(255, 147, 15) 0%, rgb(255, 249, 91) 100%)",
  },
  {
    name: "Sunset Candy",
    css: "linear-gradient(90deg, rgb(255, 15, 123) 0%, rgb(248, 155, 41) 100%)",
  },
  {
    name: "Magic Garden",
    css: "linear-gradient(90deg, rgb(191, 15, 255) 0%, rgb(203, 255, 73) 100%)",
  },
  {
    name: "Lavender Dream",
    css: "linear-gradient(90deg, rgb(105, 110, 255) 0%, rgb(248, 172, 255) 100%)",
  },
  {
    name: "Mint Blush",
    css: "linear-gradient(90deg, rgb(169, 255, 104) 0%, rgb(255, 137, 137) 100%)",
  },
  {
    name: "Rose Mist",
    css: "linear-gradient(90deg, rgb(255, 88, 88) 0%, rgb(255, 200, 200) 100%)",
  },
  {
    name: "Electric Shore",
    css: "linear-gradient(90deg, rgb(89, 92, 255) 0%, rgb(198, 248, 255) 100%)",
  },
  {
    name: "Peach Cloud",
    css: "linear-gradient(90deg, rgb(255, 165, 133) 0%, rgb(255, 237, 160) 100%)",
  },
  {
    name: "Dream Circuit",
    css: "linear-gradient(90deg, rgb(132, 255, 201) 0%, rgb(236, 160, 255) 100%)",
  }, // 3 cores reduzido para 2
  {
    name: "Bloom Rush",
    css: "linear-gradient(90deg, rgb(239, 112, 155) 0%, rgb(250, 147, 114) 100%)",
  },
  {
    name: "Spring Heat",
    css: "linear-gradient(90deg, rgb(178, 239, 145) 0%, rgb(250, 147, 114) 100%)",
  },
  {
    name: "Crystal Pulse",
    css: "linear-gradient(90deg, rgb(155, 248, 244) 0%, rgb(111, 123, 247) 100%)",
  },
  {
    name: "Velvet Mirage",
    css: "linear-gradient(90deg, rgb(249, 197, 141) 0%, rgb(244, 146, 240) 100%)",
  },
  {
    name: "Luna Fade",
    css: "linear-gradient(90deg, rgb(244, 146, 240) 0%, rgb(161, 141, 206) 100%)",
  },
  {
    name: "Coral Ember",
    css: "linear-gradient(90deg, rgb(249, 177, 110) 0%, rgb(246, 128, 128) 100%)",
  },
  {
    name: "Midnight Calm",
    css: "linear-gradient(90deg, rgb(155, 175, 217) 0%, rgb(16, 55, 131) 100%)",
  },
  {
    name: "Golden Haze",
    css: "linear-gradient(90deg, rgb(251, 208, 124) 0%, rgb(247, 247, 121) 100%)",
  },
  {
    name: "Tropical Bloom",
    css: "linear-gradient(90deg, rgb(197, 249, 215) 0%, rgb(242, 122, 125) 100%)",
  }, // 3 cores reduzido para 2
  {
    name: "Frosted Light",
    css: "linear-gradient(90deg, rgb(235, 244, 245) 0%, rgb(181, 198, 224) 100%)",
  },
  {
    name: "Cotton Fade",
    css: "linear-gradient(90deg, rgb(246, 213, 247) 0%, rgb(251, 233, 215) 100%)",
  },
  {
    name: "Twilight Gold",
    css: "linear-gradient(90deg, rgb(67, 35, 113) 0%, rgb(250, 174, 123) 100%)",
  },
  {
    name: "Petal Air",
    css: "linear-gradient(90deg, rgb(233, 183, 206) 0%, rgb(211, 243, 241) 100%)",
  },
  {
    name: "Neon Mirage",
    css: "linear-gradient(90deg, rgb(67, 156, 251) 0%, rgb(241, 135, 251) 100%)",
  },
  {
    name: "Turbo Pulse",
    css: "linear-gradient(90deg, rgb(29, 189, 230) 0%, rgb(241, 81, 94) 100%)",
  },
  {
    name: "Pixel Meadow",
    css: "linear-gradient(90deg, rgb(87, 235, 222) 0%, rgb(174, 251, 42) 100%)",
  },
  {
    name: "Synth Stream",
    css: "linear-gradient(90deg, rgb(66, 4, 126) 0%, rgb(7, 244, 158) 100%)",
  },
  {
    name: "Lemon Grove",
    css: "linear-gradient(90deg, rgb(244, 242, 105) 0%, rgb(92, 178, 112) 100%)",
  },
  {
    name: "Dusty Lilac",
    css: "linear-gradient(90deg, rgb(177, 144, 186) 0%, rgb(232, 181, 149) 100%)",
  },
  {
    name: "Lilac Frost",
    css: "linear-gradient(90deg, rgb(181, 151, 246) 0%, rgb(150, 198, 234) 100%)",
  },
  {
    name: "Powder Bloom",
    css: "linear-gradient(90deg, rgb(201, 222, 244) 0%, rgb(184, 164, 201) 100%)",
  }, // 3 cores reduzido para 2
  {
    name: "Violet Breeze",
    css: "linear-gradient(90deg, rgb(124, 101, 169) 0%, rgb(150, 212, 202) 100%)",
  },
  {
    name: "Pastel Cloud",
    css: "linear-gradient(90deg, rgb(246, 207, 190) 0%, rgb(185, 220, 242) 100%)",
  },

  // --- Novos Adicionados (Hex) - Sanitizados para 2 Cores ---
  {
    name: "Aqua Splash",
    css: "linear-gradient(135deg, #1fa2ff 0%, #a6ffcb 100%)",
  }, // Reduzido
  {
    name: "Burning Orange",
    css: "linear-gradient(90deg, #f12711 0%, #f5af19 100%)",
  },
  {
    name: "Pinky Blue",
    css: "linear-gradient(180deg, #fc5c7d 0%, #6a82fb 100%)",
  },
  {
    name: "Deep Mystery",
    css: "linear-gradient(45deg, #c33764 0%, #1d2671 100%)",
  },
  {
    name: "Citrus Peel",
    css: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
  },
  {
    name: "Crimson Tide",
    css: "linear-gradient(90deg, #da4453 0%, #89216b 100%)",
  },
  { name: "Cool Red", css: "linear-gradient(90deg, #12c2e9 0%, #f64f59 100%)" }, // Reduzido
  {
    name: "Purple Sunset",
    css: "linear-gradient(180deg, #3a1c71 0%, #ffaf7b 100%)",
  }, // Reduzido
  {
    name: "Sweet Melon",
    css: "linear-gradient(45deg, #f2709c 0%, #ff9472 100%)",
  },
  {
    name: "Teal Violet",
    css: "linear-gradient(45deg, #5f2c82 0%, #49a09d 100%)",
  },
  {
    name: "Soft Rose",
    css: "linear-gradient(135deg, #dd5e89 0%, #f7bb97 100%)",
  },
  {
    name: "Night Fade",
    css: "linear-gradient(180deg, #1d2b64 0%, #f8cdda 100%)",
  },
];
