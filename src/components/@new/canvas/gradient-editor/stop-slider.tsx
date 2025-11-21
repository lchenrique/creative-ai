import React, { useRef, useEffect, useState } from "react";
import type { ColorStop } from "@/types/gradient";
import { generatePreviewBackground } from "@/lib/gradient-utils";
import { Trash2 } from "lucide-react";

interface StopSliderProps {
  stops: ColorStop[];
  activeStopId: string | null;
  onUpdateStop: (id: string, updates: Partial<ColorStop>) => void;
  onSelectStop: (id: string) => void;
  onAddStop: (offset: number) => void;
  onDeleteStop: (id: string) => void;
}

export const StopSlider: React.FC<StopSliderProps> = ({
  stops,
  activeStopId,
  onUpdateStop,
  onSelectStop,
  onAddStop,
  onDeleteStop,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectStop(id);
    setIsDragging(id);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    // Only add if not clicking an existing thumb
    if ((e.target as HTMLElement).closest("[data-thumb]")) return;

    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    onAddStop(percent);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      let percent = ((e.clientX - rect.left) / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));

      onUpdateStop(isDragging, { offset: percent });
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onUpdateStop]);

  const backgroundStyle = generatePreviewBackground(stops);

  return (
    <div className="flex flex-col gap-4 select-none pt-2 ">
      {/* Track Area */}
      <div
        ref={trackRef}
        className="relative h-2 w-full rounded-full cursor-crosshair shadow-inner ring-1 ring-black/5"
        style={{ background: backgroundStyle }}
        onClick={handleTrackClick}
      >
        {/* Checkerboard pattern behind */}
        <div className="absolute inset-0 -z-10 bg-checkerboard opacity-20 rounded-full"></div>

        {stops.map((stop) => (
          <div
            key={stop.id}
            data-thumb="true"
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 shadow-md cursor-grab active:cursor-grabbing transition-transform hover:scale-110 flex items-center justify-center group ${
              activeStopId === stop.id
                ? "border-blue-500 z-20 scale-110"
                : "border-white z-10"
            }`}
            style={{ left: `${stop.offset}%`, backgroundColor: stop.color }}
            onMouseDown={(e) => handleMouseDown(e, stop.id)}
          >
            {/* Percentage Label Badge - Always visible matching the design */}
            <div className="absolute top-full mt-2 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-[10px] font-mono text-slate-600 whitespace-nowrap z-50 pointer-events-none font-semibold">
              {Math.round(stop.offset)}%
            </div>

            {/* Mini delete button appearing on hover if more than 2 stops */}
            {stops.length > 2 && activeStopId === stop.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStop(stop.id);
                }}
                className="absolute -top-8 bg-slate-800 text-white p-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
