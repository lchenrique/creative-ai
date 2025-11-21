import type {
  ColorConfig,
  ColorStop,
  GradientConfig,
} from "@/components/gradient-control";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

interface GradientStop {
  color: string;
  position: string; // pode ser % ou px
}

export interface GradientObject {
  type: "linear" | "radial";
  angle?: string; // só linear
  shape?: string; // só radial, ex: "circle" ou "ellipse"
  position?: string; // radial origin, ex: "center", "top left"
  stops: GradientStop[];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hexToRgba = (hex: string, alpha: number) => {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const generateGradientCSS = (gradientConfig: GradientConfig) => {
  const {
    type,
    angle,
    stops,
    radialType,
    radialSize,
    radialPosition,
    linearStart,
    linearEnd,
  } = gradientConfig;
  const sortedStops = [...stops].sort(
    (a: ColorStop, b: ColorStop) => a.position - b.position,
  );

  if (type === "radial") {
    // @ts-ignore - radialStart e radialEnd podem não existir no tipo
    const radialStart = gradientConfig.radialStart;
    // @ts-ignore
    const radialEnd = gradientConfig.radialEnd;

    // Se tiver radialStart e radialEnd customizados, calcular raio
    if (radialStart && radialEnd) {
      const deltaX = radialEnd.x - radialStart.x;
      const deltaY = radialEnd.y - radialStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const radiusPercent = distance * 2;

      const stopStrings = sortedStops.map((stop: ColorStop) => {
        const rgba = hexToRgba(stop.color, stop.opacity / 100);
        const adjustedPosition = (stop.position / 100) * radiusPercent;
        return `${rgba} ${adjustedPosition}%`;
      });

      const position = `${radialStart.x}% ${radialStart.y}%`;
      return `radial-gradient(circle at ${position}, ${stopStrings.join(", ")})`;
    }

    // Fallback: gradiente radial padrão
    const stopStrings = sortedStops.map((stop: ColorStop) => {
      const rgba = hexToRgba(stop.color, stop.opacity / 100);
      return `${rgba} ${stop.position}%`;
    });
    const position = `${radialPosition.x}% ${radialPosition.y}%`;
    return `radial-gradient(${radialType} ${radialSize} at ${position}, ${stopStrings.join(", ")})`;
  }

  if (type === "conic") {
    const stopStrings = sortedStops.map((stop: ColorStop) => {
      const rgba = hexToRgba(stop.color, stop.opacity / 100);
      return `${rgba} ${stop.position}%`;
    });
    return `conic-gradient(from ${angle}deg at ${radialPosition.x}% ${radialPosition.y}%, ${stopStrings.join(", ")})`;
  }

  // Linear gradient com suporte a linearStart/linearEnd
  if (linearStart && linearEnd) {
    // Calcular a projeção das bolinhas na direção do gradiente
    const rad = ((angle - 90) * Math.PI) / 180;
    const gradientDirX = Math.cos(rad);
    const gradientDirY = Math.sin(rad);

    const startX = linearStart.x - 50;
    const startY = linearStart.y - 50;
    const endX = linearEnd.x - 50;
    const endY = linearEnd.y - 50;

    const startProjection = startX * gradientDirX + startY * gradientDirY;
    const endProjection = endX * gradientDirX + endY * gradientDirY;

    const maxProj = 70.71;
    const startPercent = (startProjection / maxProj) * 50 + 50;
    const endPercent = (endProjection / maxProj) * 50 + 50;

    const stopStrings = sortedStops.map((stop: ColorStop) => {
      const rgba = hexToRgba(stop.color, stop.opacity / 100);
      const normalizedPos = stop.position / 100;
      const adjustedPosition =
        startPercent + normalizedPos * (endPercent - startPercent);
      const clampedPosition = Math.max(0, Math.min(100, adjustedPosition));
      return `${rgba} ${clampedPosition}%`;
    });

    return `linear-gradient(${angle}deg, ${stopStrings.join(", ")})`;
  }

  // Linear gradient padrão (sem posições customizadas)
  const stopStrings = sortedStops.map((stop: ColorStop) => {
    const rgba = hexToRgba(stop.color, stop.opacity / 100);
    return `${rgba} ${stop.position}%`;
  });

  return `linear-gradient(${angle}deg, ${stopStrings.join(", ")})`;
};

export const generateBackgroundCSS = (config: any) => {
  if (config.colorType === "image") {
    return `url(${config.image})`;
  }
  if (config.colorType === "solid") {
    return config.solidColor;
  }
  if (config.colorType === "gradient") {
    // Safety check: ensure gradient object exists
    if (
      !config.gradient ||
      !config.gradient.stops ||
      config.gradient.stops.length === 0
    ) {
      return config.solidColor || "#000000"; // Fallback to solid color
    }
    return generateGradientCSS(config.gradient);
  }
  if (config.colorType === "pattern") {
    return config.solidColor || "#ffffff"; // Patterns use solidColor as background
  }
  if (config.colorType === "video") {
    return config.solidColor || "#000000"; // Videos use solidColor as fallback
  }
  // Fallback
  return "#ffffff";
};

export const generateCoverClass = (config: ColorConfig) => {
  if (config.colorType === "pattern") {
    return config.pattern;
  }
  return "";
};

export function polygonToPoints(str: string): { x: number; y: number }[] {
  const inside = str
    .trim()
    .replace(/^polygon\(|\)$/g, "")
    .trim();

  return inside.split(",").map((pair) => {
    const [x, y] = pair.trim().split(/\s+/);
    return {
      x: parseFloat(x),
      y: parseFloat(y),
    };
  });
}

export function parseGradient(css: string): GradientObject | null {
  css = css.trim();

  if (css.startsWith("linear-gradient")) {
    const inside = css.match(/\((.*)\)/)?.[1];
    if (!inside) return null;

    const [angleOrStop, ...stopsArr] = inside.split(/\s*,\s*/);
    let angle = "180deg"; // default
    let stops: GradientStop[] = [];

    // verifica se o primeiro item é um ângulo
    if (angleOrStop.match(/^\d+deg$/)) {
      angle = angleOrStop;
      stops = stopsArr.map((s) => {
        const [color, pos] = s.split(/\s+/);
        return { color, position: pos || "" };
      });
    } else {
      stops = [angleOrStop, ...stopsArr].map((s) => {
        const [color, pos] = s.split(/\s+/);
        return { color, position: pos || "" };
      });
    }

    return { type: "linear", angle, stops };
  }

  if (css.startsWith("radial-gradient")) {
    const inside = css.match(/\((.*)\)/)?.[1];
    if (!inside) return null;

    const [shapePos, ...stopsArr] = inside.split(/\s*,\s*/);
    let shape = "ellipse";
    let position = "center";
    let stops: GradientStop[] = [];

    const shapePosParts = shapePos.split(/\s+at\s+/);
    if (shapePosParts.length === 2) {
      shape = shapePosParts[0].trim();
      position = shapePosParts[1].trim();
    } else if (shapePosParts.length === 1 && !shapePosParts[0].match(/\d+%/)) {
      shape = shapePosParts[0].trim();
    }

    stops = stopsArr.map((s) => {
      const [color, pos] = s.split(/\s+/);
      return { color, position: pos || "" };
    });

    return { type: "radial", shape, position, stops };
  }

  return null;
}

export function gradientToCss(grad: GradientObject): string {
  const stopsStr = grad.stops
    .map((s) => (s.position ? `${s.color} ${s.position}` : s.color))
    .join(", ");

  if (grad.type === "linear") {
    const angle = grad.angle || "180deg";
    return `linear-gradient(${angle}, ${stopsStr})`;
  }

  if (grad.type === "radial") {
    const shape = grad.shape || "ellipse";
    const pos = grad.position ? ` at ${grad.position}` : "";
    return `radial-gradient(${shape}${pos}, ${stopsStr})`;
  }

  throw new Error("Tipo de gradiente desconhecido");
}

export interface ExtractedGradient {
  type: "linear" | "radial";
  angle: number;
  stops: { offset: number; color: string }[];
}

export function extractGradientData(css: string): ExtractedGradient | null {
  css = css.trim();

  const isLinear = css.startsWith("linear-gradient");
  const isRadial = css.startsWith("radial-gradient");

  if (!isLinear && !isRadial) return null;

  const inside = css.match(/\((.+)\)/)?.[1];
  if (!inside) return null;

  const parts = inside.split(/,(?![^(]*\))/);
  let angle = 180;
  let stopsStart = 0;

  if (isLinear) {
    const firstPart = parts[0].trim();
    const angleMatch = firstPart.match(/^(\d+)deg$/);
    if (angleMatch) {
      angle = parseInt(angleMatch[1], 10);
      stopsStart = 1;
    }
  }

  const stops = parts.slice(stopsStart).map((stop) => {
    const trimmed = stop.trim();
    const match = trimmed.match(/^(.+?)\s+(\d+)%$/);
    if (match) {
      return { color: match[1].trim(), offset: parseInt(match[2], 10) };
    }
    return { color: trimmed, offset: 0 };
  });

  return {
    type: isLinear ? "linear" : "radial",
    angle,
    stops,
  };
}
