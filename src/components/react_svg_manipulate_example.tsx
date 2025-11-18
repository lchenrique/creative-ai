import React, { useState, useRef, useEffect, use } from "react";
import {
  DndContext,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

interface DraggableHandleProps {
  index: number;
  point: { x: number; y: number };
  onDelete: (index: number) => void;
}

const DraggableHandle: React.FC<DraggableHandleProps> = ({
  index,
  point,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `handle-${index}`,
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={{
            position: "absolute",
            left: point.x,
            top: point.y,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "white",
            border: "2px solid red",
            cursor: "move",
            marginLeft: -6,
            marginTop: -6,
            zIndex: 10,
          }}
          {...listeners}
          {...attributes}
        />
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onDelete(index)}>
          Deletar ponto
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export interface MoveableSvgMaskProps {
  isClipping: boolean
  children: React.ReactNode;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  element?: any;
}

const MoveableSvgMask: React.FC<MoveableSvgMaskProps> = ({
  isClipping = false,
  element,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState([
    { x: element.x, y: element.y },
    { x: element.x + element.w, y: element.y },
    { x: element.x + element.w, y: element.h + element.y },
    { x: element.x, y: element.h + element.y },

  ]);


  const dragInfo = useRef<{
    startPoint: { x: number; y: number } | null;
    activeIndex: number | null;
  }>({
    startPoint: null,
    activeIndex: null,
  }).current;

  const sensors = useSensors(useSensor(PointerSensor));

  const getPathD = () =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ") +
    " Z";

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id.toString();
    if (!id.startsWith("handle-")) return;
    const index = parseInt(id.split("-")[1], 10);
    dragInfo.activeIndex = index;
    dragInfo.startPoint = { ...points[index] };
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (dragInfo.activeIndex === null || !dragInfo.startPoint) return;
    const { delta } = event;
    const newPoints = [...points];
    newPoints[dragInfo.activeIndex] = {
      x: dragInfo.startPoint.x + delta.x,
      y: dragInfo.startPoint.y + delta.y,
    };
    setPoints(newPoints);
  };

  const handleDragEnd = () => {
    dragInfo.activeIndex = null;
    dragInfo.startPoint = null;
  };

  const handleDeleteHandle = (index: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== index));
  };

  // Adição de ponto via double click
  const handlePathDoubleClick = (e: React.MouseEvent<SVGPathElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    let bestMatch = { index: -1, distance: Infinity, point: { x: 0, y: 0 } };

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      if (dx === 0 && dy === 0) continue;

      const t =
        ((clickPoint.x - p1.x) * dx + (clickPoint.y - p1.y) * dy) /
        (dx * dx + dy * dy);

      let closestPoint;
      if (t < 0) closestPoint = p1;
      else if (t > 1) closestPoint = p2;
      else closestPoint = { x: p1.x + t * dx, y: p1.y + t * dy };

      const dist = Math.hypot(
        clickPoint.x - closestPoint.x,
        clickPoint.y - closestPoint.y,
      );

      if (dist < bestMatch.distance) {
        bestMatch = { index: i + 1, distance: dist, point: closestPoint };
      }
    }

    if (bestMatch.index !== -1) {
      const newPoints = [
        ...points.slice(0, bestMatch.index),
        bestMatch.point,
        ...points.slice(bestMatch.index),
      ];
      setPoints(newPoints);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          left: 0,

        }}
      >
        {/* Div com máscara */}

        <div
          className="absolute"
          style={{
            width: "100%",
            height: "100%",

            backgroundSize: "cover",
            mask: "url(#mask)",
            WebkitMask: "url(#mask)",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "cover",
            WebkitMaskSize: "cover",
            left: 0,
            top: 0,

          }}
        >
          {children}
          {<svg width={0} height={0}>
            <defs>
              <mask id="mask">
                <rect width="100%" height="100%" fill="black" />
                <path d={getPathD()} fill="white" />
              </mask>
            </defs>
          </svg>}
        </div>
        {<div
          className="absolute overflow-visible top-0 "
        >
          {points.map((p, i) => (
            <DraggableHandle
              key={i}
              index={i}
              point={p}
              onDelete={handleDeleteHandle}
            />
          ))}
        </div>}

        {<>
          <svg
            width={"100%"}
            height={"100%"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",


            }}
          >
            <path
              d={getPathD()}
              fill="transparent"
              stroke="red"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          <svg
            width={0}
            height={0}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "all",
              zIndex: 5,

            }}
          >
            <path
              d={getPathD()}
              fill="transparent"
              stroke="red"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </>}

        {/* Handles */}
      </div>
    </DndContext >
  );
};

export default MoveableSvgMask;
