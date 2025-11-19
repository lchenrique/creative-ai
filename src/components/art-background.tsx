import { patternAnimations } from "@/data/pattern-animations";
import { PATTERN_DEFAULTS } from "@/lib/pattern-utils";
import { generateBackgroundCSS, generateCoverClass } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canva-store";
import { useCreativeStore } from "@/stores/creative-store";
import { useEffect } from "react";
// Função para extrair cor hex de qualquer formato (hex, rgb, rgba, gradiente)
const extractHexColor = (colorString: string): string => {
  // Se já é hex, retornar
  if (colorString.startsWith("#")) {
    return colorString;
  }

  // Se é rgb/rgba, converter para hex
  if (colorString.startsWith("rgb")) {
    const match = colorString.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(",").map((v) => parseInt(v.trim()));
      const [r, g, b] = values;

      const toHex = (c: number) => {
        const hex = Math.round(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }

  // Se é gradiente, extrair a primeira cor
  if (colorString.includes("gradient")) {
    const match = colorString.match(/#[0-9a-fA-F]{6}/);
    if (match) {
      return match[0];
    }
  }

  // Fallback
  return "#ffffff";
};

export const generateComplementaryColor = (
  solidColor: string,
  variation: number = 0.5,
): string => {
  // Extrair cor hex
  const hexColor = extractHexColor(solidColor);

  // Converter hex para RGB
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calcular luminosidade (fórmula padrão)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Determinar se a cor é clara ou escura
  const isLight = luminance > 0.5;

  // Definir quantos tons mover (usando variação)
  const toneSteps = Math.min(variation, 2.0); // Limitar a variação máxima

  // Gerar cor complementar
  let complementaryR, complementaryG, complementaryB;

  if (isLight) {
    // Se clara, mover alguns tons para baixo (mais escuro)
    const stepSize = 255 / 8; // Dividir em 8 níveis de luminosidade
    const darkenAmount = toneSteps * stepSize;

    complementaryR = Math.max(0, r - darkenAmount);
    complementaryG = Math.max(0, g - darkenAmount);
    complementaryB = Math.max(0, b - darkenAmount);
  } else {
    // Se escura, mover alguns tons para cima (mais claro)
    const stepSize = 255 / 8; // Dividir em 8 níveis de luminosidade
    const lightenAmount = toneSteps * stepSize;

    complementaryR = Math.min(255, r + lightenAmount);
    complementaryG = Math.min(255, g + lightenAmount);
    complementaryB = Math.min(255, b + lightenAmount);
  }

  // Converter de volta para hex
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(complementaryR)}${toHex(complementaryG)}${toHex(complementaryB)}`;
};

export function Background() {
  const backgroundColorConfig = useCanvasStore((state) => state.canvasBgColorConfig);
  const setBgSlected = useCanvasStore((state) => state.setBgSlected);
  const bgSlected = useCanvasStore((state) => state.bgSlected);
  // const currentBackgroundClass = generateCoverClass(backgroundColorConfig);


  const handleBgClick = () => {
    setBgSlected?.(true);
  }

  //cliclk outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-bg-selected="true"]') || !target.closest('[data-slot="floating-menu-content"]')) {
        setBgSlected?.(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };

  }, [setBgSlected, bgSlected]);

  return (
    <div
      className={cn(
        "absolute border bg-selected",
        "data-bg-selected:border-blue-500",
        "hover:border-blue-300",
        "bg-background", "z-0")}
      onClick={handleBgClick}
      data-bg-selected={bgSlected || undefined}
      style={{
        width: "450px",
        height: "800px",
        left: 0,
        top: 0,
        backgroundImage: backgroundColorConfig?.type === "gradient"
          ? backgroundColorConfig?.value
          : undefined,
        backgroundColor: backgroundColorConfig?.type === "solid"
          ? backgroundColorConfig?.value
          : undefined,
        backgroundSize: backgroundColorConfig?.type === "gradient"
          ? "100% 100%"
          : "cover",
        backgroundRepeat: "no-repeat",
        backgroundOrigin: "content-box",
      }}
    />
  );
}
