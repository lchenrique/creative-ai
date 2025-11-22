import { useState, useEffect, useCallback, useMemo } from "react";
import type { ElementsProps, ElementConfig, PathPoint } from "@/stores/canva-store";

interface UseClipPathEditorProps {
  elements: ElementsProps[];
  updateElementConfig: (id: string, config: Partial<ElementConfig>) => void;
}

interface ClippableRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Hook para gerenciar o editor de clip-path
 */
export const useClipPathEditor = ({
  elements,
  updateElementConfig,
}: UseClipPathEditorProps) => {
  const [clippableId, setClippableId] = useState<string | null>(null);
  const [clippableRect, setClippableRect] = useState<ClippableRect | null>(null);

  // Get clipPath for current clippable element
  const currentClipPath = useMemo(() => {
    if (!clippableId) return undefined;
    const element = elements.find((el) => el.id === clippableId);
    return (
      element?.config.style.clipPath ||
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
    );
  }, [clippableId, elements]);

  // Get pathPoints for current clippable element
  const currentPathPoints = useMemo(() => {
    if (!clippableId) return undefined;
    const element = elements.find((el) => el.id === clippableId);
    return element?.config.style.clipPathPoints;
  }, [clippableId, elements]);

  // Get element type
  const selectedType = useMemo(() => {
    return elements.find((element) => element.id === clippableId)?.type;
  }, [clippableId, elements]);

  // Helper function to get element rect relative to canvas
  const getElementRect = useCallback((el: HTMLElement): ClippableRect | null => {
    const canvas = document.querySelector(
      '[style*="width: 450px"]',
    ) as HTMLElement;
    if (!canvas) return null;

    const canvasRect = canvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    return {
      left: elRect.left - canvasRect.left,
      top: elRect.top - canvasRect.top,
      width: elRect.width,
      height: elRect.height,
    };
  }, []);

  // Update clippableRect when clippableId changes
  useEffect(() => {
    if (!clippableId) {
      setClippableRect(null);
      return;
    }
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      const el = document.querySelector(
        `[data-element-id="${clippableId}"]`,
      ) as HTMLElement;
      if (el) {
        const rect = getElementRect(el);
        if (rect) setClippableRect(rect);
      }
    }, 0);
  }, [clippableId, getElementRect]);

  // Global double-click handler to exit clip mode
  useEffect(() => {
    if (!clippableId) return;

    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target?.tagName?.toLowerCase();
      const isClipEditorElement =
        tagName === "svg" ||
        tagName === "circle" ||
        tagName === "path" ||
        tagName === "line" ||
        tagName === "rect" ||
        tagName === "text";

      if (!isClipEditorElement) {
        setClippableId(null);
      }
    };

    const timeoutId = setTimeout(() => {
      window.addEventListener("dblclick", handleDoubleClick);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [clippableId]);

  // Handler for clip path changes
  const onClipPathChange = useCallback(
    (newClipPath: string) => {
      if (clippableId && updateElementConfig) {
        updateElementConfig(clippableId, {
          style: { clipPath: newClipPath },
        });
      }
    },
    [clippableId, updateElementConfig],
  );

  // Handler when editor closes - saves final polygon version and pathPoints
  const onClipPathClose = useCallback(
    (polygonClipPath: string, pathPoints?: PathPoint[]) => {
      if (clippableId && updateElementConfig) {
        updateElementConfig(clippableId, {
          style: {
            clipPath: polygonClipPath,
            clipPathPoints: pathPoints,
          },
        });
      }
    },
    [clippableId, updateElementConfig],
  );

  // Update clippable rect (for drag/resize)
  const updateClippableRect = useCallback(
    (el: HTMLElement, size?: { width: number; height: number }) => {
      const rect = getElementRect(el);
      if (rect) {
        setClippableRect(size ? { ...rect, ...size } : rect);
      }
    },
    [getElementRect],
  );

  return {
    clippableId,
    setClippableId,
    clippableRect,
    currentClipPath,
    currentPathPoints,
    selectedType,
    getElementRect,
    onClipPathChange,
    onClipPathClose,
    updateClippableRect,
  };
};
