import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { ColorStop, GradientType, Point } from "@/types/gra";
import { projectPointOnLine } from "@/lib/geometry-utils";

interface GradientOverlayProps {
  type: GradientType;
  width: number;
  height: number;
  stops: ColorStop[];
  linearStart: Point;
  linearEnd: Point;
  activeStopId: string | null;
  onUpdateStop: (id: string, updates: Partial<ColorStop>) => void;
  onUpdatePoints: (start: Point, end: Point) => void;
  onSelectStop: (id: string) => void;
  onAddStop: (offset: number) => void;
}

export const GradientOverlay: React.FC<GradientOverlayProps> = (props) => {
  const {
    type,
    width,
    height,
    stops,
    linearStart,
    linearEnd,
    activeStopId,
    onUpdateStop,
    onUpdatePoints,
    onSelectStop,
    onAddStop,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);

  // Ref for props to use inside event listeners
  const propsRef = useRef(props);
  useLayoutEffect(() => {
    propsRef.current = props;
  });

  // Pixel coordinates of handles
  const x1 = linearStart.x * width;
  const y1 = linearStart.y * height;
  const x2 = linearEnd.x * width;
  const y2 = linearEnd.y * height;

  const handleMouseDownStop = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectStop(id);
    setDraggingItem(id);
  };

  const handleMouseDownHandle = (
    e: React.MouseEvent,
    handle: "start" | "end",
  ) => {
    e.stopPropagation();
    setDraggingItem(handle);
  };

  const handleMouseDownLine = (e: React.MouseEvent) => {
    // Add stop logic
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const t = projectPointOnLine(mx, my, x1, y1, x2, y2);
    const offset = Math.max(0, Math.min(100, t * 100));
    onAddStop(offset);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingItem || !containerRef.current) return;

      const {
        width: curW,
        height: curH,
        linearStart: curStart,
        linearEnd: curEnd,
        onUpdatePoints: triggerUpdatePoints,
        onUpdateStop: triggerUpdateStop,
      } = propsRef.current;

      const rect = containerRef.current.getBoundingClientRect();

      // Current Mouse Pos relative to container
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Normalized Mouse Pos (0-1)
      // Allow dragging outside container
      const nx = mx / curW;
      const ny = my / curH;

      if (draggingItem === "start") {
        triggerUpdatePoints({ x: nx, y: ny }, curEnd);
      } else if (draggingItem === "end") {
        triggerUpdatePoints(curStart, { x: nx, y: ny });
      } else {
        // Dragging a stop
        // Re-calculate line pixel coords from latest props (to be safe)
        const cx1 = curStart.x * curW;
        const cy1 = curStart.y * curH;
        const cx2 = curEnd.x * curW;
        const cy2 = curEnd.y * curH;

        const t = projectPointOnLine(mx, my, cx1, cy1, cx2, cy2);
        const offset = Math.max(0, Math.min(100, t * 100));
        triggerUpdateStop(draggingItem, { offset });
      }
    };

    const handleMouseUp = () => {
      setDraggingItem(null);
    };

    if (draggingItem) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingItem]);

  if (width === 0 || height === 0)
    return <div ref={containerRef} className="absolute inset-0" />;

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 select-none ">
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible ">
        {/* Shadow Line */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Main White Line */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Click Hit Area */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="transparent"
          strokeWidth="30"
          style={{ pointerEvents: "auto", cursor: "crosshair" }}
          onClick={handleMouseDownLine}
        />
      </svg>

      {/* Start Handle */}
      <div
        className="absolute w-6 h-6 bg-white shadow-lg border-2 border-slate-800 cursor-move z-30 flex items-center justify-center hover:scale-110 transition-transform rounded-full group"
        style={{
          left: x1,
          top: y1,
          transform: "translate(-50%, -50%)",
        }}
        onMouseDown={(e) => handleMouseDownHandle(e, "start")}
      >
        <div className="w-2 h-2 bg-slate-800 rounded-full" />
        <div className="absolute top-full mt-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Início
        </div>
      </div>

      {/* End Handle */}
      <div
        className="absolute w-6 h-6 bg-slate-900 shadow-lg border-2 border-white cursor-move z-30 flex items-center justify-center hover:scale-110 transition-transform rounded-full group"
        style={{
          left: x2,
          top: y2,
          transform: "translate(-50%, -50%)",
        }}
        onMouseDown={(e) => handleMouseDownHandle(e, "end")}
      >
        {type === "linear" && <div className="w-2 h-2 bg-white rounded-full" />}
        <div className="absolute top-full mt-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {type === "linear" ? "Fim" : "Raio"}
        </div>
      </div>

      {/* Color Stops */}
      {stops.map((stop) => {
        // Configuration: margin between color stops and start/end handles
        const COLOR_STOP_MARGIN = 0.1; // 10% margin on each side

        // Map stop offset (0-100%) to position with margin (10%-90% of the line)
        const t =
          COLOR_STOP_MARGIN + (stop.offset / 100) * (1 - 2 * COLOR_STOP_MARGIN);

        // Visual position with margin applied
        const sx = x1 + (x2 - x1) * t;
        const sy = y1 + (y2 - y1) * t;
        const isActive = activeStopId === stop.id;

        return (
          <div
            key={stop.id}
            className={`absolute w-6 h-6 rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing z-40 transition-transform flex items-center justify-center group ${
              isActive
                ? "border-blue-500 scale-110 ring-2 ring-white/80"
                : "border-white hover:scale-110"
            }`}
            style={{
              left: sx,
              top: sy,
              backgroundColor: stop.color,
              transform: "translate(-50%, -50%)",
            }}
            onMouseDown={(e) => handleMouseDownStop(e, stop.id)}
          >
            {/* Percentage Badge */}
            <div
              className="absolute top-full mt-2 bg-white/90 backdrop-blur-sm border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-[10px] font-mono text-slate-800 font-semibold whitespace-nowrap pointer-events-none select-none"
              style={{
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {Math.round(stop.offset)}%
            </div>
          </div>
        );
      })}
    </div>
  );
};
