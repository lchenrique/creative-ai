import { useCreativeStore } from "@/stores/creative-store";
import { useCallback } from "react";

export const useElementSelection = () => {
  const selectedIds = useCreativeStore((state) => state.selectedCanvasIds);
  const setSelectedIds = useCreativeStore((state) => state.setSelectedCanvasIds);
  const elements = useCreativeStore((state) => state.canvasElements);

  const selectElement = useCallback((id: number, multiSelect: boolean = false) => {
    if (multiSelect) {
      const current = selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];
      setSelectedIds(current);
    } else {
      setSelectedIds([id]);
    }
  }, [selectedIds, setSelectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, [setSelectedIds]);

  const selectMultiple = useCallback((ids: number[]) => {
    if (ids.length > 0) {
      setSelectedIds(ids);
    }
  }, [setSelectedIds]);

  const getSelectedElements = useCallback(() => {
    return elements.filter((el) => selectedIds.includes(el.id));
  }, [elements, selectedIds]);

  return {
    selectedIds,
    selectElement,
    clearSelection,
    selectMultiple,
    getSelectedElements,
  };
};
