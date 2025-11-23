import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/stores/canva-store";
import { filters } from "@/lib/filters";
import type { CSSProperties } from "react";
interface ImageCanvasProps {
  imageUrl: string | null;
  filter: string;
  intensity: number;
  onImageUpload: (file: File) => void;
}

export const Background = () => {
  const imageUrl = useCanvasStore((state) => state.canvasBgColor);
  const filter = useCanvasStore((state) => state.canvasFilter);
  const canvasFilterIntensities = useCanvasStore((state) => state.canvasFilterIntensities);
  const intensity = canvasFilterIntensities?.[filter || "original"] ?? 100;

  const getFilterStyle = () => {
    if (filter === "original") return {};

    // Apply filter with intensity
    const intensityFactor = (intensity - 12) / 100;
    const currentFilter = filters.find((f) => f.id === filter);
    const hasMixBlend = !!currentFilter?.mixBlendMode;

    return {
      // If it has mixBlendMode, the filter applies to the overlay, not the container/image
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

  if (imageUrl?.type !== "image") return null;
  const image = imageUrl.value;

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8 pointer-events-none">
      <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
        <img
          src={image}
          alt="Imagem editada"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={getFilterStyle()}
        >
          <img
            src={image}
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
      </div>
    </div>
  );
};
