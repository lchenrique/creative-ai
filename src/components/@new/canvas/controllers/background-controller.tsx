import GradientControl from "@/components/gradient-control";
import { useCanvasStore } from "@/stores/canva-store";
import { useEffect, useState, useRef } from "react";
import type { ColorConfig } from "@/stores/canva-store";

export const BackgroundController = () => {
  const setCanvasBgColor = useCanvasStore((state) => state.setCanvasBgColor);
  const bgSlected = useCanvasStore((state) => state.bgSlected);

  // Estado local para o ColorConfig
  const [currentColorConfig, setCurrentColorConfig] = useState<ColorConfig>({
    type: "solid",
    value: "#FFFFFF",
  });

  // Ref para controlar se já carregou inicialmente
  const hasLoadedRef = useRef(false);

  // Sincroniza o estado local APENAS quando o background for selecionado pela primeira vez
  useEffect(() => {
    if (bgSlected && !hasLoadedRef.current) {
      const freshBgColor = useCanvasStore.getState().canvasBgColor;
      if (freshBgColor) {
        setCurrentColorConfig(freshBgColor);
      }
      hasLoadedRef.current = true;
    } else if (!bgSlected) {
      hasLoadedRef.current = false;
    }
  }, [bgSlected]);

  return (
    <div>
      <GradientControl
        colorConfig={currentColorConfig}
        setColorConfig={(newConfig) => {
          // Atualiza o estado local
          setCurrentColorConfig(newConfig);

          // Atualiza o background global
          setCanvasBgColor?.(newConfig);
        }}
      />
    </div>
  );
};
