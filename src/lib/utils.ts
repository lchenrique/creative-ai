import type {
  ColorConfig,
  ColorStop,
  GradientConfig,
} from "@/components/gradient-control";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  console.log("generateBackgroundCSS config", config);
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
