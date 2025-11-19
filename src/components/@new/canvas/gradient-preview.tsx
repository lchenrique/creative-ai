import { ColorPicker } from "@/components/color-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { extractGradientData } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Rnd } from "react-rnd";

interface GradientPreviewProps {
    value?: string;
    onChange?: (value: string) => void;
    minimal?: boolean;
}

const GRADIENT_PRESETS = [
    "linear-gradient(135deg, #1fa2ff 0%, #12d8fa 50%, #a6ffcb 100%)",
    "linear-gradient(90deg, #f12711 0%, #f5af19 100%)",
    "linear-gradient(180deg, #fc5c7d 0%, #6a82fb 100%)",
    "linear-gradient(45deg, #c33764 0%, #1d2671 100%)",
    "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
    "linear-gradient(90deg, #da4453 0%, #89216b 100%)",
    "linear-gradient(90deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)",
    "linear-gradient(180deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)",
    "linear-gradient(45deg, #f2709c 0%, #ff9472 100%)",
    "linear-gradient(45deg, #5f2c82 0%, #49a09d 100%)",
    "linear-gradient(135deg, #dd5e89 0%, #f7bb97 100%)",
    "linear-gradient(180deg, #1d2b64 0%, #f8cdda 100%)",
];

// Converte ângulo CSS para coordenadas SVG
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


export const GradientPreview = ({ value, onChange, minimal = false }: GradientPreviewProps) => {
    const width = 316;
    const height = 150;

    const [type, setType] = useState<"linear" | "radial">("linear");
    const [stops, setStops] = useState([
        { offset: 0, color: "#ff6b00" },
        { offset: 100, color: "#64b5ff" },
    ]);

    const [point1Pos, setPoint1Pos] = useState({ x: 50, y: 50 });
    const [point2Pos, setPoint2Pos] = useState({ x: 300, y: 150 });

    const pointSize = 20;

    // Parse value prop on mount
    useEffect(() => {
        if (value) {
            const data = extractGradientData(value);
            if (data) {
                setType(value.startsWith("radial") ? "radial" : "linear");
                setStops(data.stops);
                // Update point positions based on angle
                const coords = angleToCoords(data.angle, width, height);
                const clamp = (val: number, max: number) => Math.max(0, Math.min(val, max - pointSize));
                setPoint1Pos({ x: clamp(coords.x1, width), y: clamp(coords.y1, height) });
                setPoint2Pos({ x: clamp(coords.x2, width), y: clamp(coords.y2, height) });
            }
        }
    }, []);

    // Generate CSS string from current state
    const generateGradientCSS = () => {
        return type === "linear"
            ? `linear-gradient(${angle + 90}deg, ${stops.map((stop) => {
                // Interpolar a posição do stop entre percentage1 e percentage2
                const pos = percentage1 + (stop.offset / 100) * (percentage2 - percentage1);
                return `${stop.color} ${pos}%`;
            }).join(", ")})`
            : `radial-gradient(circle at ${(center1.x / width) * 100}% ${(center1.y / height) * 100}%, ${stops.map((stop) => {
                // O raio é a distância entre os dois pontos, cada stop usa sua percentagem desse raio
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

    const handlePresetClick = (css: string) => {
        const data = extractGradientData(css);
        if (data) {
            setStops(data.stops);
            // Atualiza posição dos pontos baseado no ângulo
            const coords = angleToCoords(data.angle, width, height);
            // Clampa as coordenadas para não sair do box
            const clamp = (val: number, max: number) => Math.max(0, Math.min(val, max - pointSize));
            setPoint1Pos({ x: clamp(coords.x1, width), y: clamp(coords.y1, height) });
            setPoint2Pos({ x: clamp(coords.x2, width), y: clamp(coords.y2, height) });
        }
    };


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
    const gradientLength = distance || 1; // evitar divisão por zero

    // Normalizar direção do gradiente
    const dirX = dx / gradientLength;
    const dirY = dy / gradientLength;

    // Projetar os cantos da área no eixo do gradiente para encontrar os limites
    const corners = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, y: height },
        { x: width, y: height }
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
    return (
        <div>


            <div className="relative" style={{ width, height }}>

                <div
                    className="rounded-lg"
                    style={{
                        width,
                        height,
                        backgroundImage: generateGradientCSS(),
                        backgroundSize: "100% 100%",
                        backgroundOrigin: "content-box"
                    }}
                />

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
            {!minimal && (
                <>
                    <ToggleGroup type="single" size="sm" className="bg-background w-full mt-4"  >
                        <ToggleGroupItem
                            className="flex-1"
                            value="linear"
                            onClick={() => setType("linear")}
                        >
                            Linear
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            className="flex-1"
                            value="radial"
                            onClick={() => setType("radial")}
                        >
                            Radial
                        </ToggleGroupItem>
                    </ToggleGroup>
                    {/* Color pickers conectados ao primeiro e último stop */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <ColorPicker
                            background={stops[0]?.color || "#000"}
                            setBackground={(color) => {
                                const newStops = [...stops];
                                if (newStops[0]) newStops[0].color = color;
                                setStops(newStops);
                            }}
                        />
                        <ColorPicker
                            background={stops[stops.length - 1]?.color || "#fff"}
                            setBackground={(color) => {
                                const newStops = [...stops];
                                if (newStops[newStops.length - 1]) newStops[newStops.length - 1].color = color;
                                setStops(newStops);
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {GRADIENT_PRESETS.map((preset, index) => (
                            <div
                                key={index}
                                data-slot="floating-menu-content"
                                className="h-10 p-0 overflow-hidden hover:border-accent transition-all border hover:shadow cursor-pointer"
                                style={{ background: preset }}
                                onClick={() => handlePresetClick(preset)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
