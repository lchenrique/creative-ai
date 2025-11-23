import GradientControl from "@/components/gradient-control";
import { useCanvasStore } from "@/stores/canva-store";
import { useEffect, useState, useRef } from "react";
import type { ColorConfig } from "@/stores/canva-store";

export const BackgroundController = () => {
  const setCanvasBgColor = useCanvasStore((state) => state.setCanvasBgColor);
  const bgSlected = useCanvasStore((state) => state.bgSlected);

  const [currentColorConfig, setCurrentColorConfig] = useState<ColorConfig>({
    type: "solid",
    value: "#FFFFFF",
  });

  const hasLoadedRef = useRef(false);

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
      enableImage={true}
    />
  );
};
