import { ColorPicker } from "@/components/color-picker";
import { Button } from "@creative-ds/ui";
import { Button as ButtonUI } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { gradientOptions } from "@/data/gradient-opttions";
import { useCallback, useState, useRef } from "react";
import type { ColorConfig } from ".";

interface ColorStop {
  id: string;
  color: string;
  position: number;
  opacity: number;
}

interface GradientTabProps {
  colorConfig: ColorConfig;
  setColorConfig: React.Dispatch<React.SetStateAction<ColorConfig>>;
}

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #ff6b9d 0%, #ffa657 50%, #ffe878 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)",
  "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)",
  "linear-gradient(to right, #f83600 0%, #f9d423 100%)",
];

export const GradientTab = ({
  colorConfig,
  setColorConfig,
}: GradientTabProps) => {
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [draggedLinearPoint, setDraggedLinearPoint] = useState<
    "start" | "end" | null
  >(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const gradientPreviewRef = useRef<HTMLDivElement>(null);

  const updateColorStop = useCallback(
    (id: string, updates: Partial<ColorStop>) => {
      setColorConfig((prev) => ({
        ...prev,
        gradient: {
          ...prev.gradient,
          stops: prev.gradient.stops.map((stop) =>
            stop.id === id ? { ...stop, ...updates } : stop,
          ),
        },
      }));
    },
    [setColorConfig],
  );

  const handleStopDrag = useCallback(
    (e: React.MouseEvent, stopId: string) => {
      const slider = sliderRef.current;
      if (!slider) return;

      const rect = slider.getBoundingClientRect();

      const updatePosition = (clientX: number) => {
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        updateColorStop(stopId, { position: Math.round(percentage) });
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        updatePosition(moveEvent.clientX);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      setSelectedStop(stopId);
      updatePosition(e.clientX);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [updateColorStop],
  );

  const applyPreset = useCallback(
    (presetGradient: string) => {
      const match = presetGradient.match(/linear-gradient\(([^,]+),\s*(.+)\)/);
      if (match) {
        const direction = match[1].trim();
        const stopsStr = match[2];

        let angle = 90;
        if (direction.includes("deg")) {
          angle = parseInt(direction);
        } else {
          const directionMap: { [key: string]: number } = {
            "to top": 0,
            "to right": 90,
            "to bottom": 180,
            "to left": 270,
            "to top right": 45,
            "to bottom right": 135,
            "to bottom left": 225,
            "to top left": 315,
          };
          angle = directionMap[direction] || 90;
        }

        const stops = stopsStr
          .split(",")
          .map((stop, index) => {
            const trimmedStop = stop.trim();
            const colorPosMatch = trimmedStop.match(
              /(#[a-fA-F0-9]{6})\s*(\d+)%/,
            );
            if (colorPosMatch) {
              return {
                id: (index + 1).toString(),
                color: colorPosMatch[1],
                position: parseInt(colorPosMatch[2]),
                opacity: 100,
              };
            }

            const colorMatch = trimmedStop.match(/(#[a-fA-F0-9]{6})/);
            if (colorMatch) {
              const totalStops = stopsStr.split(",").length;
              const position = Math.round((index / (totalStops - 1)) * 100);
              return {
                id: (index + 1).toString(),
                color: colorMatch[1],
                position: position,
                opacity: 100,
              };
            }

            return null;
          })
          .filter(Boolean) as ColorStop[];

        if (stops.length > 0) {
          setColorConfig((prev) => ({
            ...prev,
            colorType: "gradient",
            gradient: {
              ...prev.gradient,
              type: "linear",
              angle,
              stops,
              linearStart: undefined,
              linearEnd: undefined,
            },
          }));
        }
      }
    },
    [setColorConfig],
  );

  if (
    !colorConfig.gradient ||
    !colorConfig.gradient.stops ||
    colorConfig.gradient.stops.length === 0
  ) {
    return null;
  }

  // Calcular posições das bolinhas do linear
  const getLinearPoints = () => {
    // @ts-ignore - linearStart e linearEnd podem não existir no tipo
    if (colorConfig.gradient.linearStart && colorConfig.gradient.linearEnd) {
      return {
        // @ts-ignore
        start: colorConfig.gradient.linearStart,
        // @ts-ignore
        end: colorConfig.gradient.linearEnd,
      };
    }

    const angle = colorConfig.gradient.angle;
    const rad = ((angle - 90) * Math.PI) / 180;
    const distance = 35;

    return {
      start: {
        x: 50 - Math.cos(rad) * distance,
        y: 50 - Math.sin(rad) * distance,
      },
      end: {
        x: 50 + Math.cos(rad) * distance,
        y: 50 + Math.sin(rad) * distance,
      },
    };
  };

  const handleLinearPointDrag = useCallback(
    (e: React.MouseEvent, point: "start" | "end") => {
      const preview = gradientPreviewRef.current;
      if (!preview) return;

      const rect = preview.getBoundingClientRect();

      const updatePosition = (clientX: number, clientY: number) => {
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;

        setColorConfig((prev) => {
          const currentPoints = getLinearPoints();
          const currentStart = currentPoints.start;
          const currentEnd = currentPoints.end;

          const newStart =
            point === "start"
              ? {
                  x: Math.max(0, Math.min(100, Math.round(x))),
                  y: Math.max(0, Math.min(100, Math.round(y))),
                }
              : currentStart;
          const newEnd =
            point === "end"
              ? {
                  x: Math.max(0, Math.min(100, Math.round(x))),
                  y: Math.max(0, Math.min(100, Math.round(y))),
                }
              : currentEnd;

          // Calcular novo ângulo baseado nas posições
          const deltaX = newEnd.x - newStart.x;
          const deltaY = newEnd.y - newStart.y;
          let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
          angle = (angle + 90 + 360) % 360;

          return {
            ...prev,
            gradient: {
              ...prev.gradient,
              angle: Math.round(angle),
              // @ts-ignore
              linearStart: newStart,
              // @ts-ignore
              linearEnd: newEnd,
            },
          };
        });
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        updatePosition(moveEvent.clientX, moveEvent.clientY);
      };

      const handleMouseUp = () => {
        setDraggedLinearPoint(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      setDraggedLinearPoint(point);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [setColorConfig],
  );

  const getGradientBackground = () => {
    if (colorConfig.gradient.type === "radial") {
      const colorStops = colorConfig.gradient.stops
        .map((stop) => {
          const opacity = stop.opacity / 100;
          const hex = stop.color;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r},${g},${b},${opacity}) ${stop.position}%`;
        })
        .join(", ");
      const { x, y } = colorConfig.gradient.radialPosition;
      return `radial-gradient(circle at ${x}% ${y}%, ${colorStops})`;
    }

    // Para linear, mapear stops entre a posição das bolinhas
    const points = getLinearPoints();

    // Calcular a projeção das bolinhas na direção do gradiente
    const angle = colorConfig.gradient.angle;
    const rad = ((angle - 90) * Math.PI) / 180;

    // Vetor de direção do gradiente
    const gradientDirX = Math.cos(rad);
    const gradientDirY = Math.sin(rad);

    // Converter posições das bolinhas para coordenadas centradas (-50 a 50)
    const startX = points.start.x - 50;
    const startY = points.start.y - 50;
    const endX = points.end.x - 50;
    const endY = points.end.y - 50;

    // Projeção das bolinhas na direção do gradiente (produto escalar)
    const startProjection = startX * gradientDirX + startY * gradientDirY;
    const endProjection = endX * gradientDirX + endY * gradientDirY;

    // Converter projeções para porcentagem (0-100%)
    // Precisamos normalizar para que a distância máxima (70.71) = 100%
    const maxProj = 70.71;
    const startPercent = (startProjection / maxProj) * 50 + 50;
    const endPercent = (endProjection / maxProj) * 50 + 50;

    const colorStops = colorConfig.gradient.stops
      .map((stop) => {
        const opacity = stop.opacity / 100;
        const hex = stop.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        // Mapear stop.position (0-100) linearmente entre startPercent e endPercent
        const normalizedPos = stop.position / 100; // 0 a 1
        const adjustedPosition =
          startPercent + normalizedPos * (endPercent - startPercent);

        return `rgba(${r},${g},${b},${opacity}) ${Math.max(0, Math.min(100, adjustedPosition))}%`;
      })
      .join(", ");

    return `linear-gradient(${colorConfig.gradient.angle}deg, ${colorStops})`;
  };

  return (
    <TabsContent value="gradient" className="space-y-3 pt-3">
      {/* Visualização do gradiente */}
      <div
        ref={gradientPreviewRef}
        className="w-full h-32 rounded-lg border relative overflow-hidden cursor-pointer"
        style={{ background: getGradientBackground() }}
        onClick={(e) => {
          if (colorConfig.gradient.type === "radial") {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;
            setColorConfig((prev) => ({
              ...prev,
              gradient: {
                ...prev.gradient,
                radialPosition: {
                  x: Math.round(percentX),
                  y: Math.round(percentY),
                },
              },
            }));
          }
        }}
      >
        {/* Indicador de direção linear - duas bolinhas */}
        {colorConfig.gradient.type === "linear" &&
          (() => {
            const points = getLinearPoints();
            const firstStop = colorConfig.gradient.stops[0];
            const lastStop =
              colorConfig.gradient.stops[colorConfig.gradient.stops.length - 1];

            return (
              <>
                {/* Linha conectora */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full">
                  <line
                    x1={`${points.start.x}%`}
                    y1={`${points.start.y}%`}
                    x2={`${points.end.x}%`}
                    y2={`${points.end.y}%`}
                    stroke="white"
                    strokeWidth="2"
                    strokeOpacity="0.6"
                    strokeDasharray="4 2"
                  />
                </svg>

                {/* Bolinha de início (primeira cor do gradiente) */}
                <button
                  type="button"
                  data-slot="floating-menu-content"
                  className={`absolute w-5 h-5 rounded-full border-2 border-white cursor-grab active:cursor-grabbing shadow-lg transition-transform ${
                    draggedLinearPoint === "start" ? "scale-125" : ""
                  }`}
                  style={{
                    left: `${points.start.x}%`,
                    top: `${points.start.y}%`,
                    transform: "translate(-50%, -50%)",
                    background: firstStop?.color || "#000",
                  }}
                  onMouseDown={(e) => handleLinearPointDrag(e, "start")}
                >
                  <div className="absolute inset-0 border-2 border-black rounded-full opacity-30" />
                </button>

                {/* Bolinha de fim (última cor do gradiente) */}
                <button
                  type="button"
                  data-slot="floating-menu-content"
                  className={`absolute w-5 h-5 rounded-full border-2 border-white cursor-grab active:cursor-grabbing shadow-lg transition-transform ${
                    draggedLinearPoint === "end" ? "scale-125" : ""
                  }`}
                  style={{
                    left: `${points.end.x}%`,
                    top: `${points.end.y}%`,
                    transform: "translate(-50%, -50%)",
                    background: lastStop?.color || "#fff",
                  }}
                  onMouseDown={(e) => handleLinearPointDrag(e, "end")}
                >
                  <div className="absolute inset-0 border-2 border-black rounded-full opacity-30" />
                </button>
              </>
            );
          })()}

        {/* Indicador de posição radial */}
        {colorConfig.gradient.type === "radial" && (
          <div
            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
            style={{
              left: `${colorConfig.gradient.radialPosition.x}%`,
              top: `${colorConfig.gradient.radialPosition.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="absolute inset-0 border-2 border-black rounded-full opacity-30" />
          </div>
        )}
      </div>

      {/* Controle de tipo */}
      <div className="grid grid-cols-2 gap-2" data-slot="floating-menu-content">
        <Button
          className="w-full"
          variant={
            colorConfig.gradient.type === "linear" ? "default" : "outline"
          }
          onClick={() =>
            setColorConfig((prev) => ({
              ...prev,
              gradient: { ...prev.gradient, type: "linear" },
            }))
          }
        >
          Linear
        </Button>
        <Button
          className="w-full"
          variant={
            colorConfig.gradient.type === "radial" ? "default" : "outline"
          }
          onClick={() =>
            setColorConfig((prev) => ({
              ...prev,
              gradient: { ...prev.gradient, type: "radial" },
            }))
          }
        >
          Radial
        </Button>
      </div>

      {/* Color Pickers das cores do gradiente */}
      <div
        className="flex gap-2"
        data-slot="floating-menu-content"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {colorConfig.gradient.stops.map((stop, index) => (
          <div key={stop.id} className="flex-1">
            <ColorPicker
              background={stop.color}
              setBackground={(color) =>
                setColorConfig((prev) => ({
                  ...prev,
                  gradient: {
                    ...prev.gradient,
                    stops: prev.gradient.stops.map((s, idx) =>
                      idx === index ? { ...s, color } : s,
                    ),
                  },
                }))
              }
            />
          </div>
        ))}
      </div>

      {/* Presets de Gradiente */}
      <div className="grid grid-cols-3 gap-2">
        {GRADIENT_PRESETS.map((preset, index) => (
          <ButtonUI
            key={index}
            data-slot="floating-menu-content"
            variant="outline"
            className="h-10 p-0 overflow-hidden hover:scale-105 transition-transform"
            onClick={() => applyPreset(preset)}
          >
            <div
              className="w-full h-full rounded-sm"
              style={{ background: preset }}
            />
          </ButtonUI>
        ))}
      </div>
    </TabsContent>
  );
};
