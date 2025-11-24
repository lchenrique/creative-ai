
import { useCanvasStore } from "@/stores/canva-store";
import { filters } from "@/lib/filters";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
interface ImageCanvasProps {
  className?: string;
}

import type { GradientState } from "@/types/gradient";
import { generateCssString } from "@/lib/gradient-utils";

const getGradientString = (gradient: GradientState) => {
  return generateCssString(gradient.type, gradient.stops, 450, 800, gradient.linearStart, gradient.linearEnd, gradient.angle);
};

export const Background = ({ className }: ImageCanvasProps) => {
  const setSelected = useCanvasStore((state) => state.setBgSlected);
  const canvasBgColor = useCanvasStore((state) => state.canvasBgColor);
  const filter = useCanvasStore((state) => state.canvasFilter);
  const canvasFilterIntensities = useCanvasStore((state) => state.canvasFilterIntensities);
  const intensity = canvasFilterIntensities?.[filter || "original"] ?? 100;

  const getFilterStyle = () => {
    if (filter === "original") return {};

    const intensityFactor = (intensity - 12) / 100;
    const currentFilter = filters.find((f) => f.id === filter);
    const hasMixBlend = !!currentFilter?.mixBlendMode;

    return {
      filter: hasMixBlend ? undefined : currentFilter?.cssFilter,
      opacity: intensityFactor > 0 ? 0.2 + (1.4 * intensityFactor) : 0, // Blend from 20% to 100%
    };
  };

  const getMixFilterStyle = () => {
    if (filter === "original") return {};

    const currentFilter = filters.find((f) => f.id === filter);

    return {
      filter: currentFilter?.cssFilter,
      // Opacity is handled by the parent container
      background: currentFilter?.background,
      mixBlendMode: currentFilter?.mixBlendMode as CSSProperties["mixBlendMode"],
    };
  };

  if (!canvasBgColor) return null;

  return (
    <div
      onClick={() => setSelected!(true)}
      className={cn("absolute  w-full h-full flex items-center justify-center p-8 ", className)}>
      <div
        className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl pointer-events-none">
        {canvasBgColor.type === "image" && (
          <>
            <img
              src={canvasBgColor.value}
              alt="Imagem editada"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-300"
              style={getFilterStyle()}
            >
              <img
                src={canvasBgColor.value}
                alt="Filtro aplicado"
                className="w-full h-full object-cover"
                style={{
                  mixBlendMode: filters.find((f) => f.id === filter)?.imageMixBlendMode as CSSProperties["mixBlendMode"]
                }}
              />
              {filters.find((f) => f.id === filter)?.mixBlendMode && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={getMixFilterStyle()}
                />
              )}
            </div>
          </>
        )}
        {canvasBgColor.type === "gradient" && (
          <div
            className="w-full h-full"
            style={{ background: getGradientString(canvasBgColor.value) }}
          />
        )}
        {canvasBgColor.type === "solid" && (
          <div
            className="w-full h-full"
            style={{ backgroundColor: canvasBgColor.value }}
          />
        )}
      </div>
    </div>
  );
};
