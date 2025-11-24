import type { Element, ElementConfig, PathPoint } from "@/stores/canva-store";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseClipPathEditorProps {
  elements: Element;
  updateElementConfig: (id: string, newConfig: Partial<ElementConfig>) => void;
}

interface ClippableRect {
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
  transform: string; // Full CSS transform from element
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
    const element = elements[clippableId];
    return (
      element?.config.style.clipPath ||
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
    );
  }, [clippableId, elements]);

  // Get pathPoints for current clippable element
  const currentPathPoints = useMemo(() => {
    if (!clippableId) return undefined;
    const element = elements[clippableId];
    return element?.config.style.clipPathPoints;
  }, [clippableId, elements]);

  // Get element type
  const selectedType = useMemo(() => {
    return clippableId ? elements[clippableId]?.type : null;
  }, [clippableId, elements]);

  // Helper function to get element rect relative to canvas
  const getElementRect = useCallback((el: HTMLElement): ClippableRect | null => {
    const canvas = document.querySelector(
      '[style*="width: 450px"]',
    ) as HTMLElement;
    if (!canvas) return null;

    const canvasRect = canvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect(); // Bounding box (rotated)

    // Extract rotation from transform
    const transform = el.style.transform || '';
    let rotation = 0;
    const rotateMatch = transform.match(/rotate\(([-+]?[0-9]*\.?[0-9]+)deg\)/);
    if (rotateMatch) {
      rotation = parseFloat(rotateMatch[1]);
    }

    // Use offsetWidth/Height for the actual unrotated size
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    // Calculate center of the element relative to canvas
    const centerX = elRect.left + elRect.width / 2 - canvasRect.left;
    const centerY = elRect.top + elRect.height / 2 - canvasRect.top;

    // Calculate top-left position for the unrotated overlay to be centered
    const left = centerX - width / 2;
    const top = centerY - height / 2;

    console.log('📐 Element Rect:', { width, height, rotation, left, top });

    return {
      left,
      top,
      width,
      height,
      rotation,
      transform,
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
