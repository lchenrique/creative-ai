import GradientControl from "@/components/gradient-control";
import { useCanvasStore } from "@/stores/canva-store";
import { useEffect, useState, useRef } from "react";
import type { ColorConfig } from "@/stores/canva-store";
import { filters } from "@/lib/filters";

export const BackgroundController = () => {
  const setCanvasBgColor = useCanvasStore((state) => state.setCanvasBgColor);
  const bgSlected = useCanvasStore((state) => state.bgSlected);

  const [currentColorConfig, setCurrentColorConfig] = useState<ColorConfig>({
    type: "solid",
    value: "#FFFFFF",
  });

  const hasLoadedRef = useRef(false);

  const filter = useCanvasStore((state) => state.canvasFilter);
  const filterIntensities = useCanvasStore((state) => state.canvasFilterIntensities);

  const [activeFilter, setActiveFilter] = useState(filter);
  const imageUrl = useCanvasStore((state) => state.canvasBgColor);

  const handleFilterSelect = (filterId: typeof filters[number]["id"]) => {
    setActiveFilter(filterId);
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      useCanvasStore.setState({ canvasFilter: filter.id });
    }
  };

  const handleIntensityChange = (filterId: typeof filters[number]["id"], value: number) => {
    useCanvasStore.setState({ canvasFilterIntensities: { ...(filterIntensities || {}), [filterId]: value } });
  };


  useEffect(() => {
    if (bgSlected && !hasLoadedRef.current) {
      const state = useCanvasStore.getState();
      if (state.canvasBgColor) {
        setCurrentColorConfig(state.canvasBgColor);
      }
      hasLoadedRef.current = true;
    } else if (!bgSlected) {
      hasLoadedRef.current = false;
    }
  }, [bgSlected]);



  return (
    <GradientControl
      colorConfig={currentColorConfig}
      setColorConfig={(newConfig) => {
        setCurrentColorConfig(newConfig);
        setCanvasBgColor?.(newConfig);
      }}
      enableImage
      intensity={filterIntensities}
      onIntensityChange={handleIntensityChange}
      previewImage={imageUrl?.type === "image" ? imageUrl.value : ""}
      selectedFilter={activeFilter}
      setSelectedFilter={handleFilterSelect}

    />
  );
};
