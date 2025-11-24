import { Background } from "@/components/art-background";
import { useCanvasStore } from "@/stores/canva-store";
import { deepFlat } from "@daybrush/utils";
import { GroupManager } from "@moveable/helper";
import * as React from "react";
import { useCallback } from "react";
import Moveable, { type MoveableTargetGroupsType } from "react-moveable";
import Selecto from "react-selecto";
import { canvasActions } from "./canvas-actions";
import { Editable } from "./editable-able";
import { Elements, Menu } from "./elements/elements";
import { ClipPathEditor } from "./path-editor/path-editor";
import { useCanvasKeyboard } from "./path-editor/hooks/use-canvas-keyboard";
import { useClipPathEditor } from "./path-editor/hooks/use-clip-path-editor";
import {
  handleTextResize,
  handleTextResizeStart,
} from "./handlers/text-resize-handler";

export default function Canvas() {
  const groupManager = React.useMemo<GroupManager>(
    () => new GroupManager([]),
    [],
  );
  const [targets, setTargets] = React.useState<MoveableTargetGroupsType>([]);
  const moveableRef = React.useRef<Moveable>(null);
  const selectoRef = React.useRef<Selecto>(null);
  const [elementGuidelines] = React.useState<HTMLElement[]>([]);
  // Store
  const updateElementConfig = useCanvasStore(
    (state) => state.updateElementConfig,
  );
  const elements = useCanvasStore((state) => state.elements);
  const removeElement = useCanvasStore((state) => state.removeElement);
  const setBgSlected = useCanvasStore((state) => state.setBgSlected);
  const selectedIds = useCanvasStore((state) => state.selectedIds);
  const setSelectedIds = useCanvasStore((state) => state.setSelectedIds);

  // Text editing mode state
  const [editingTextId, setEditingTextId] = React.useState<string | null>(null);

  // ClipPath editor hook
  const {
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
  } = useClipPathEditor({ elements, updateElementConfig });
  const setSelectedTargets = React.useCallback(
    (nextTargetes: MoveableTargetGroupsType) => {
      selectoRef.current!.setSelectedTargets(deepFlat(nextTargetes));
      setTargets(nextTargetes);
    },
    [],
  );

  // Handle element deletion
  const handleDeleteElement = useCallback(
    (elementId: string) => {
      if (removeElement) {
        removeElement(elementId);
        setSelectedTargets([]);
        setSelectedIds([]);
      }
    },
    [removeElement, setSelectedTargets],
  );

  React.useEffect(() => {
    // [[0, 1], 2], 3, 4, [5, 6], 7, 8, 9
    const elements = selectoRef.current!.getSelectableElements();

    groupManager.set([], elements);
  }, []);

  // Keyboard shortcuts (Delete, Escape)
  useCanvasKeyboard({
    selectedIds,
    clippableId,
    removeElement,
    setClippableId,
    setSelectedTargets,
    setSelectedIds,
  });

  // Listener para atualizar Moveable quando fonte/tamanho mudar
  React.useEffect(() => {
    const handleMoveableUpdate = () => {
      moveableRef.current?.updateRect();
    };
    window.addEventListener("moveable-update-rect", handleMoveableUpdate);
    return () => {
      window.removeEventListener("moveable-update-rect", handleMoveableUpdate);
    };
  }, []);

  const onDragStart = useCallback(
    (e: any) => {
      const moveable = moveableRef.current!;
      const target = e.inputEvent.target;
      const flatted = deepFlat(targets);

      // Verificar se há algum popover aberto (Radix usa portal)
      const hasOpenPopover = document.querySelector(
        "[data-radix-popper-content-wrapper]",
      );

      // Ignorar cliques em menus flutuantes, popovers e modais
      if (
        hasOpenPopover ||
        target.closest('[data-slot="floating-menu-content"]') ||
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest('[role="dialog"]') ||
        target.closest(".react-colorful")
      ) {
        e.stop();
        return;
      }
      if (
        target.tagName === "BUTTON" ||
        moveable.isMoveableElement(target) ||
        flatted.some((t) => t === target || t.contains(target))
      ) {
        e.stop();
      }
      e.data.startTargets = targets;
    },
    [targets],
  );

  const onClickGroup = useCallback(
    (e: any) => {
      // When in clip mode, handle exit conditions
      if (clippableId) {
        const target = e.inputEvent?.target as HTMLElement;
        // Ignore clicks on SVG elements (clip editor)
        const tagName = target?.tagName?.toLowerCase();
        const isClipEditorElement =
          tagName === "svg" ||
          tagName === "circle" ||
          tagName === "path" ||
          tagName === "line" ||
          tagName === "rect" ||
          tagName === "text";

        if (isClipEditorElement) {
          return;
        }

        // Double-click exits clip mode (outside or on any element)
        if (e.isDouble) {
          setClippableId(null);
          return;
        }
        return;
      }

      if (!e.moveableTarget) {
        setSelectedTargets([]);
        return;
      }
      if (e.isDouble) {
        const targetId = e.moveableTarget.getAttribute("data-element-id");

        // Se já está em modo clippable no mesmo item, adiciona ponto na linha
        if (clippableId === targetId) {
          // Pegar posição do clique relativa ao elemento
          const rect = e.moveableTarget.getBoundingClientRect();
          const x = ((e.inputEvent.clientX - rect.left) / rect.width) * 100;
          const y = ((e.inputEvent.clientY - rect.top) / rect.height) * 100;

          // Parse current polygon
          const element = elements.find((el) => el.id === clippableId);
          const clipPath =
            element?.config.style.clipPath ||
            "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

          // Extract points from polygon
          const match = clipPath.match(/polygon\(([^)]+)\)/);
          if (match) {
            const pointsStr = match[1];
            const points = pointsStr.split(",").map((p) => p.trim());

            // Find the best edge to insert the new point
            const parsedPoints = points.map((p) => {
              const [px, py] = p.split(" ").map((v) => parseFloat(v));
              return { x: px, y: py };
            });

            // Find closest edge
            let minDist = Infinity;
            let insertIndex = 0;

            for (let i = 0; i < parsedPoints.length; i++) {
              const p1 = parsedPoints[i];
              const p2 = parsedPoints[(i + 1) % parsedPoints.length];

              // Distance from point to line segment
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const t = Math.max(
                0,
                Math.min(
                  1,
                  ((x - p1.x) * dx + (y - p1.y) * dy) / (dx * dx + dy * dy),
                ),
              );
              const projX = p1.x + t * dx;
              const projY = p1.y + t * dy;
              const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);

              if (dist < minDist) {
                minDist = dist;
                insertIndex = i + 1;
              }
            }

            // Tolerância em percentagem (aprox 10px em um elemento de 100px)
            const tolerance = 10;

            // Só adiciona ponto se clicou próximo da linha
            if (minDist > tolerance) {
              return;
            }

            // Insert new point
            parsedPoints.splice(insertIndex, 0, { x, y });

            // Build new polygon
            const newPolygon = `polygon(${parsedPoints.map((p) => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`).join(", ")})`;

            // Update store
            if (updateElementConfig && clippableId) {
              updateElementConfig(clippableId, {
                style: { clipPath: newPolygon },
              });
            }

            // Apply to element
            e.moveableTarget.style.clipPath = newPolygon;
          }
          return;
        }

        // Se clicou duas vezes no item selecionado
        const flatted = deepFlat(targets);
        const isCurrentlySelected = flatted.some((t) => t === e.moveableTarget);

        if (isCurrentlySelected && flatted.length === 1) {
          // Verificar se é um elemento de texto
          const element = elements.find((el) => el.id === targetId);
          if (element?.type === "text") {
            // Ativar modo de edição de texto
            setEditingTextId(targetId);
            return;
          }

          // Para outros tipos, ativa modo clippable
          setClippableId(targetId);
          return;
        }

        // Comportamento padrão para grupos
        const childs = groupManager.selectSubChilds(targets, e.moveableTarget);
        setSelectedTargets(childs.targets());
        return;
      }
      if (e.isTrusted) {
        selectoRef.current!.clickTarget(e.inputEvent, e.moveableTarget);
      }
    },
    [groupManager, setSelectedTargets, targets, clippableId],
  );

  const onSelect = useCallback(
    (e: any) => {
      const { startAdded, startRemoved, isDragStartEnd } = e;
      if (isDragStartEnd) {
        return;
      }
      const nextChilds = groupManager.selectSameDepthChilds(
        e.data.startTargets,
        startAdded,
        startRemoved,
      );

      setSelectedTargets(nextChilds.targets());
    },
    [groupManager, setSelectedTargets],
  );

  const onSelectEnd = useCallback(
    (e: any) => {
      // Ignore selection events when in clip mode
      if (clippableId) {
        return;
      }

      const { isDragStartEnd, inputEvent, selected } = e;
      const target = inputEvent.target as HTMLElement;

      // Verificar se há algum popover aberto (Radix usa portal)
      const hasOpenPopover = document.querySelector(
        "[data-radix-popper-content-wrapper]",
      );

      // Ignorar cliques em menus flutuantes, popovers e modais
      if (
        hasOpenPopover ||
        target.closest('[data-slot="floating-menu-content"]') ||
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest('[role="dialog"]') ||
        target.closest(".react-colorful")
      ) {
        return;
      }

      // Check if clicked on background
      if (
        target.closest("[data-canvas-background]") ||
        target.hasAttribute("data-canvas-background")
      ) {
        setBgSlected?.(true);
        setSelectedTargets([]);
        setSelectedIds([]);
        return;
      } else {
        // Deselect background when clicking elsewhere
        setBgSlected?.(false);
      }

      const moveable = moveableRef.current!;
      if (isDragStartEnd) {
        inputEvent.preventDefault();
        moveable.waitToChangeTarget().then(() => {
          moveable.dragStart(inputEvent);
        });
      }
      e.currentTarget.setSelectedTargets(selected);
      setSelectedTargets(selected);

      const newSelectedIds = selected.map((el: any) =>
        el.getAttribute("data-element-id"),
      ) as string[];
      setSelectedIds(newSelectedIds);

      // Desativar clippable se selecionou outro item
      if (clippableId && !newSelectedIds.includes(clippableId)) {
        setClippableId(null);
      }

      // Desativar edição de texto se selecionou outro item ou clicou fora
      if (editingTextId && !newSelectedIds.includes(editingTextId)) {
        setEditingTextId(null);
      }
    },
    [
      setSelectedTargets,
      clippableId,
      editingTextId,
      setBgSlected,
      setSelectedIds,
    ],
  );

  // Estado para controlar keepRatio dinamicamente durante resize/scale
  const [keepRatioForResize, setKeepRatioForResize] = React.useState(false);

  // Verificar se o elemento selecionado é texto (para usar scale ao invés de resize)
  const isTextSelected = React.useMemo(() => {
    if (selectedIds.length !== 1) return false;
    const element = elements.find((el) => el.id === selectedIds[0]);
    return element?.type === "text";
  }, [selectedIds, elements]);
  return (
    <div id="canvas-editor" className="root h-full">
      <div className=" h-full w-full flex items-center justify-center">
        <div style={{ width: 450, height: 800, position: "relative" }}>
          <div>
            <Background />
          </div>
          <Menu />

          <Moveable
            ref={moveableRef}
            ables={[Editable]}
            props={{
              editable: true,
              onDelete: handleDeleteElement,
            }}
            draggable={!clippableId && !editingTextId}
            rotatable={!clippableId && !editingTextId}
            resizable={!clippableId && !editingTextId}
            scalable={false}
            renderDirections={
              isTextSelected
                ? ["nw", "ne", "sw", "se", "e", "w"]
                : ["n", "nw", "ne", "s", "se", "sw", "e", "w"]
            }
            clippable={false}
            dragWithClip={false}
            target={targets}
            snapThreshold={5}
            snapRotationDegrees={Array.from({ length: 72 }, (_, i) => i * 5)}
            onClickGroup={onClickGroup}
            onClick={onClickGroup}
            verticalGuidelines={[0, 112.5, 225, 337.5, 450]}
            horizontalGuidelines={[0, 200, 400, 800]}
            elementGuidelines={elementGuidelines}
            snapDirections={canvasActions.snapDirections}
            elementSnapDirections={canvasActions.elementSnapDirections}
            keepRatio={keepRatioForResize}
            onDrag={(e) => {
              canvasActions.onDrag(e);
              // Update clippableRect when dragging the clippable element
              if (clippableId) {
                const el = e.target as HTMLElement;
                if (el.getAttribute("data-element-id") === clippableId) {
                  updateClippableRect(el);
                }
              }
            }}
            onRenderGroup={canvasActions.onRenderGroup}
            onResizeStart={(e) => {
              handleTextResizeStart(e, elements, setKeepRatioForResize);
            }}
            onResize={(e) => {
              const el = e.target as HTMLElement;
              const elementId = el.getAttribute("data-element-id");

              // Tenta processar como texto primeiro
              const wasTextHandled = handleTextResize(e, {
                elements,
                updateElementConfig,
                moveableRef,
              });

              // Se não foi texto, usa handler padrão
              if (!wasTextHandled) {
                canvasActions.onResize(e);
                if (elementId && updateElementConfig) {
                  updateElementConfig(elementId, {
                    size: { width: e.width, height: e.height },
                  });
                }
              }

              // Update clippableRect when resizing the clippable element
              if (clippableId && elementId === clippableId) {
                updateClippableRect(el, { width: e.width, height: e.height });
              }
            }}
            onResizeEnd={(e) => {
              const el = e.target as HTMLElement;
              const elementId = el.getAttribute("data-element-id");
              const element = (
                el.children.item(0) as HTMLElement
              ).children.item(0) as HTMLElement;
              const isTextElement =
                element?.getAttribute("data-element-type") === "text";

              if (elementId && updateElementConfig) {
                const newWidth = e.lastEvent?.width || el.offsetWidth;
                const newHeight = e.lastEvent?.height || el.clientHeight;

                if (isTextElement) {
                  el.style.height = `${element.clientHeight}px`;
                } else {
                  el.style.height = `${newHeight}px`;
                }

                el.style.width = `${newWidth}px`;
                updateElementConfig(elementId, {
                  size: {
                    width: newWidth,
                    height: isTextElement ? element.clientHeight : newHeight,
                  },
                });
                moveableRef.current?.updateRect();
              }
            }}
            onRotate={canvasActions.onRotate}
            onRotateEnd={(e) => canvasActions.onRotateEnd(e, () => { })}
            snappable={true}
            customClipPath={currentClipPath}
            isDisplaySnapDigit={true}
          ></Moveable>

          <Selecto
            ref={selectoRef}
            dragContainer={window}
            selectableTargets={[".selecto-area .cube"]}
            hitRate={0}
            selectByClick={true}
            selectFromInside={false}
            toggleContinueSelect={["shift"]}
            ratio={0}
            onDragStart={onDragStart}
            onSelect={onSelect}
            onSelectEnd={onSelectEnd}
          ></Selecto>
          <Elements
            selectedIds={selectedIds}
            editingTextId={editingTextId}
            onEditEnd={(elementId, newHeight) => {
              setEditingTextId(null);
              const element = elements.find(
                (element) => element.id === elementId,
              );

              // Atualiza altura após sair do modo edição
              if (elementId && newHeight) {
                updateElementConfig?.(elementId, {
                  size: {
                    height: newHeight,
                    width: element?.config?.size?.width || 0,
                  },
                });
              }

              // Atualiza o Moveable após React re-renderizar
              requestAnimationFrame(() => {
                moveableRef.current?.updateRect();
              });
            }}
          />

          {/* ClipPath Editor Overlay */}
          {clippableId && clippableRect && selectedType !== "text" && (
            <div
              className="absolute z-50 pointer-events-none"
              data-clip-editor
              style={{
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                overflow: "visible",
              }}
            >
              <div
                className="absolute pointer-events-auto"
                style={{
                  left: clippableRect.left,
                  top: clippableRect.top,
                  width: clippableRect.width,
                  height: clippableRect.height,
                  overflow: "visible",
                  transform: `rotate(${clippableRect.rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                {/* {clippableRect.rotation} */}
                <ClipPathEditor
                  width={clippableRect.width}
                  height={clippableRect.height}
                  rotation={clippableRect.rotation}
                  value={currentClipPath}
                  pathPoints={currentPathPoints}
                  onChange={onClipPathChange}
                  onClose={onClipPathClose}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
