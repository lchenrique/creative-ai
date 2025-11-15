import { useCreativeStore, type CanvasElement } from "@/stores/creative-store";
import { useCallback } from "react";

export const useElementOperations = () => {
  const elements = useCreativeStore((state) => state.canvasElements);
  const setElements = useCreativeStore((state) => state.setCanvasElements);
  const updateElement = useCreativeStore((state) => state.updateElement);
  const deleteSelected = useCreativeStore((state) => state.deleteSelected);
  const removeBackground = useCreativeStore((state) => state.removeBackground);

  const duplicateElements = useCallback((ids: number[]) => {
    const newElements = ids
      .map((id) => {
        const el = elements.find((e) => e.id === id);
        if (!el) return null;
        return {
          ...el,
          id: Math.max(...elements.map((e) => e.id)) + 1 + ids.indexOf(id),
          x: el.x + 20,
          y: el.y + 20,
        };
      })
      .filter((el): el is CanvasElement => el !== null);

    setElements((prev) => [...prev, ...newElements]);
    return newElements.map((el) => el.id);
  }, [elements, setElements]);

  const bringToFront = useCallback((ids: number[]) => {
    setElements((prev) => {
      const selected = prev.filter((el) => ids.includes(el.id));
      const others = prev.filter((el) => !ids.includes(el.id));
      return [...others, ...selected];
    });
  }, [setElements]);

  const sendToBack = useCallback((ids: number[]) => {
    setElements((prev) => {
      const selected = prev.filter((el) => ids.includes(el.id));
      const others = prev.filter((el) => !ids.includes(el.id));
      return [...selected, ...others];
    });
  }, [setElements]);

  return {
    elements,
    updateElement,
    deleteSelected,
    duplicateElements,
    bringToFront,
    sendToBack,
    removeBackground,
  };
};
