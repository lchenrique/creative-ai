import { useEffect } from "react";
import type { MoveableTargetGroupsType } from "react-moveable";

interface UseCanvasKeyboardProps {
  selectedIds: string[];
  clippableId: string | null;
  removeElement: ((id: string) => void) | undefined;
  setClippableId: (id: string | null) => void;
  setSelectedTargets: (targets: MoveableTargetGroupsType) => void;
  setSelectedIds: (ids: string[]) => void;
}

/**
 * Hook para gerenciar atalhos de teclado do canvas
 */
export const useCanvasKeyboard = ({
  selectedIds,
  clippableId,
  removeElement,
  setClippableId,
  setSelectedTargets,
  setSelectedIds,
}: UseCanvasKeyboardProps): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      // Escape para sair do modo clip
      if (e.key === "Escape" && clippableId) {
        e.preventDefault();
        setClippableId(null);
        return;
      }

      // Delete para remover elementos selecionados
      if (e.key === "Delete" && selectedIds.length > 0) {
        e.preventDefault();
        selectedIds.forEach((id) => {
          removeElement?.(id);
        });
        setSelectedTargets([]);
        setSelectedIds([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, removeElement, setSelectedTargets, clippableId, setClippableId, setSelectedIds]);
};
