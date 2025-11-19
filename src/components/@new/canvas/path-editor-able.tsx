import { type MoveableManagerInterface } from "react-moveable";
import { Button } from "@creative-ds/ui";
import { BezierCurve, LineSegment, Trash } from "@phosphor-icons/react";
import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import {
    type PathPoint,
    type PointType,
    pointsToPath,
    pathToClipPath,
    polygonToPathPoints,
    createDefaultPoints,
    generatePointId,
} from "./path-editor/types";

interface PathEditorAbleProps {
    pathEditorEnabled?: boolean;
    initialClipPathPoints?: PathPoint[];
    onClipPathChange?: (clipPath: string, points: PathPoint[]) => void;
    onClosePathEditor?: () => void;
}

export const PathEditorAble = {
    name: "pathEditor",
    props: ["pathEditorEnabled", "initialClipPathPoints", "onClipPathChange", "onClosePathEditor"] as const,
    events: [],
    render(moveable: MoveableManagerInterface<PathEditorAbleProps, any>) {
        const rect = moveable.getRect();
        const state = moveable.state;
        const props = moveable.props;

        // Only show when pathEditor is enabled
        if (!props.pathEditorEnabled) {
            return null;
        }

        const targets = moveable.getTargets();
        if (!targets || targets.length === 0) return null;

        const target = targets[0] as HTMLElement;
        if (!target) return null;

        // Get position - use pos1 if available, otherwise calculate from rect
        const pos1 = state.pos1 || [rect.left, rect.top];

        const targetRect = target.getBoundingClientRect();
        const elementId = target.getAttribute("data-element-id") || "unknown";

        // Return elements directly without using a separate component with hooks
        // This is necessary because Moveable's render doesn't support React components with hooks
        return (
            <PathEditorRenderer
                key={"path-editor-able-" + elementId}
                rect={rect}
                pos1={pos1}
                targetRect={targetRect}
                initialPoints={props.initialClipPathPoints}
                onClipPathChange={props.onClipPathChange}
                onClose={props.onClosePathEditor}
                target={target}
            />
        );
    },
} as const;

// Separate component for the editor content (to use hooks)
function PathEditorRenderer({
    rect,
    pos1,
    targetRect,
    initialPoints,
    onClipPathChange,
    onClose,
    target,
}: {
    rect: any;
    pos1: number[];
    targetRect: DOMRect;
    initialPoints?: PathPoint[];
    onClipPathChange?: (clipPath: string, points: PathPoint[]) => void;
    onClose?: () => void;
    target: HTMLElement;
}) {
    // Initialize points
    const [points, setPoints] = useState<PathPoint[]>(() => {
        if (initialPoints && initialPoints.length > 0) {
            return initialPoints;
        }
        const clipPath = target.style.clipPath;
        if (clipPath && clipPath.includes('polygon')) {
            return polygonToPathPoints(clipPath);
        }
        return createDefaultPoints();
    });

    const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
    const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
    const [draggingControlPoint, setDraggingControlPoint] = useState<'cp1' | 'cp2' | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Update clip-path when points change
    useEffect(() => {
        if (onClipPathChange) {
            const clipPath = pathToClipPath(points);
            onClipPathChange(clipPath, points);
            target.style.clipPath = clipPath;
        }
    }, [points, onClipPathChange, target]);

    // Convert screen coordinates to percentage
    const screenToSvg = useCallback((clientX: number, clientY: number) => {
        const x = ((clientX - targetRect.left) / targetRect.width) * 100;
        const y = ((clientY - targetRect.top) / targetRect.height) * 100;
        return {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
        };
    }, [targetRect]);

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
        setPoints(prev => prev.map((point, idx) => {
            if (point.id !== pointId) return point;

            const prevPoint = prev[idx - 1] || prev[prev.length - 1];

            if (newType === 'L') {
                return { ...point, type: 'L', cp1: undefined, cp2: undefined };
            } else if (newType === 'Q') {
                const cp1 = point.cp1 || {
                    x: (prevPoint.x + point.x) / 2,
                    y: (prevPoint.y + point.y) / 2 - 20,
                };
                return { ...point, type: 'Q', cp1, cp2: undefined };
            } else if (newType === 'C') {
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

        let minDist = Infinity;
        let insertIndex = 0;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

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

    const pathD = pointsToPath(points);
    const selectedPoint = points.find(p => p.id === selectedPointId);

    return (
        <>
            {/* Toolbar */}
            <div
                data-slot="floating-menu-content"
                className="moveable-path-editor-toolbar absolute flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1 shadow-md border left-0 top-0 will-change-transform"
                style={{
                    transformOrigin: "0px 0px",
                    transform: `translate(${pos1[0]}px, ${pos1[1] - 50}px)`,
                }}
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
                            onClick={() => togglePointType(selectedPoint.id, 'C')}
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

            {/* SVG Editor overlay */}
            <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="moveable-path-editor-svg absolute left-0 top-0 will-change-transform"
                style={{
                    transformOrigin: "0px 0px",
                    transform: `translate(${pos1[0]}px, ${pos1[1]}px)`,
                    width: rect.width,
                    height: rect.height,
                    cursor: draggingPointId ? 'grabbing' : 'crosshair',
                    overflow: 'visible',
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleSvgDoubleClick}
            >
                {/* Path preview */}
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

                {/* Control points */}
                {points.map((point) => {
                    if (point.type === 'L') return null;

                    return (
                        <g key={`cp-${point.id}`}>
                            {point.cp1 && (
                                <circle
                                    cx={point.cp1.x}
                                    cy={point.cp1.y}
                                    r="1.2"
                                    fill="var(--background)"
                                    stroke="var(--accent)"
                                    strokeWidth="0.4"
                                    style={{ cursor: 'grab' }}
                                    onMouseDown={(e) => handleControlPointMouseDown(e, point.id, 'cp1')}
                                />
                            )}
                            {point.cp2 && (
                                <circle
                                    cx={point.cp2.x}
                                    cy={point.cp2.y}
                                    r="1.2"
                                    fill="var(--background)"
                                    stroke="var(--accent)"
                                    strokeWidth="0.4"
                                    style={{ cursor: 'grab' }}
                                    onMouseDown={(e) => handleControlPointMouseDown(e, point.id, 'cp2')}
                                />
                            )}
                        </g>
                    );
                })}

                {/* Main points */}
                {points.map((point) => (
                    <rect
                        key={point.id}
                        x={point.x - 1.5}
                        y={point.y - 1.5}
                        width="3"
                        height="3"
                        fill={selectedPointId === point.id ? 'var(--primary))' : 'var(--background))'}
                        stroke="var(--accent)"
                        strokeWidth="0.4"
                        style={{ cursor: 'grab' }}
                        onMouseDown={(e) => handlePointMouseDown(e, point.id)}
                    />
                ))}
            </svg>

            {/* Instructions */}
            <div
                className="moveable-path-editor-hint absolute text-xs text-muted-foreground left-0 top-0 will-change-transform whitespace-nowrap"
                style={{
                    transformOrigin: "0px 0px",
                    transform: `translate(${pos1[0]}px, ${pos1[1] + rect.height + 10}px)`,
                }}
            >
                Duplo clique para adicionar ponto | Arraste para mover 
            </div>
        </>
    );
}
