import * as React from "react";
import { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@creative-ds/ui";
import { BezierCurve, LineSegment, Trash } from "@phosphor-icons/react";
import {
    type PathPoint,
    type PointType,
    pointsToPath,
    pathToClipPath,
    polygonToPathPoints,
    createDefaultPoints,
    generatePointId,
} from "./types";

interface PathEditorProps {
    elementId: string;
    initialClipPath?: string;
    initialPoints?: PathPoint[]; // Original points with curves
    width: number;
    height: number;
    onClipPathChange: (clipPath: string, points: PathPoint[]) => void;
    onClose: () => void;
}

export function PathEditor({
    elementId,
    initialClipPath,
    initialPoints,
    width,
    height,
    onClipPathChange,
    onClose,
}: PathEditorProps) {
    // Use initial points if available, otherwise parse clip path or create default
    const [points, setPoints] = useState<PathPoint[]>(() => {
        // Prioritize saved points with curve data
        if (initialPoints && initialPoints.length > 0) {
            return initialPoints;
        }
        // Fallback to parsing clip path
        if (initialClipPath) {
            if (initialClipPath.includes('polygon')) {
                return polygonToPathPoints(initialClipPath);
            }
        }
        return createDefaultPoints();
    });

    const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
    const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
    const [draggingControlPoint, setDraggingControlPoint] = useState<'cp1' | 'cp2' | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [elementRect, setElementRect] = useState<DOMRect | null>(null);

    // Get element position relative to its parent container
    useEffect(() => {
        const element = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
        if (element) {
            const updateRect = () => {
                // Get the transform values from the element's style
                const style = element.style;
                const transform = style.transform || '';

                // Parse translate values from transform
                const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                let x = 0, y = 0;

                if (translateMatch) {
                    x = parseFloat(translateMatch[1]);
                    y = parseFloat(translateMatch[2]);
                } else {
                    // Fallback to offset
                    x = element.offsetLeft;
                    y = element.offsetTop;
                }

                setElementRect(new DOMRect(
                    x,
                    y,
                    element.offsetWidth,
                    element.offsetHeight
                ));
            };
            updateRect();
            // Update on resize
            const observer = new ResizeObserver(updateRect);
            observer.observe(element);
            return () => observer.disconnect();
        }
    }, [elementId]);

    // Update clip-path when points change
    useEffect(() => {
        const clipPath = pathToClipPath(points);
        onClipPathChange(clipPath, points);
    }, [points, onClipPathChange]);

    // Convert screen coordinates to SVG percentage
    const screenToSvg = useCallback((clientX: number, clientY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };

        const rect = svgRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;

        // Allow points outside bounds for creative clipping
        return { x, y };
    }, []);

    // Handle mouse down on point
    const handlePointMouseDown = useCallback((e: React.MouseEvent, pointId: string) => {
        e.stopPropagation();
        setSelectedPointId(pointId);
        setDraggingPointId(pointId);
        setDraggingControlPoint(null);
    }, []);

    // Handle mouse down on control point
    const handleControlPointMouseDown = useCallback((e: React.MouseEvent, pointId: string, cpType: 'cp1' | 'cp2') => {
        e.stopPropagation();
        setSelectedPointId(pointId);
        setDraggingPointId(pointId);
        setDraggingControlPoint(cpType);
    }, []);

    // Handle mouse move
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!draggingPointId) return;

        const pos = screenToSvg(e.clientX, e.clientY);

        setPoints(prev => prev.map(point => {
            if (point.id !== draggingPointId) return point;

            if (draggingControlPoint === 'cp1') {
                return { ...point, cp1: pos };
            } else if (draggingControlPoint === 'cp2') {
                return { ...point, cp2: pos };
            } else {
                // Moving the main point
                // Also move control points relative to the point
                const dx = pos.x - point.x;
                const dy = pos.y - point.y;

                return {
                    ...point,
                    x: pos.x,
                    y: pos.y,
                    cp1: point.cp1 ? { x: point.cp1.x + dx, y: point.cp1.y + dy } : undefined,
                    cp2: point.cp2 ? { x: point.cp2.x + dx, y: point.cp2.y + dy } : undefined,
                };
            }
        }));
    }, [draggingPointId, draggingControlPoint, screenToSvg]);

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setDraggingPointId(null);
        setDraggingControlPoint(null);
    }, []);

    // Toggle point type
    const togglePointType = useCallback((pointId: string, newType: PointType) => {
        setPoints(prev => prev.map(point => {
            if (point.id !== pointId) return point;

            const prevPoint = prev[prev.indexOf(point) - 1] || prev[prev.length - 1];

            if (newType === 'L') {
                return { ...point, type: 'L', cp1: undefined, cp2: undefined };
            } else if (newType === 'Q') {
                // Create control point at midpoint
                const cp1 = point.cp1 || {
                    x: (prevPoint.x + point.x) / 2,
                    y: (prevPoint.y + point.y) / 2 - 20,
                };
                return { ...point, type: 'Q', cp1, cp2: undefined };
            } else if (newType === 'C') {
                // Create two control points
                const cp1 = point.cp1 || {
                    x: prevPoint.x + (point.x - prevPoint.x) / 3,
                    y: prevPoint.y + (point.y - prevPoint.y) / 3 - 15,
                };
                const cp2 = point.cp2 || {
                    x: prevPoint.x + (point.x - prevPoint.x) * 2 / 3,
                    y: prevPoint.y + (point.y - prevPoint.y) * 2 / 3 - 15,
                };
                return { ...point, type: 'C', cp1, cp2 };
            }

            return point;
        }));
    }, []);

    // Add point on edge
    const handleSvgDoubleClick = useCallback((e: React.MouseEvent) => {
        const pos = screenToSvg(e.clientX, e.clientY);

        // Find closest edge
        let minDist = Infinity;
        let insertIndex = 0;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            // Distance from point to line segment
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const t = Math.max(0, Math.min(1, ((pos.x - p1.x) * dx + (pos.y - p1.y) * dy) / (dx * dx + dy * dy)));
            const projX = p1.x + t * dx;
            const projY = p1.y + t * dy;
            const dist = Math.sqrt((pos.x - projX) ** 2 + (pos.y - projY) ** 2);

            if (dist < minDist) {
                minDist = dist;
                insertIndex = i + 1;
            }
        }

        // Only add if close to edge (within 10%)
        if (minDist > 10) return;

        const newPoint: PathPoint = {
            id: generatePointId(),
            x: pos.x,
            y: pos.y,
            type: 'L',
        };

        setPoints(prev => [
            ...prev.slice(0, insertIndex),
            newPoint,
            ...prev.slice(insertIndex),
        ]);
        setSelectedPointId(newPoint.id);
    }, [points, screenToSvg]);

    // Delete selected point
    const deleteSelectedPoint = useCallback(() => {
        if (!selectedPointId || points.length <= 3) return;

        setPoints(prev => prev.filter(p => p.id !== selectedPointId));
        setSelectedPointId(null);
    }, [selectedPointId, points.length]);

    // Render path
    const pathD = pointsToPath(points);

    // Get selected point
    const selectedPoint = points.find(p => p.id === selectedPointId);

    if (!elementRect) return null;

    return (
        <div
            className="absolute select-none"
            style={{
                pointerEvents: 'auto',
                left: elementRect.x,
                top: elementRect.y,
                width: elementRect.width,
                height: elementRect.height,
                zIndex: 9999,
            }}
            data-slot="floating-menu-content"
        >
            {/* Toolbar */}
            <div
                className="absolute -top-10 left-0 flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1 shadow-md border"
                data-slot="floating-menu-content"
            >
                {selectedPoint && selectedPoint.id !== points[0].id && (
                    <>
                        <Button
                            size="icon"
                            variant={selectedPoint.type === 'L' ? 'default' : 'ghost'}
                            className="h-7 w-7"
                            title="Linha reta"
                            onClick={() => togglePointType(selectedPoint.id, 'L')}
                        >
                            <LineSegment className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant={selectedPoint.type === 'Q' ? 'default' : 'ghost'}
                            className="h-7 w-7"
                            title="Curva quadratica"
                            onClick={() => togglePointType(selectedPoint.id, 'Q')}
                        >
                            <BezierCurve className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant={selectedPoint.type === 'C' ? 'default' : 'ghost'}
                            className="h-7 w-7"
                            title="Curva cubica"
                            onClick={() => {
                                togglePointType(selectedPoint.id, 'C');
                            }}
                        >
                            <span className="text-xs font-bold">C</span>
                        </Button>
                        <div className="w-px bg-border mx-1" />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title="Deletar ponto"
                            onClick={deleteSelectedPoint}
                            disabled={points.length <= 3}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={onClose}
                >
                    Fechar
                </Button>
            </div>

            {/* SVG Editor - z-index to stay above the clipped element */}
            <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                style={{
                    cursor: draggingPointId ? 'grabbing' : 'crosshair',
                    zIndex: 9999,
                    overflow: 'visible'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleSvgDoubleClick}
            >
                {/* Path preview - using accent color like moveable clip lines */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />

                {/* Control point lines */}
                {points.map((point, index) => {
                    if (point.type === 'L') return null;

                    const prevPoint = points[index - 1] || points[points.length - 1];

                    return (
                        <g key={`cp-lines-${point.id}`}>
                            {point.cp1 && (
                                <line
                                    x1={point.type === 'C' ? prevPoint.x : point.x}
                                    y1={point.type === 'C' ? prevPoint.y : point.y}
                                    x2={point.cp1.x}
                                    y2={point.cp1.y}
                                    stroke="var(--accent)"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                    strokeDasharray="2 2"
                                />
                            )}
                            {point.cp2 && (
                                <line
                                    x1={point.x}
                                    y1={point.y}
                                    x2={point.cp2.x}
                                    y2={point.cp2.y}
                                    stroke="var(--accent)"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                    strokeDasharray="2 2"
                                />
                            )}
                        </g>
                    );
                })}

                {/* Control points - circles for bezier handles */}
                {points.map((point) => {
                    if (point.type === 'L') return null;

                    // Calculate fixed size based on viewBox scale
                    // Use separate x/y radii to compensate for aspect ratio
                    const cpSizeX = 5 * (100 / elementRect.width);
                    const cpSizeY = 5 * (100 / elementRect.height);

                    return (
                        <g key={`cp-${point.id}`}>
                            {point.cp1 && (
                                <ellipse
                                    cx={point.cp1.x}
                                    cy={point.cp1.y}
                                    rx={cpSizeX}
                                    ry={cpSizeY}
                                    fill="var(--background)"
                                    stroke="var(--accent)"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                    style={{ cursor: 'grab' }}
                                    onMouseDown={(e) => handleControlPointMouseDown(e, point.id, 'cp1')}
                                />
                            )}
                            {point.cp2 && (
                                <ellipse
                                    cx={point.cp2.x}
                                    cy={point.cp2.y}
                                    rx={cpSizeX}
                                    ry={cpSizeY}
                                    fill="var(--background)"
                                    stroke="var(--accent)"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                    style={{ cursor: 'grab' }}
                                    onMouseDown={(e) => handleControlPointMouseDown(e, point.id, 'cp2')}
                                />
                            )}
                        </g>
                    );
                })}

                {/* Main points - squares like moveable controls */}
                {points.map((point) => {
                    // Calculate fixed size based on viewBox scale (8px fixed size)
                    // Use separate width/height to compensate for aspect ratio
                    const pointSizeX = 8 * (100 / elementRect.width);
                    const pointSizeY = 8 * (100 / elementRect.height);
                    const halfSizeX = pointSizeX / 2;
                    const halfSizeY = pointSizeY / 2;

                    return (
                        <rect
                            key={point.id}
                            x={point.x - halfSizeX}
                            y={point.y - halfSizeY}
                            width={pointSizeX}
                            height={pointSizeY}
                            fill={selectedPointId === point.id ? 'var(--primary)' : 'var(--background)'}
                            stroke="var(--accent)"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => handlePointMouseDown(e, point.id)}
                        />
                    );
                })}
            </svg>

            {/* Instructions */}
            <div className="absolute -bottom-8 left-0 text-xs text-muted-foreground">
                Duplo clique para adicionar ponto | Arraste para mover
            </div>
        </div>
    );
}
