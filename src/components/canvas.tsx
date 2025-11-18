import Moveable from "react-moveable";
import Selecto from "react-selecto";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Background } from "./art-background";
import { CanvasElementComponent } from "./canvas/canvas-element";
import { CanvasContextMenuActions } from "./canvas/canvas-context-menu-actions";
import { MoveableController } from "./canvas/moveable-controller";
import { useElementSelection } from "@/hooks/useElementSelection";
import { useElementOperations } from "@/hooks/useElementOperations";
import { useElementTransform } from "@/hooks/useElementTransform";
import { useImageConversion } from "@/hooks/useImageConversion";

const PAPER_WIDTH = 600;
const PAPER_HEIGHT = 600;

export const Canvas = () => {
  // Hooks
  const { selectedIds, selectElement, clearSelection, selectMultiple } =
    useElementSelection();
  const {
    elements,
    updateElement,
    deleteSelected,
    duplicateElements,
    bringToFront,
    sendToBack,
  } = useElementOperations();
  const { groupElements, ungroupElements, updateGroupTransform } =
    useElementTransform();
  const {
    isConverting,
    isConvertingWebP,
    isRemovingBackground,
    convertImageToSVG,
    convertToWebP,
    removeBackground,
  } = useImageConversion();

  // State
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [useWarpable, setUseWarpable] = useState(false);
  const [useClippable, setUseClippable] = useState(false);

  // Refs
  const targetRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const paperRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);

  // Handlers
  const handleDuplicate = () => {
    const newIds = duplicateElements(selectedIds);
    selectMultiple(newIds);
  };

  const handleGroup = () => {
    const groupId = groupElements(selectedIds);
    if (groupId) {
      selectMultiple([groupId]);
    }
  };

  const handleUngroup = () => {
    const childIds = ungroupElements(selectedIds);
    selectMultiple(childIds);
  };

  const handleConvertToSVG = async () => {
    if (selectedIds.length !== 1) return;
    try {
      await convertImageToSVG(selectedIds[0]);
    } catch (error) {
      alert("Erro ao converter imagem para SVG. Tente novamente.");
    }
  };

  const handleConvertToWebP = async () => {
    if (selectedIds.length !== 1) return;
    const element = elements.find((el) => el.id === selectedIds[0]);
    if (!element) return;

    try {
      await convertToWebP(
        element.id,
        element.svgContent,
        element.type === "image" ? element.image : undefined,
      );
    } catch (error) {
      alert("Erro ao converter para WebP. Tente novamente.");
    }
  };

  const handleRemoveBackground = async () => {
    if (selectedIds.length !== 1) return;
    try {
      await removeBackground(selectedIds[0]);
    } catch (error) {
      alert("Erro ao remover fundo. Tente novamente.");
    }
  };

  // Moveable handlers
  const handleDragEnd = (id: number, x: number, y: number) => {
    setIsDragging(false);
    const element = elements.find((el) => el.id === id);
    if (element?.isGroup) {
      updateGroupTransform(id, { x, y });
    } else {
      updateElement(id, { x, y });
    }
  };

  const handleDragGroupEnd = (
    updates: Array<{ id: number; x: number; y: number }>,
  ) => {
    setIsDragging(false);
    updates.forEach(({ id, x, y }) => {
      updateElement(id, { x, y });
    });
  };

  const handleResizeEnd = (
    id: number,
    updates: { x: number; y: number; w: number; h: number; fontSize?: number },
  ) => {
    setIsDragging(false);
    const element = elements.find((el) => el.id === id);
    if (element?.isGroup) {
      updateGroupTransform(id, updates);
    } else {
      updateElement(id, updates);
    }
  };

  const handleResizeGroupEnd = (
    updates: Array<{ id: number; x: number; y: number; w: number; h: number }>,
  ) => {
    setIsDragging(false);
    updates.forEach(({ id, x, y, w, h }) => {
      updateElement(id, { x, y, w, h });
    });
  };

  const handleRotateEnd = (
    id: number,
    updates: { x: number; y: number; angle: number },
  ) => {
    setIsDragging(false);
    const element = elements.find((el) => el.id === id);
    if (element?.isGroup) {
      updateGroupTransform(id, updates);
    } else {
      updateElement(id, updates);
    }
  };

  const handleRotateGroupEnd = (
    updates: Array<{ id: number; x: number; y: number; angle: number }>,
  ) => {
    setIsDragging(false);
    updates.forEach(({ id, x, y, angle }) => {
      updateElement(id, { x, y, angle });
    });
  };

  // Get selected targets for Moveable
  const getSelectedTargets = () => {
    return selectedIds
      .map((id) => targetRefs.current[id])
      .filter((ref) => ref !== null) as HTMLDivElement[];
  };

  // Get element guidelines (all elements except selected)
  const getElementGuidelines = () => {
    return Object.entries(targetRefs.current)
      .filter(
        ([id]) =>
          !selectedIds.includes(Number(id)) && targetRefs.current[Number(id)],
      )
      .map(([_, ref]) => ref!);
  };

  // Update Moveable when selection changes
  useEffect(() => {
    if (moveableRef.current) {
      moveableRef.current.updateRect();
    }
  }, [selectedIds]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        deleteSelected();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteSelected]);

  return (
    <div
      id="canvas-editor"
      className="relative w-full h-full bg-gray-300 flex flex-col items-center justify-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          clearSelection();
        }
      }}
    >
      <div className="flex-1 w-full bg-background z-50 pointer-events-none opacity-90" />

      <div
        className="flex items-center justify-center w-full"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            clearSelection();
          }
        }}
      >
        <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />

        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              id="canvas-paper"
              ref={paperRef}
              className="relative shadow-2xl bg-gray-800 row-start-2 col-start-2"
              style={{
                width: `${PAPER_WIDTH}px`,
                height: `${PAPER_HEIGHT}px`,
              }}
              onMouseDown={(e) => {
                if (e.target === paperRef.current) {
                  clearSelection();
                  setEditingId(null);
                }
              }}
            >
              <div className="pointer-events-none">
                <Background />
              </div>

              {/* Render elements */}
              {elements.map((el) => {
                // Don't render elements that belong to a group (they're rendered inside the group)
                if (el.groupId && !el.isGroup) return null;

                return (
                  <CanvasElementComponent
                    key={el.id}
                    element={el}
                    elements={elements}
                    isSelected={selectedIds.includes(el.id)}
                    isEditing={editingId === el.id}
                    onSelect={selectElement}
                    onEditStart={setEditingId}
                    onTextChange={(text) => updateElement(el.id, { text })}
                    onEditEnd={() => setEditingId(null)}
                    elementRef={(ref) => {
                      targetRefs.current[el.id] = ref;
                    }}
                  />
                );
              })}

              {/* Moveable controller */}
              <MoveableController
                ref={moveableRef}
                targets={getSelectedTargets()}
                elements={elements}
                isEditing={editingId !== null}
                useWarpable={useWarpable}
                useClippable={useClippable}
                elementGuidelines={getElementGuidelines()}
                showHandles={selectedIds.length > 0}
                selectedIds={selectedIds}
                onSelectForDrag={(id) => {
                  flushSync(() => {
                    selectElement(id, false);
                  });
                }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                onDragGroupEnd={handleDragGroupEnd}
                onResizeStart={() => setIsDragging(true)}
                onResizeEnd={handleResizeEnd}
                onResizeGroupEnd={handleResizeGroupEnd}
                onRotateStart={() => setIsDragging(true)}
                onRotateEnd={handleRotateEnd}
                onRotateGroupEnd={handleRotateGroupEnd}
                onWarpStart={() => setIsDragging(true)}
                onWarpEnd={() => setIsDragging(false)}
                onClip={(target, clipStyle) => {
                }}
              />
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-48">
            <CanvasContextMenuActions
              selectedIds={selectedIds}
              elements={elements}
              useWarpable={useWarpable}
              useClippable={useClippable}
              isConverting={isConverting}
              isConvertingWebP={isConvertingWebP}
              isRemovingBackground={isRemovingBackground}
              onDuplicate={handleDuplicate}
              onDelete={deleteSelected}
              onConvertToSVG={handleConvertToSVG}
              onConvertToWebP={handleConvertToWebP}
              onRemoveBackground={handleRemoveBackground}
              onGroup={handleGroup}
              onUngroup={handleUngroup}
              onBringToFront={() => bringToFront(selectedIds)}
              onSendToBack={() => sendToBack(selectedIds)}
              onToggleWarpable={setUseWarpable}
              onToggleClippable={() => setUseClippable(!useClippable)}
            />
          </ContextMenuContent>
        </ContextMenu>

        <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />
      </div>

      <div className="flex-1 w-full bg-background z-50 pointer-events-none opacity-90" />

      {/* Selecto for rectangle selection */}
      <Selecto
        container={paperRef.current}
        selectableTargets={[".element"]}
        hitRate={0}
        selectByClick={true}
        selectFromInside={false}
        toggleContinueSelect={["shift"]}
        continueSelect={false}
        ratio={0}
        preventClickEventOnDrag={true}
        dragCondition={(e) => {
          if (isDragging) return false;
          return true;
        }}
        onDragStart={(e) => {
          const inputEvent = e.inputEvent;
          const target = inputEvent.target as HTMLElement;

          console.log("Selecto onDragStart", {
            target: target.className,
            selectedIds,
            isMoveableElement: moveableRef.current?.isMoveableElement(target),
          });

          // Para se clicar em handles do Moveable
          if (moveableRef.current?.isMoveableElement(target)) {
            e.stop();
            return;
          }

          // Verifica se clicou em algum elemento (não no canvas vazio)
          const clickedElement = target.closest(".element") as HTMLElement;

          if (clickedElement) {
            // Só para o Selecto se clicar em um elemento já selecionado
            const clickedId = Number(
              clickedElement.getAttribute("data-element-id"),
            );

            if (!isNaN(clickedId) && selectedIds.includes(clickedId)) {
              e.stop();
            }
            // Se clicar em elemento não selecionado, deixa o Selecto selecionar
          }
          // Se não clicar em nenhum elemento (.element), deixa fazer seleção de retângulo
        }}
        onSelect={(e) => {
          // Seleciona elementos ao clicar
          const selected = e.selected
            .map((el) => Number(el.getAttribute("data-element-id")))
            .filter((id) => !isNaN(id));

          if (selected.length > 0) {
            selectMultiple(selected);
          }
        }}
        onSelectEnd={(e) => {
          const { isDragStart, selected, inputEvent } = e;

          if (isDragStart) {
            inputEvent.preventDefault();
          }

          const selectedIds = selected
            .map((el) => Number(el.getAttribute("data-element-id")))
            .filter((id) => !isNaN(id));

          if (selectedIds.length > 0) {
            selectMultiple(selectedIds);

            // Se começou a arrastar, aguarda o Moveable atualizar o target e inicia o drag
            if (isDragStart) {
              moveableRef.current?.waitToChangeTarget().then(() => {
                moveableRef.current?.dragStart(inputEvent);
              });
            }
          }
        }}
      />
    </div>
  );
};
