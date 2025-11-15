import Moveable from "react-moveable";
import { forwardRef } from "react";
import { useKeycon } from "react-keycon";
import type { CanvasElement } from "@/stores/creative-store";

interface MoveableControllerProps {
  targets: HTMLDivElement[];
  elements: CanvasElement[];
  isEditing: boolean;
  useWarpable: boolean;
  useClippable: boolean;
  elementGuidelines: HTMLDivElement[];
  showHandles: boolean;
  selectedIds: number[];
  onSelectForDrag: (id: number) => void;
  onDragStart: () => void;
  onDragEnd: (id: number, x: number, y: number) => void;
  onDragGroupEnd: (
    updates: Array<{ id: number; x: number; y: number }>,
  ) => void;
  onResizeStart: () => void;
  onResizeEnd: (
    id: number,
    updates: { x: number; y: number; w: number; h: number; fontSize?: number },
  ) => void;
  onResizeGroupEnd: (
    updates: Array<{ id: number; x: number; y: number; w: number; h: number }>,
  ) => void;
  onRotateStart: () => void;
  onRotateEnd: (
    id: number,
    updates: { x: number; y: number; angle: number },
  ) => void;
  onRotateGroupEnd: (
    updates: Array<{ id: number; x: number; y: number; angle: number }>,
  ) => void;
  onWarpStart: () => void;
  onWarpEnd: () => void;
  onClip: (target: HTMLElement, clipStyle: string) => void;
}

export const MoveableController = forwardRef<Moveable, MoveableControllerProps>(
  (
    {
      targets,
      elements,
      isEditing,
      useWarpable,
      useClippable,
      elementGuidelines,
      showHandles,
      selectedIds,
      onSelectForDrag,
      onDragStart,
      onDragEnd,
      onDragGroupEnd,
      onResizeStart,
      onResizeEnd,
      onResizeGroupEnd,
      onRotateStart,
      onRotateEnd,
      onRotateGroupEnd,
      onWarpStart,
      onWarpEnd,
      onClip,
    },
    ref,
  ) => {
    const { isKeydown: isShift } = useKeycon({ keys: "shift" });

    if (targets.length === 0) return null;

    // Drag handlers
    const handleDragStart = (e: any) => {
      const draggedId = Number(e.target.getAttribute("data-element-id"));
      // Se arrastar elemento não selecionado, seleciona antes
      if (!isNaN(draggedId) && !selectedIds.includes(draggedId)) {
        onSelectForDrag(draggedId);
      }
      onDragStart();
    };

    const handleDrag = (e: any) => {
      if (targets.length === 1) {
        e.target.style.transform = e.transform;
      }
    };

    const handleDragEnd = (e: any) => {
      if (targets.length === 1 && e.lastEvent?.translate) {
        const translate = e.lastEvent.translate;
        const id = Number(e.target.getAttribute("data-element-id"));
        if (!isNaN(id)) {
          onDragEnd(id, translate[0], translate[1]);
        }
      }
    };

    const handleDragGroup = (e: any) => {
      e.events.forEach((ev: any) => {
        ev.target.style.transform = ev.transform;
      });
    };

    const handleDragGroupEnd = (e: any) => {
      const updates = e.events
        .filter((ev: any) => ev.lastEvent?.translate)
        .map((ev: any) => {
          const translate = ev.lastEvent!.translate;
          const id = Number(ev.target.getAttribute("data-element-id"));
          return { id, x: translate[0], y: translate[1] };
        })
        .filter((u: any) => !isNaN(u.id));
      onDragGroupEnd(updates);
    };

    // Resize handlers
    const handleResize = (e: any) => {
      e.target.style.width = `${e.width}px`;
      e.target.style.height = `${e.height}px`;
      e.target.style.transform = e.drag.transform;
    };

    const handleResizeEnd = (e: any) => {
      if (!e.lastEvent) return;
      const translate = e.lastEvent.drag.translate;
      const id = Number(e.target.getAttribute("data-element-id"));

      if (!isNaN(id) && e.lastEvent.width && e.lastEvent.height) {
        const element = elements.find((el) => el.id === id);

        // Para elementos de texto, pega o fontSize calculado
        let fontSize: number | undefined;
        if (element?.type === "text") {
          const calculatedFontSize = Number(
            e.target.getAttribute("data-calculated-fontsize"),
          );
          fontSize = !isNaN(calculatedFontSize)
            ? calculatedFontSize
            : e.lastEvent.height;
        }

        onResizeEnd(id, {
          x: translate[0],
          y: translate[1],
          w: e.lastEvent.width,
          h: e.lastEvent.height,
          fontSize,
        });
      }
    };

    const handleResizeGroup = (e: any) => {
      e.events.forEach((ev: any) => {
        ev.target.style.width = `${ev.width}px`;
        ev.target.style.height = `${ev.height}px`;
        ev.target.style.transform = ev.drag.transform;
      });
    };

    const handleResizeGroupEnd = (e: any) => {
      const updates = e.events
        .filter((ev: any) => ev.lastEvent)
        .map((ev: any) => {
          const translate = ev.lastEvent!.drag.translate;
          const id = Number(ev.target.getAttribute("data-element-id"));
          return {
            id,
            x: translate[0],
            y: translate[1],
            w: ev.lastEvent!.width,
            h: ev.lastEvent!.height,
          };
        })
        .filter((u: any) => !isNaN(u.id));
      onResizeGroupEnd(updates);
    };

    // Rotate handlers
    const handleRotate = (e: any) => {
      e.target.style.transform = e.drag.transform;
    };

    const handleRotateEnd = (e: any) => {
      if (!e.lastEvent?.drag.translate) return;
      const translate = e.lastEvent.drag.translate;
      const id = Number(e.target.getAttribute("data-element-id"));
      if (!isNaN(id)) {
        onRotateEnd(id, {
          x: translate[0],
          y: translate[1],
          angle: e.lastEvent.rotate,
        });
      }
    };

    const handleRotateGroup = (e: any) => {
      e.events.forEach((ev: any) => {
        ev.target.style.transform = ev.drag.transform;
      });
    };

    const handleRotateGroupEnd = (e: any) => {
      const updates = e.events
        .filter((ev: any) => ev.lastEvent?.drag.translate)
        .map((ev: any) => {
          const translate = ev.lastEvent!.drag.translate;
          const id = Number(ev.target.getAttribute("data-element-id"));
          return {
            id,
            x: translate[0],
            y: translate[1],
            angle: ev.lastEvent!.rotate,
          };
        })
        .filter((u: any) => !isNaN(u.id));
      onRotateGroupEnd(updates);
    };

    // Clip handler
    const handleClip = (e: any) => {
      const { target, clipStyle } = e;
      if (target.style) {
        target.style.clipPath = clipStyle;
        onClip(target, clipStyle);
      }
    };

    // Warp handler
    const handleWarp = (e: any) => {
      e.target.style.transform = e.transform;
    };

    return (
      <Moveable
        ref={ref}
        target={targets}
        dragArea={true}
        draggable={!isEditing}
        resizable={showHandles && !useWarpable && !isEditing}
        warpable={showHandles && useWarpable && !isEditing}
        rotatable={showHandles && !isEditing}
        clippable={showHandles && useClippable && !isEditing}
        hideDefaultLines={!showHandles}
        clipRelative={false}
        clipArea={true}
        dragWithClip={true}
        defaultClipPath={"inset"}
        keepRatio={isShift}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        throttleDrag={0}
        throttleResize={0}
        throttleRotate={5}
        edge={false}
        snappable={true}
        snapThreshold={5}
        isDisplaySnapDigit={true}
        snapGap={true}
        snapDigit={0}
        elementGuidelines={elementGuidelines}
        snapRotationThreshold={5}
        snapRotationDegrees={Array.from({ length: 72 }, (_, i) => i * 5)}
        origin={false}
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragGroup={handleDragGroup}
        onDragGroupStart={onDragStart}
        onDragGroupEnd={handleDragGroupEnd}
        onResize={handleResize}
        onResizeStart={onResizeStart}
        onResizeEnd={handleResizeEnd}
        onResizeGroup={handleResizeGroup}
        onResizeGroupStart={onResizeStart}
        onResizeGroupEnd={handleResizeGroupEnd}
        onRotate={handleRotate}
        onRotateStart={onRotateStart}
        onRotateEnd={handleRotateEnd}
        onRotateGroup={handleRotateGroup}
        onRotateGroupStart={onRotateStart}
        onRotateGroupEnd={handleRotateGroupEnd}
        onClip={handleClip}
        onWarpStart={onWarpStart}
        onWarp={handleWarp}
        onWarpEnd={onWarpEnd}
      />
    );
  },
);

MoveableController.displayName = "MoveableController";
