import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../ui/button";

interface Point {
  x: number;
  y: number;
}

interface ClipPathGeneratorProps {
  width?: number;
  height?: number;
  snap?: number;
  initialClipPath?: string;
  onSave: (clipPath: string) => void;
}

// Helper para converter polygon string para pontos
const parsePolygonString = (
  clipPath: string,
  width: number,
  height: number,
): Point[] | null => {
  if (!clipPath.startsWith("polygon(")) return null;

  try {
    const pointString = clipPath.substring(
      clipPath.indexOf("(") + 1,
      clipPath.lastIndexOf(")"),
    );
    const pairs = pointString.split(", ");

    return pairs.map((pair) => {
      const [xStr, yStr] = pair.split(" ");
      const x = (parseFloat(xStr) / 100) * width;
      const y = (parseFloat(yStr) / 100) * height;
      return { x, y };
    });
  } catch (e) {
    return null;
  }
};

export const ClipPathGenerator = ({
  width = 400,
  height = 300,
  snap = 1,
  initialClipPath,
  onSave,
}: ClipPathGeneratorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>(() => {
    if (initialClipPath) {
      const parsedPoints = parsePolygonString(initialClipPath, width, height);
      if (parsedPoints) return parsedPoints;
    }
    return [
      { x: 50, y: 50 },
      { x: 350, y: 50 },
      { x: 350, y: 250 },
      { x: 50, y: 250 },
    ];
  });
  const [dragging, setDragging] = useState<number | null>(null);

  const snapCoord = (value: number) => Math.round(value / snap) * snap;

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging === null) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      // Clamp dentro dos limites
      x = Math.max(0, Math.min(width, x));
      y = Math.max(0, Math.min(height, y));

      x = snapCoord(x);
      y = snapCoord(y);

      setPoints((prev) => {
        const copy = [...prev];
        copy[dragging] = { x, y };
        return copy;
      });
    },
    [dragging, snap, width, height],
  );

  const handleMouseUp = () => setDragging(null);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove]);

  const polygonStringForCss = points
    .map((p) => `${(p.x / width) * 100}% ${(p.y / height) * 100}%`)
    .join(", ");

  const polygonStringForSvg = points.map((p) => `${p.x},${p.y}`).join(" ");

  const pointToSegmentDistance = (p: Point, v: Point, w: Point) => {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(
      p.x - (v.x + t * (w.x - v.x)),
      p.y - (v.y + t * (w.y - v.y)),
    );
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = snapCoord(x);
    y = snapCoord(y);

    // Encontrar segmento mais próximo
    let closestIndex = 0;
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const dist = pointToSegmentDistance({ x, y }, p1, p2);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i + 1;
      }
    }

    setPoints((prev) => {
      const copy = [...prev];
      copy.splice(closestIndex, 0, { x, y });
      return copy;
    });
  };

  const removePoint = (index: number) => {
    if (points.length <= 3) {
      alert("Um polígono precisa de pelo menos 3 pontos.");
      return;
    }
    setPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(`polygon(${polygonStringForCss})`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative border rounded-md bg-gray-100"
        style={{ width, height, userSelect: "none" }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Fundo gradiente */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `polygon(${polygonStringForCss})`,
            background: "linear-gradient(135deg, #6b73ff, #000dff)",
            width: "100%",
            height: "100%",
          }}
        />

        {/* Linhas conectando os pontos */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polygon
            points={polygonStringForSvg}
            fill="rgba(255, 255, 255, 0.2)"
            stroke="white"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        </svg>

        {/* Pontos de edição */}
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute group"
            style={{ left: p.x, top: p.y, zIndex: 10 }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragging(i);
            }}
          >
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white cursor-grab bg-blue-500 shadow-md active:cursor-grabbing" />
            <div
              className="absolute -top-5 -right-3 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                removePoint(i);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              ✕
            </div>
          </div>
        ))}
      </div>
      <Button onClick={handleSave}>Salvar Máscara</Button>
    </div>
  );
};
