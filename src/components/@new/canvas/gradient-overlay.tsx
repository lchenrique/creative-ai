import { extractGradientData } from "@/lib/utils";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

interface GradientOverlayProps {
    value?: string;
    onChange?: (value: string) => void;
    children: ReactNode;
}

// Converte ângulo CSS para coordenadas
const angleToCoords = (angle: number, width: number, height: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    const cx = width / 2;
    const cy = height / 2;
    const length = Math.max(width, height);

    return {
        x1: cx - Math.cos(rad) * length / 2,
        y1: cy - Math.sin(rad) * length / 2,
        x2: cx + Math.cos(rad) * length / 2,
        y2: cy + Math.sin(rad) * length / 2,
    };
};

export const GradientOverlay = ({ value, onChange, children }: GradientOverlayProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 320, height: 200 });

    const [type, setType] = useState<"linear" | "radial">("linear");
    const [stops, setStops] = useState([
        { offset: 0, color: "#ff6b00" },
        { offset: 100, color: "#64b5ff" },
    ]);

    const [point1Pos, setPoint1Pos] = useState({ x: 50, y: 50 });
    const [point2Pos, setPoint2Pos] = useState({ x: 270, y: 150 });

    const pointSize = 20;

    // Get dimensions from container
    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDimensions({ width: rect.width, height: rect.height });

            // Update point positions to fit new dimensions
            setPoint2Pos({ x: rect.width - 50, y: rect.height - 50 });
        }
    }, []);

    // Parse value prop on mount
    useEffect(() => {
        if (value && dimensions.width > 0) {
            const data = extractGradientData(value);
            if (data) {
                setType(value.startsWith("radial") ? "radial" : "linear");
                setStops(data.stops);
                // Update point positions based on angle
                const coords = angleToCoords(data.angle, dimensions.width, dimensions.height);
                const clamp = (val: number, max: number) => Math.max(0, Math.min(val, max - pointSize));
                setPoint1Pos({ x: clamp(coords.x1, dimensions.width), y: clamp(coords.y1, dimensions.height) });
                setPoint2Pos({ x: clamp(coords.x2, dimensions.width), y: clamp(coords.y2, dimensions.height) });
            }
        }
    }, [value, dimensions]);

    // Centros dos pontos
    const center1 = { x: point1Pos.x + pointSize / 2, y: point1Pos.y + pointSize / 2 };
    const center2 = { x: point2Pos.x + pointSize / 2, y: point2Pos.y + pointSize / 2 };

    // Calcular distância entre centros
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calcular ângulo em graus (baseado nos centros)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Calcular percentagens baseado na projeção ao longo do eixo do gradiente
    const gradientLength = distance || 1;

    // Normalizar direção do gradiente
    const dirX = dx / gradientLength;
    const dirY = dy / gradientLength;

    // Projetar os cantos da área no eixo do gradiente
    const corners = [
        { x: 0, y: 0 },
        { x: dimensions.width, y: 0 },
        { x: 0, y: dimensions.height },
        { x: dimensions.width, y: dimensions.height }
    ];

    const projections = corners.map(corner => {
        const relX = corner.x - center1.x;
        const relY = corner.y - center1.y;
        return relX * dirX + relY * dirY;
    });

    const minProj = Math.min(...projections);
    const maxProj = Math.max(...projections);
    const projRange = maxProj - minProj || 1;

    // Calcular percentagens precisas
    const percentage1 = Math.round(((0 - minProj) / projRange) * 100);
    const percentage2 = Math.round(((gradientLength - minProj) / projRange) * 100);

    // Generate CSS string from current state
    const generateGradientCSS = () => {
        return type === "linear"
            ? `linear-gradient(${angle + 90}deg, ${stops.map((stop) => {
                const pos = percentage1 + (stop.offset / 100) * (percentage2 - percentage1);
                return `${stop.color} ${pos}%`;
            }).join(", ")})`
            : `radial-gradient(circle at ${(center1.x / dimensions.width) * 100}% ${(center1.y / dimensions.height) * 100}%, ${stops.map((stop) => {
                const radius = (stop.offset / 100) * distance;
                return `${stop.color} ${radius}px`;
            }).join(", ")})`
    };

    // Call onChange when state changes
    useEffect(() => {
        if (onChange) {
            onChange(generateGradientCSS());
        }
    }, [type, stops, point1Pos, point2Pos]);

    return (
        <div ref={containerRef} className="relative" style={{ width: "100%", height: "100%" }}>
            {/* Children with gradient background */}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: generateGradientCSS(),
                }}
            >
                {children}
            </div>

            {/* POINT 1 */}
            <Rnd
                size={{ width: pointSize, height: pointSize }}
                position={point1Pos}
                bounds="parent"
                onDrag={(e, d) => {
                    setPoint1Pos({ x: d.x, y: d.y })
                }}
                enableResizing={false}
                style={{
                    backgroundColor: "transparent",
                    border: "2px solid white",
                    borderRadius: "50%",
                    position: "absolute",
                    zIndex: 10,
                    mixBlendMode: "difference",
                }}
            />

            {/* POINT 2 */}
            <Rnd
                size={{ width: pointSize, height: pointSize }}
                position={point2Pos}
                bounds="parent"
                onDrag={(e, d) => setPoint2Pos({ x: d.x, y: d.y })}
                enableResizing={false}
                style={{
                    backgroundColor: "transparent",
                    border: "2px solid white",
                    borderRadius: "50%",
                    position: "absolute",
                    zIndex: 10,
                    mixBlendMode: "difference",
                }}
            />
        </div>
    );
};
