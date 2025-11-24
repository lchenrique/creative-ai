'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
    type Point,
    distance,
    distanceToLineSegment,
    findClosestPointOnBezier,
    generateControlPoints,
    generateClipPath,
    generateClipPathPath,
} from '@/lib/geometry-utils'
import type { PathPoint } from '@/stores/canva-store'

interface DragState {
    type: 'point' | 'cp1' | 'cp2' | null
    pointId: string | null
}

interface ClipPathEditorProps {
    width?: number
    height?: number
    rotation?: number   // Rotation angle in degrees from the parent element
    value?: string
    pathPoints?: PathPoint[]
    onChange?: (clipPath: string) => void
    onClose?: (polygonClipPath: string, pathPoints?: PathPoint[]) => void
}

// Function to get local coordinates from mouse event, handling rotation and scale
function getLocalCoordinates(
    clientX: number,
    clientY: number,
    rect: DOMRect,
    width: number,
    height: number,
    rotation: number
) {
    // 1. Find center of the element in screen space
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // 2. Vector from center to mouse
    const dx = clientX - cx;
    const dy = clientY - cy;

    // 3. Calculate scale factor
    // Theoretical AABB size if scale was 1
    const rad = rotation * (Math.PI / 180);
    const absCos = Math.abs(Math.cos(rad));
    const absSin = Math.abs(Math.sin(rad));

    const expectedWidth = width * absCos + height * absSin;
    // Avoid division by zero
    const scale = expectedWidth > 0 ? rect.width / expectedWidth : 1;

    // 4. Rotate vector by -rotation to align with local axes
    // We also divide by scale to get back to local CSS pixels
    const angle = -rad;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const rx = (dx * cos - dy * sin) / scale;
    const ry = (dx * sin + dy * cos) / scale;

    // 5. Add local center to get coordinates relative to top-left (0,0)
    return {
        x: rx + width / 2,
        y: ry + height / 2
    };
}

// Parse polygon string to points
function parsePolygonToPoints(polygon: string, width: number, height: number): PathPoint[] {
    const match = polygon.match(/polygon\(([^)]+)\)/)
    if (!match) {
        // Default rectangle
        return [
            { id: '1', x: 0, y: 0, type: 'line' },
            { id: '2', x: width, y: 0, type: 'line' },
            { id: '3', x: width, y: height, type: 'line' },
            { id: '4', x: 0, y: height, type: 'line' },
        ]
    }

    const pointsStr = match[1].split(',').map(p => p.trim())
    return pointsStr.map((p, i) => {
        const parts = p.split(' ')
        const xPercent = parseFloat(parts[0])
        const yPercent = parseFloat(parts[1])
        return {
            id: String(i + 1),
            x: (xPercent / 100) * width,
            y: (yPercent / 100) * height,
            type: 'line' as const,
        }
    })
}

export function ClipPathEditor({ width, height, rotation = 0, value, pathPoints: initialPathPoints, onChange, onClose }: ClipPathEditorProps) {
    const CANVAS_WIDTH = width || 450
    const CANVAS_HEIGHT = height || 800
    const POINT_RADIUS = 6
    const HANDLE_RADIUS = 4
    const CLICK_THRESHOLD = 10
    const SNAP_THRESHOLD = 5

    // Snap guidelines (percentages of canvas size)
    const verticalGuidelines = [0, 0.25, 0.5, 0.75, 1].map(p => p * CANVAS_WIDTH)
    const horizontalGuidelines = [0, 0.25, 0.5, 0.75, 1].map(p => p * CANVAS_HEIGHT)

    // Snap point to guidelines
    const snapToGuidelines = useCallback((x: number, y: number): { x: number; y: number; snappedX: boolean; snappedY: boolean } => {
        let snappedX = false
        let snappedY = false
        let newX = x
        let newY = y

        // Snap to vertical guidelines
        for (const gx of verticalGuidelines) {
            if (Math.abs(x - gx) < SNAP_THRESHOLD) {
                newX = gx
                snappedX = true
                break
            }
        }

        // Snap to horizontal guidelines
        for (const gy of horizontalGuidelines) {
            if (Math.abs(y - gy) < SNAP_THRESHOLD) {
                newY = gy
                snappedY = true
                break
            }
        }

        return { x: newX, y: newY, snappedX, snappedY }
    }, [verticalGuidelines, horizontalGuidelines, SNAP_THRESHOLD])

    const [activeSnapLines, setActiveSnapLines] = useState<{ vertical: number | null; horizontal: number | null }>({
        vertical: null,
        horizontal: null
    })

    const canvasRef = useRef<SVGSVGElement>(null)
    const [points, setPoints] = useState<PathPoint[]>([])
    const initialized = useRef(false)

    // Initialize points from pathPoints (preserves curves) or parse from polygon value
    useEffect(() => {
        if (!initialized.current && CANVAS_WIDTH > 0 && CANVAS_HEIGHT > 0) {
            if (initialPathPoints && initialPathPoints.length > 0) {
                // Convert percentage-based storage to pixel coordinates
                const converted: PathPoint[] = initialPathPoints.map(p => ({
                    id: p.id,
                    x: (p.x / 100) * CANVAS_WIDTH, // stored as percentage 0-100
                    y: (p.y / 100) * CANVAS_HEIGHT,
                    type: p.type,
                    cp1: p.cp1 ? { x: (p.cp1.x / 100) * CANVAS_WIDTH, y: (p.cp1.y / 100) * CANVAS_HEIGHT } : undefined,
                    cp2: p.cp2 ? { x: (p.cp2.x / 100) * CANVAS_WIDTH, y: (p.cp2.y / 100) * CANVAS_HEIGHT } : undefined,
                }))
                setPoints(converted)
            } else if (value) {
                setPoints(parsePolygonToPoints(value, CANVAS_WIDTH, CANVAS_HEIGHT))
            } else {
                setPoints([
                    { id: '1', x: 0, y: 0, type: 'line' } as PathPoint,
                    { id: '2', x: CANVAS_WIDTH, y: 0, type: 'line' } as PathPoint,
                    { id: '3', x: CANVAS_WIDTH, y: CANVAS_HEIGHT, type: 'line' } as PathPoint,
                    { id: '4', x: 0, y: CANVAS_HEIGHT, type: 'line' } as PathPoint,
                ])
            }
            initialized.current = true
        }
    }, [CANVAS_WIDTH, CANVAS_HEIGHT, value, initialPathPoints])
    const [dragState, setDragState] = useState<DragState>({
        type: null,
        pointId: null,
    })
    const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
    const [selectedPoint, setSelectedPoint] = useState<string | null>(null)
    const [hoveredHandle, setHoveredHandle] = useState<{
        type: 'cp1' | 'cp2'
        pointId: string
    } | null>(null)
    const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)

    // Update points when dimensions change (scale proportionally)
    const prevDimensions = useRef({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    useEffect(() => {
        const prevWidth = prevDimensions.current.width;
        const prevHeight = prevDimensions.current.height;

        if (prevWidth !== CANVAS_WIDTH || prevHeight !== CANVAS_HEIGHT) {
            setPoints(prev => prev.map(point => ({
                ...point,
                x: (point.x / prevWidth) * CANVAS_WIDTH,
                y: (point.y / prevHeight) * CANVAS_HEIGHT,
                cp1: point.cp1 ? {
                    x: (point.cp1.x / prevWidth) * CANVAS_WIDTH,
                    y: (point.cp1.y / prevHeight) * CANVAS_HEIGHT,
                } : undefined,
                cp2: point.cp2 ? {
                    x: (point.cp2.x / prevWidth) * CANVAS_WIDTH,
                    y: (point.cp2.y / prevHeight) * CANVAS_HEIGHT,
                } : undefined,
            })));
            prevDimensions.current = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
        }
    }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

    // Call onChange when points change - use path() during editing for true bezier curves
    useEffect(() => {
        if (onChange && points.length > 0) {
            const clipPath = generateClipPathPath(points)
            onChange(clipPath)
        }
    }, [points, onChange])

    // Convert to polygon when component unmounts (closing editor)
    // Also save pathPoints in percentage format for restoring curves later
    useEffect(() => {
        return () => {
            if (onClose && points.length > 0) {
                const polygonClipPath = generateClipPath(points, CANVAS_WIDTH, CANVAS_HEIGHT)
                // Convert points to percentage-based format for storage
                const pathPointsForStorage = points.map(p => ({
                    id: p.id,
                    x: (p.x / CANVAS_WIDTH) * 100,
                    y: (p.y / CANVAS_HEIGHT) * 100,
                    type: p.type,
                    cp1: p.cp1 ? { x: (p.cp1.x / CANVAS_WIDTH) * 100, y: (p.cp1.y / CANVAS_HEIGHT) * 100 } : undefined,
                    cp2: p.cp2 ? { x: (p.cp2.x / CANVAS_WIDTH) * 100, y: (p.cp2.y / CANVAS_HEIGHT) * 100 } : undefined,
                }))
                onClose(polygonClipPath, pathPointsForStorage)
            }
        }
    }, [points, onClose, CANVAS_WIDTH, CANVAS_HEIGHT])

    // Helper to find segment under cursor
    const getSegmentAtPosition = useCallback(
        (x: number, y: number) => {
            let closestIndex = -1
            let minDistance = CLICK_THRESHOLD

            points.forEach((point, index) => {
                const nextPoint = points[(index + 1) % points.length]

                if (point.type === 'line') {
                    const dist = distanceToLineSegment(
                        { x, y },
                        point,
                        nextPoint
                    )
                    if (dist < minDistance) {
                        minDistance = dist
                        closestIndex = index
                    }
                } else if (point.type === 'curve' && point.cp1 && point.cp2) {
                    const result = findClosestPointOnBezier(
                        { x, y },
                        point,
                        point.cp1,
                        point.cp2,
                        nextPoint
                    )
                    if (result.distance < minDistance) {
                        minDistance = result.distance
                        closestIndex = index
                    }
                }
            })

            return closestIndex
        },
        [points, CLICK_THRESHOLD]
    )

    // Handle mouse down on canvas
    const handleMouseDown = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (!canvasRef.current) return

            const rect = canvasRef.current.getBoundingClientRect()
            const { x, y } = getLocalCoordinates(
                e.clientX,
                e.clientY,
                rect,
                CANVAS_WIDTH,
                CANVAS_HEIGHT,
                rotation
            )

            // Check if clicking on a point
            for (const point of points) {
                if (distance({ x, y }, point) < POINT_RADIUS + 5) {
                    setDragState({ type: 'point', pointId: point.id })
                    setSelectedPoint(point.id)
                    return
                }

                // Check control points for curves
                if (point.type === 'curve') {
                    if (point.cp1 && distance({ x, y }, point.cp1) < HANDLE_RADIUS + 5) {
                        setDragState({ type: 'cp1', pointId: point.id })
                        setSelectedPoint(point.id)
                        return
                    }
                    if (point.cp2 && distance({ x, y }, point.cp2) < HANDLE_RADIUS + 5) {
                        setDragState({ type: 'cp2', pointId: point.id })
                        setSelectedPoint(point.id)
                        return
                    }
                }
            }

            // Check if clicking on a segment to toggle it
            const segmentIndex = getSegmentAtPosition(x, y)
            if (segmentIndex !== -1) {
                // Toggle segment type
                setPoints((prev) => {
                    const newPoints = [...prev]
                    const point = newPoints[segmentIndex]

                    if (point.type === 'line') {
                        const nextPoint = newPoints[(segmentIndex + 1) % newPoints.length]
                        const { cp1, cp2 } = generateControlPoints(point, nextPoint)
                        newPoints[segmentIndex] = { ...point, type: 'curve', cp1, cp2 }
                    } else {
                        const { cp1, cp2, ...rest } = point
                        newPoints[segmentIndex] = { ...rest, type: 'line' }
                    }
                    return newPoints
                })
                // Don't deselect point if we just toggled a line
                return
            }

            // Deselect if clicking on empty space
            setSelectedPoint(null)
        },
        [points, getSegmentAtPosition, CANVAS_WIDTH, CANVAS_HEIGHT, POINT_RADIUS, HANDLE_RADIUS, rotation]
    )

    // Handle mouse move for dragging and hovering
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (!canvasRef.current) return

            const rect = canvasRef.current.getBoundingClientRect()
            const { x, y } = getLocalCoordinates(
                e.clientX,
                e.clientY,
                rect,
                CANVAS_WIDTH,
                CANVAS_HEIGHT,
                rotation
            )

            if (dragState.type && dragState.pointId) {
                // Apply snap to guidelines
                const snapped = snapToGuidelines(x, y)

                // Update active snap lines for visual feedback
                setActiveSnapLines({
                    vertical: snapped.snappedX ? snapped.x : null,
                    horizontal: snapped.snappedY ? snapped.y : null
                })

                setPoints((prev) =>
                    prev.map((point) => {
                        if (point.id !== dragState.pointId) return point

                        if (dragState.type === 'point') {
                            return { ...point, x: snapped.x, y: snapped.y }
                        } else if (dragState.type === 'cp1' && point.cp1) {
                            return { ...point, cp1: { x: snapped.x, y: snapped.y } }
                        } else if (dragState.type === 'cp2' && point.cp2) {
                            return { ...point, cp2: { x: snapped.x, y: snapped.y } }
                        }

                        return point
                    })
                )
                return
            } else {
                // Clear snap lines when not dragging
                setActiveSnapLines({ vertical: null, horizontal: null })
            }

            // Handle hover states
            const segmentIndex = getSegmentAtPosition(x, y)
            setHoveredSegment(segmentIndex)
        },
        [dragState, CANVAS_WIDTH, CANVAS_HEIGHT, getSegmentAtPosition, snapToGuidelines, rotation]
    )

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setDragState({ type: null, pointId: null })
        setActiveSnapLines({ vertical: null, horizontal: null })
    }, [])

    // Global mouse events for dragging outside SVG
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current || !dragState.type || !dragState.pointId) return

            const rect = canvasRef.current.getBoundingClientRect()
            const { x, y } = getLocalCoordinates(
                e.clientX,
                e.clientY,
                rect,
                CANVAS_WIDTH,
                CANVAS_HEIGHT,
                rotation
            )

            // Apply snap to guidelines
            const snapped = snapToGuidelines(x, y)

            // Update active snap lines for visual feedback
            setActiveSnapLines({
                vertical: snapped.snappedX ? snapped.x : null,
                horizontal: snapped.snappedY ? snapped.y : null
            })

            setPoints((prev) =>
                prev.map((point) => {
                    if (point.id !== dragState.pointId) return point

                    if (dragState.type === 'point') {
                        return { ...point, x: snapped.x, y: snapped.y }
                    } else if (dragState.type === 'cp1' && point.cp1) {
                        return { ...point, cp1: { x: snapped.x, y: snapped.y } }
                    } else if (dragState.type === 'cp2' && point.cp2) {
                        return { ...point, cp2: { x: snapped.x, y: snapped.y } }
                    }

                    return point
                })
            )
        }

        const handleGlobalMouseUp = () => {
            setDragState({ type: null, pointId: null })
            setActiveSnapLines({ vertical: null, horizontal: null })
        }

        if (dragState.type) {
            window.addEventListener('mousemove', handleGlobalMouseMove)
            window.addEventListener('mouseup', handleGlobalMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove)
            window.removeEventListener('mouseup', handleGlobalMouseUp)
        }
    }, [dragState, snapToGuidelines, CANVAS_WIDTH, CANVAS_HEIGHT, rotation])

    // Handle double click on point to remove
    const handlePointDoubleClick = useCallback((pointId: string) => {
        setPoints((prev) => {
            if (prev.length <= 3) return prev // Keep at least 3 points
            return prev.filter((p) => p.id !== pointId)
        })
        setSelectedPoint(null)
    }, [])

    // Handle double click on line to add point
    const handleLineDoubleClick = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            e.stopPropagation() // Prevent bubbling to other handlers
            if (!canvasRef.current) return

            const rect = canvasRef.current.getBoundingClientRect()
            const { x: clickX, y: clickY } = getLocalCoordinates(
                e.clientX,
                e.clientY,
                rect,
                CANVAS_WIDTH,
                CANVAS_HEIGHT,
                rotation
            )

            const closestIndex = getSegmentAtPosition(clickX, clickY)

            // Add new point
            if (closestIndex !== -1) {
                const newPoint: PathPoint = {
                    id: Date.now().toString(),
                    x: clickX,
                    y: clickY,
                    type: 'line',
                }

                setPoints((prev) => {
                    const newPoints = [...prev]
                    newPoints.splice(closestIndex + 1, 0, newPoint)
                    return newPoints
                })
            }
        },
        [getSegmentAtPosition, CANVAS_WIDTH, CANVAS_HEIGHT, rotation]
    )

    const generateSVGPath = useCallback(() => {
        if (points.length === 0) return ''

        const pathCommands: string[] = []

        points.forEach((point, index) => {
            const nextPoint = points[(index + 1) % points.length]

            if (index === 0) {
                pathCommands.push(`M ${point.x} ${point.y}`)
            }

            if (point.type === 'curve' && point.cp1 && point.cp2) {
                pathCommands.push(
                    `C ${point.cp1.x} ${point.cp1.y}, ${point.cp2.x} ${point.cp2.y}, ${nextPoint.x} ${nextPoint.y}`
                )
            } else {
                pathCommands.push(`L ${nextPoint.x} ${nextPoint.y}`)
            }
        })

        pathCommands.push('Z')
        return pathCommands.join(' ')
    }, [points])

    return (
        <svg
            ref={canvasRef}
            width={"100%"}
            height={"100%"}
            style={{
                cursor: hoveredPoint || hoveredHandle ? 'move' : hoveredSegment !== -1 ? 'pointer' : 'crosshair',
                overflow: 'visible',
            }}
            className="absolute inset-0 border"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleLineDoubleClick}
        >
            {/* Grid pattern */}
            <defs>
                <pattern
                    id="grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-muted-foreground/20"
                    />
                </pattern>
            </defs>
            <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#grid)" />

            {/* Active snap guidelines */}
            {activeSnapLines.vertical !== null && (
                <line
                    x1={activeSnapLines.vertical}
                    y1={0}
                    x2={activeSnapLines.vertical}
                    y2={CANVAS_HEIGHT}
                    stroke="#f97316"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    className="pointer-events-none"
                />
            )}
            {activeSnapLines.horizontal !== null && (
                <line
                    x1={0}
                    y1={activeSnapLines.horizontal}
                    x2={CANVAS_WIDTH}
                    y2={activeSnapLines.horizontal}
                    stroke="#f97316"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    className="pointer-events-none"
                />
            )}

            {/* Render segments individually for hover effects */}
            {points.map((point, index) => {
                const nextPoint = points[(index + 1) % points.length]
                const isHovered = hoveredSegment === index

                let d = ''
                if (point.type === 'curve' && point.cp1 && point.cp2) {
                    d = `M ${point.x} ${point.y} C ${point.cp1.x} ${point.cp1.y}, ${point.cp2.x} ${point.cp2.y}, ${nextPoint.x} ${nextPoint.y}`
                } else {
                    d = `M ${point.x} ${point.y} L ${nextPoint.x} ${nextPoint.y}`
                }

                return (
                    <path
                        key={`segment-${index}`}
                        d={d}
                        fill="none"
                        stroke={isHovered ? "#ffffff" : "transparent"}
                        strokeWidth="6"
                        strokeOpacity={isHovered ? 0.3 : 0}
                        className="pointer-events-none "
                    />
                )
            })}

            <path
                d={generateSVGPath()}
                fill="rgba(34, 211, 238, 0.2)"
                stroke="#22d3ee"
                strokeWidth="3"
                className="pointer-events-none"
            />

            {points.map((point, index) => {
                if (point.type === 'curve' && point.cp1 && point.cp2) {
                    const nextPoint = points[(index + 1) % points.length]
                    return (
                        <g key={`handles-${point.id}`}>
                            {/* Line from point to cp1 */}
                            <line
                                x1={point.x}
                                y1={point.y}
                                x2={point.cp1.x}
                                y2={point.cp1.y}
                                stroke="#ec4899"
                                strokeWidth="1.5"
                                strokeDasharray="5 3"
                                className="pointer-events-none"
                            />
                            {/* Line from cp2 to next point */}
                            <line
                                x1={point.cp2.x}
                                y1={point.cp2.y}
                                x2={nextPoint.x}
                                y2={nextPoint.y}
                                stroke="#ec4899"
                                strokeWidth="1.5"
                                strokeDasharray="5 3"
                                className="pointer-events-none"
                            />
                            {/* Control point 1 handle */}
                            <circle
                                cx={point.cp1.x}
                                cy={point.cp1.y}
                                r={hoveredHandle?.type === 'cp1' && hoveredHandle?.pointId === point.id ? HANDLE_RADIUS + 1 : HANDLE_RADIUS}
                                fill="#ec4899"
                                stroke="white"
                                strokeWidth="2"
                                style={{ cursor: 'move' }}
                                onMouseDown={(e) => {
                                    e.stopPropagation()
                                    setDragState({ type: 'cp1', pointId: point.id })
                                    setSelectedPoint(point.id)
                                }}
                                onMouseEnter={() => setHoveredHandle({ type: 'cp1', pointId: point.id })}
                                onMouseLeave={() => setHoveredHandle(null)}
                            />
                            {/* Control point 2 handle */}
                            <circle
                                cx={point.cp2.x}
                                cy={point.cp2.y}
                                r={hoveredHandle?.type === 'cp2' && hoveredHandle?.pointId === point.id ? HANDLE_RADIUS + 1 : HANDLE_RADIUS}
                                fill="#ec4899"
                                stroke="white"
                                strokeWidth="2"
                                style={{ cursor: 'move' }}
                                onMouseDown={(e) => {
                                    e.stopPropagation()
                                    setDragState({ type: 'cp2', pointId: point.id })
                                    setSelectedPoint(point.id)
                                }}
                                onMouseEnter={() => setHoveredHandle({ type: 'cp2', pointId: point.id })}
                                onMouseLeave={() => setHoveredHandle(null)}
                            />
                        </g>
                    )
                }
                return null
            })}

            {points.map((point) => (
                <circle
                    key={point.id}
                    cx={point.x}
                    cy={point.y}
                    r={hoveredPoint === point.id ? POINT_RADIUS + 2 : POINT_RADIUS}
                    fill={
                        selectedPoint === point.id
                            ? '#22d3ee'
                            : '#ffffff'
                    }
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    style={{ cursor: 'move' }}
                    className=""
                    onMouseDown={(e) => {
                        e.stopPropagation()
                        setDragState({ type: 'point', pointId: point.id })
                        setSelectedPoint(point.id)
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation()
                        handlePointDoubleClick(point.id)
                    }}
                    onMouseEnter={() => setHoveredPoint(point.id)}
                    onMouseLeave={() => setHoveredPoint(null)}
                />
            ))}

            {points.map((point, index) => {
                if (hoveredPoint === point.id || selectedPoint === point.id) {
                    return (
                        <text
                            key={`label-${point.id}`}
                            x={point.x}
                            y={point.y - 12}
                            textAnchor="middle"
                            className="pointer-events-none select-none fill-primary text-xs font-semibold"
                        >
                            P{index + 1}
                        </text>
                    )
                }
                return null
            })}
        </svg>
    )
}
