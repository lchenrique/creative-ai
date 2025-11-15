import { useRef, useState } from "react";

import { deepFlat } from "@daybrush/utils";
import * as React from "react";
import { useKeycon } from "react-keycon";
import Selecto from "react-selecto";
import Moveable, { type MoveableTargetGroupsType } from "react-moveable";
import { GroupManager, type TargetList } from "@moveable/helper";
import { useCreativeStore, type CanvasElement } from "@/stores/creative-store";
import { CanvasElementComponent } from "./canvas/canvas-element";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { CanvasContextMenuActions } from "./canvas/canvas-context-menu-actions";
import { ShapeControls } from "./shape-controls";
import { Background } from "./art-background";

export function CanvasEditorTesting() {
  const { isKeydown: isCommand } = useKeycon({ keys: "meta" });
  const { isKeydown: isShift } = useKeycon({ keys: "shift" });
  const groupManagerRef = useRef<GroupManager>(null);
  const [targets, setTargets] = useState<MoveableTargetGroupsType>([]);
  const moveableRef = useRef<Moveable>(null);
  const selectoRef = useRef<Selecto>(null);
  const [elementGuidelines, setElementGuidelines] = useState<HTMLElement[]>([]);
  const [processingElementId, setProcessingElementId] = useState<number | null>(
    null,
  );
  const isResizingRef = useRef(false);

  // Store
  const elements = useCreativeStore((state) => state.canvasElements);

  const setCanvasElements = useCreativeStore(
    (state) => state.setCanvasElements,
  );
  const selectedIds = useCreativeStore((state) => state.selectedCanvasIds);
  const setSelectedCanvasIds = useCreativeStore(
    (state) => state.setSelectedCanvasIds,
  );
  const deleteSelected = useCreativeStore((state) => state.deleteSelected);
  const removeBackgroundFromStore = useCreativeStore(
    (state) => state.removeBackground,
  );

  const setSelectedTargets = React.useCallback(
    (nextTargetes: MoveableTargetGroupsType) => {
      if (!selectoRef.current) return;
      selectoRef.current!.setSelectedTargets(deepFlat(nextTargetes));
      setTargets(nextTargetes);

      // Atualiza as guidelines para excluir elementos selecionados
      const flatted = deepFlat(nextTargetes) as HTMLElement[];
      const allElements = Array.from(
        document.querySelectorAll(".element"),
      ) as HTMLElement[];
      const guidelines = allElements.filter((el) => !flatted.includes(el));
      setElementGuidelines(guidelines);

      // Atualiza a store com os IDs selecionados
      const ids = flatted
        .map((el) => Number(el.getAttribute("data-element-id")))
        .filter((id) => !isNaN(id));
      setSelectedCanvasIds(ids);
    },
    [setSelectedCanvasIds],
  );

  const handleDelete = React.useCallback(() => {
    deleteSelected();
    setSelectedTargets([]);
  }, [deleteSelected, setSelectedTargets]);

  const handleDuplicate = React.useCallback(() => {
    const maxId = Math.max(...elements.map((e) => e.id), 0);
    const newElements = selectedIds
      .map((id, index) => {
        const el = elements.find((e) => e.id === id);
        if (!el) return null;
        return {
          ...el,
          id: maxId + 1 + index,
          x: el.x + 20,
          y: el.y + 20,
        };
      })
      .filter((el): el is CanvasElement => el !== null);

    if (newElements.length > 0) {
      setCanvasElements((prev) => [...prev, ...newElements]);
    }
  }, [selectedIds, elements, setCanvasElements]);

  const handleBringToFront = React.useCallback(() => {
    setCanvasElements((prev) => {
      const selected = prev.filter((el) => selectedIds.includes(el.id));
      const others = prev.filter((el) => !selectedIds.includes(el.id));
      return [...others, ...selected];
    });
  }, [selectedIds, setCanvasElements]);

  const handleSendToBack = React.useCallback(() => {
    setCanvasElements((prev) => {
      const selected = prev.filter((el) => selectedIds.includes(el.id));
      const others = prev.filter((el) => !selectedIds.includes(el.id));
      return [...selected, ...others];
    });
  }, [selectedIds, setCanvasElements]);

  const handleRemoveBackground = React.useCallback(async () => {
    if (selectedIds.length !== 1) return;
    const elementId = selectedIds[0];
    const element = elements.find((el) => el.id === elementId);
    if (!element || element.type !== "image") {
      alert("Please select a single image to remove the background.");
      return;
    }

    setProcessingElementId(elementId);
    try {
      await removeBackgroundFromStore(elementId);
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Failed to remove background.");
    } finally {
      setProcessingElementId(null);
    }
  }, [selectedIds, elements, removeBackgroundFromStore]);

  // Keyboard shortcut for deleting elements
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Avoid deleting text if user is editing an input/textarea
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (event.key === "Delete") {
        handleDelete();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDelete]);

  React.useEffect(() => {
    // [[0, 1], 2], 3, 4, [5, 6], 7, 8, 9
    const elements = selectoRef.current!.getSelectableElements();

    if (elements.length > 7) {
      groupManagerRef.current = new GroupManager(
        [
          [[elements[0], elements[1]], elements[2]],
          [elements[5], elements[6], elements[7]],
        ],
        elements,
      );
    }
  }, [elements]);

  // Atualiza o Moveable quando as dimensões ou rotação mudam via ShapeControls
  React.useEffect(() => {
    if (
      !moveableRef.current ||
      selectedIds.length === 0 ||
      isResizingRef.current
    )
      return;

    const flatted = deepFlat(targets) as HTMLElement[];
    // flatted.forEach((target) => {
    //   const elementId = Number(target.getAttribute("data-element-id"));
    //   const element = elements.find((el) => el.id === elementId);

    //   if (element) {
    //     // Atualiza o estilo do elemento para refletir mudanças da store
    //     target.style.width = `${element.w}px`;
    //     target.style.height = `${element.h}px`;
    //     target.style.transform = `translate(${element.x}px, ${element.y}px) rotate(${element.angle}deg)`;
    //   }
    // });

    // Força o Moveable a atualizar
    moveableRef.current.updateRect();
  }, [elements, selectedIds, targets]);

  return (
    <div
      id="canvas-editor"
      className="root flex flex-col items-center justify-center w-full overflow-hidden"
      style={{
        height: "calc(100vh - 65px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e5e5e5",
        position: "relative",
      }}
    >
      <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />
      <div className="flex items-center justify-center w-full">
        <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className="container"
              style={{
                width: "600px",
                height: "600px",
                border: "1px solid #ccc",
                background: "#ffffff",
                position: "relative",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Background />
              <Moveable
                ref={moveableRef}
                draggable={true}
                resizable={true}
                rotatable={true}
                scalable={false}
                target={targets}
                // Todos os handles para todos os elementos
                renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
                // Aspect ratio travado apenas quando Shift pressionado
                keepRatio={isShift}
                snappable={true}
                isDisplaySnapDigit={true}
                snapGap={true}
                snapDirections={{
                  top: true,
                  left: true,
                  bottom: true,
                  right: true,
                  center: true,
                  middle: true,
                }}
                elementSnapDirections={{
                  top: true,
                  left: true,
                  bottom: true,
                  right: true,
                  center: true,
                  middle: true,
                }}
                snapThreshold={5}
                snapRotationDegrees={Array.from(
                  { length: 72 },
                  (_, i) => i * 5,
                )}
                verticalGuidelines={[0, 100, 200, 300, 400, 500, 600, 700, 800]}
                horizontalGuidelines={[0, 100, 200, 300, 400, 500, 600]}
                elementGuidelines={elementGuidelines}
                onClickGroup={(e) => {
                  if (!e.moveableTarget) {
                    setSelectedTargets([]);
                    return;
                  }
                  if (e.isDouble) {
                    const childs = groupManagerRef!.current!.selectSubChilds(
                      targets,
                      e.moveableTarget,
                    );

                    setSelectedTargets(childs.targets());
                    return;
                  }
                  if (e.isTrusted) {
                    selectoRef.current!.clickTarget(
                      e.inputEvent,
                      e.moveableTarget,
                    );
                  }
                }}
                onDrag={(e) => {
                  e.target.style.transform = e.transform;
                }}
                onDragEnd={(e) => {
                  const elementId = Number(
                    e.target.getAttribute("data-element-id"),
                  );
                  if (isNaN(elementId)) return;

                  // Pega os valores do lastEvent
                  const lastEvent = e.lastEvent;
                  if (!lastEvent || !lastEvent.translate) return;

                  // Salva a nova posição na store
                  const newX = lastEvent.translate[0];
                  const newY = lastEvent.translate[1];

                  setCanvasElements((prev) =>
                    prev.map((el) =>
                      el.id === elementId ? { ...el, x: newX, y: newY } : el,
                    ),
                  );
                }}
                onDragGroup={(e) => {
                  e.events.forEach((ev) => {
                    ev.target.style.transform = ev.transform;
                  });
                }}
                onResizeStart={() => {
                  isResizingRef.current = true;
                }}
                onResize={(e) => {
                  e.target.style.width = `${e.width}px`;
                  e.target.style.height = `${e.height}px`;
                  e.target.style.transform = e.drag.transform;
                }}
                onResizeEnd={(e) => {
                  const elementId = Number(
                    e.target.getAttribute("data-element-id"),
                  );
                  if (isNaN(elementId)) return;

                  const element = elements.find((el) => el.id === elementId);
                  if (!element) return;

                  // Pega os valores do lastEvent
                  const lastEvent = e.lastEvent;
                  if (!lastEvent) return;

                  const newWidth = lastEvent.width;
                  const newHeight = lastEvent.height;
                  const newX = lastEvent.drag.translate[0];
                  const newY = lastEvent.drag.translate[1];

                  console.log("onResizeEnd", {
                    elementId,
                    width: newWidth,
                    height: newHeight,
                    x: newX,
                    y: newY,
                  });

                  // Se for texto, atualiza também o fontSize
                  if (element.type === "text") {
                    const calculatedFontSize =
                      Number(
                        e.target.getAttribute("data-calculated-fontsize"),
                      ) || newHeight;

                    setCanvasElements((prev) =>
                      prev.map((el) =>
                        el.id === elementId
                          ? {
                              ...el,
                              fontSize: calculatedFontSize,
                              w: newWidth,
                              h: newHeight,
                              x: newX,
                              y: newY,
                            }
                          : el,
                      ),
                    );
                  } else {
                    // Para outros elementos, atualiza w, h, x e y
                    setCanvasElements((prev) =>
                      prev.map((el) =>
                        el.id === elementId
                          ? {
                              ...el,
                              w: newWidth,
                              h: newHeight,
                              x: newX,
                              y: newY,
                            }
                          : el,
                      ),
                    );
                  }

                  // Marca que terminou o resize DEPOIS de atualizar a store
                  setTimeout(() => {
                    isResizingRef.current = false;
                  }, 0);
                }}
                onResizeGroupStart={() => {
                  isResizingRef.current = true;
                }}
                onResizeGroup={(e) => {
                  e.events.forEach((ev) => {
                    ev.target.style.width = `${ev.width}px`;
                    ev.target.style.height = `${ev.height}px`;
                    ev.target.style.transform = ev.transform;
                  });
                }}
                onResizeGroupEnd={() => {
                  isResizingRef.current = false;
                }}
                onRotate={(e) => {
                  e.target.style.transform = e.transform;
                }}
                onRotateEnd={(e) => {
                  const elementId = Number(
                    e.target.getAttribute("data-element-id"),
                  );
                  if (isNaN(elementId)) return;

                  // Salva o novo ângulo na store
                  const newAngle = e.rotate;

                  setCanvasElements((prev) =>
                    prev.map((el) =>
                      el.id === elementId ? { ...el, angle: newAngle } : el,
                    ),
                  );
                }}
                onRotateGroup={(e) => {
                  e.events.forEach((ev) => {
                    ev.target.style.transform = ev.transform;
                  });
                }}
              ></Moveable>
              <Selecto
                ref={selectoRef}
                dragContainer={".root"}
                selectableTargets={[".selecto-area .element"]}
                hitRate={0}
                selectByClick={true}
                selectFromInside={false}
                toggleContinueSelect={["shift"]}
                ratio={0}
                onDragStart={(e) => {
                  const moveable = moveableRef.current!;
                  const target = e.inputEvent.target as HTMLElement;

                  // Ignora cliques em floating menus (como ShapeControls e ColorPicker)
                  if (target.closest('[data-slot="floating-menu-content"]')) {
                    e.stop();
                    return;
                  }

                  // Must have use deep flat
                  const flatted = targets.flat(3) as Array<
                    HTMLElement | SVGElement
                  >;
                  if (
                    moveable.isMoveableElement(target) ||
                    flatted.some((t) => t === target || t.contains(target))
                  ) {
                    e.stop();
                  }
                }}
                onSelectEnd={(e) => {
                  const {
                    isDragStartEnd,
                    isClick,
                    added,
                    removed,
                    inputEvent,
                    selected,
                  } = e;

                  // Ignora select em floating menus
                  const target = inputEvent.target as HTMLElement;
                  if (target.closest('[data-slot="floating-menu-content"]')) {
                    return;
                  }

                  const moveable = moveableRef.current!;

                  if (isDragStartEnd) {
                    inputEvent.preventDefault();

                    moveable.waitToChangeTarget().then(() => {
                      moveable.dragStart(inputEvent);
                    });
                  }
                  const groupManager = groupManagerRef.current;

                  if (!groupManager) {
                    e.currentTarget.setSelectedTargets(selected);
                    setSelectedTargets(selected);
                    return;
                  }

                  let nextChilds: TargetList;

                  if (isDragStartEnd || isClick) {
                    if (isCommand) {
                      nextChilds = groupManager.selectSingleChilds(
                        targets,
                        added,
                        removed,
                      );
                    } else {
                      nextChilds = groupManager.selectCompletedChilds(
                        targets,
                        added,
                        removed,
                        isShift,
                      );
                    }
                  } else {
                    nextChilds = groupManager.selectSameDepthChilds(
                      targets,
                      added,
                      removed,
                    );
                  }
                  e.currentTarget.setSelectedTargets(nextChilds.flatten());
                  setSelectedTargets(nextChilds.targets());
                }}
              ></Selecto>

              <div className="elements selecto-area">
                {elements.map((element) => (
                  <CanvasElementComponent
                    key={element.id}
                    element={element}
                    elements={elements}
                    isSelected={selectedIds.includes(element.id)}
                    isEditing={false}
                    isProcessing={processingElementId === element.id}
                    onSelect={() => {}}
                    onEditStart={() => {}}
                    onEditEnd={() => {}}
                  />
                ))}
              </div>
              <div className="empty elements"></div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <CanvasContextMenuActions
              selectedIds={selectedIds}
              elements={elements}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
              isRemovingBackground={processingElementId !== null}
              onRemoveBackground={handleRemoveBackground}
              // Dummy props for the rest
              useWarpable={false}
              useClippable={false}
              isConverting={false}
              isConvertingWebP={false}
              onConvertToSVG={() => alert("Not implemented")}
              onConvertToWebP={() => alert("Not implemented")}
              onGroup={() => alert("Not implemented")}
              onUngroup={() => alert("Not implemented")}
              onToggleWarpable={() => {}}
              onToggleClippable={() => {}}
            />
          </ContextMenuContent>
        </ContextMenu>
        <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />
      </div>

      <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />
    </div>
  );
}
