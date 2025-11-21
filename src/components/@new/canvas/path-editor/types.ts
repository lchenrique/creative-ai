// Types for the custom path editor

export type PointType = 'L' | 'Q' | 'C'; // Line, Quadratic, Cubic

export interface PathPoint {
    id: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    type: PointType;
    // Control points for curves (in percentages)
    cp1?: { x: number; y: number }; // First control point (for Q and C)
    cp2?: { x: number; y: number }; // Second control point (only for C)
}

export interface PathEditorState {
    points: PathPoint[];
    selectedPointId: string | null;
    draggingPointId: string | null;
    draggingControlPoint: 'cp1' | 'cp2' | null;
}

// Convert points array to SVG path string
export function pointsToPath(points: PathPoint[]): string {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        const point = points[i];

        switch (point.type) {
            case 'L':
                path += ` L ${point.x} ${point.y}`;
                break;
            case 'Q':
                if (point.cp1) {
                    path += ` Q ${point.cp1.x} ${point.cp1.y} ${point.x} ${point.y}`;
                } else {
                    // Fallback to line if no control point
                    path += ` L ${point.x} ${point.y}`;
                }
                break;
            case 'C':
                if (point.cp1 && point.cp2) {
                    path += ` C ${point.cp1.x} ${point.cp1.y} ${point.cp2.x} ${point.cp2.y} ${point.x} ${point.y}`;
                } else if (point.cp1) {
                    // Fallback to quadratic
                    path += ` Q ${point.cp1.x} ${point.cp1.y} ${point.x} ${point.y}`;
                } else {
                    path += ` L ${point.x} ${point.y}`;
                }
                break;
        }
    }

    path += ' Z'; // Close path
    return path;
}

// Convert points to clip-path CSS
export function pathToClipPath(points: PathPoint[]): string {
    // Check if we only have lines (no curves)
    const hasOnlyLines = points.every(p => p.type === 'L');

    if (hasOnlyLines) {
        // Use polygon() with percentages - this scales properly
        const polygonPoints = points.map(p => `${p.x}% ${p.y}%`).join(', ');
        return `polygon(${polygonPoints})`;
    }

    // For curves, use polygon approximation but preserve original points info
    // This allows the element to follow the curve while maintaining editability
    const approximatedPoints = approximateCurvesToPolygon(points);
    const polygonPoints = approximatedPoints.map(p => `${p.x}% ${p.y}%`).join(', ');
    return `polygon(${polygonPoints})`;
}

// Parse path data back to points
export function pathToPathPoints(pathData: string): PathPoint[] {
    const points: PathPoint[] = [];

    // Parse SVG path commands
    const commands = pathData.match(/[MLQCZ][^MLQCZ]*/gi);
    if (!commands) return createDefaultPoints();

    let currentPoint = { x: 0, y: 0 };
    let currentId = 1;

    for (const command of commands) {
        const cmd = command[0];
        const args = command.slice(1).trim().split(/[\s,]+/).map(parseFloat);

        switch (cmd.toUpperCase()) {
            case 'M':
                if (args.length >= 2) {
                    currentPoint = { x: args[0], y: args[1] };
                    points.push({
                        id: String(currentId++),
                        x: currentPoint.x,
                        y: currentPoint.y,
                        type: 'L'
                    });
                }
                break;
            case 'L':
                if (args.length >= 2) {
                    currentPoint = { x: args[0], y: args[1] };
                    points.push({
                        id: String(currentId++),
                        x: currentPoint.x,
                        y: currentPoint.y,
                        type: 'L'
                    });
                }
                break;
            case 'Q':
                if (args.length >= 4) {
                    const cp1 = { x: args[0], y: args[1] };
                    currentPoint = { x: args[2], y: args[3] };
                    points.push({
                        id: String(currentId++),
                        x: currentPoint.x,
                        y: currentPoint.y,
                        type: 'Q',
                        cp1
                    });
                }
                break;
            case 'C':
                if (args.length >= 6) {
                    const cp1 = { x: args[0], y: args[1] };
                    const cp2 = { x: args[2], y: args[3] };
                    currentPoint = { x: args[4], y: args[5] };
                    points.push({
                        id: String(currentId++),
                        x: currentPoint.x,
                        y: currentPoint.y,
                        type: 'C',
                        cp1,
                        cp2
                    });
                }
                break;
        }
    }

    return points.length > 0 ? points : createDefaultPoints();
}

// Approximate curves with line segments for polygon fallback
function approximateCurvesToPolygon(points: PathPoint[]): { x: number; y: number }[] {
    const result: { x: number; y: number }[] = [];

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const prevPoint = i > 0 ? points[i - 1] : points[points.length - 1];

        if (point.type === 'L' || i === 0) {
            result.push({ x: point.x, y: point.y });
        } else if (point.type === 'Q' && point.cp1) {
            // Quadratic bezier - approximate with fewer segments (4 instead of 16)
            const segments = 4;
            for (let t = 1; t <= segments; t++) {
                const ratio = t / segments;
                const x = quadraticBezier(prevPoint.x, point.cp1.x, point.x, ratio);
                const y = quadraticBezier(prevPoint.y, point.cp1.y, point.y, ratio);
                result.push({ x, y });
            }
        } else if (point.type === 'C' && point.cp1 && point.cp2) {
            // Cubic bezier - approximate with fewer segments (6 instead of 20)
            const segments = 6;
            for (let t = 1; t <= segments; t++) {
                const ratio = t / segments;
                const x = cubicBezier(prevPoint.x, point.cp1.x, point.cp2.x, point.x, ratio);
                const y = cubicBezier(prevPoint.y, point.cp1.y, point.cp2.y, point.y, ratio);
                result.push({ x, y });
            }
        } else {
            result.push({ x: point.x, y: point.y });
        }
    }

    return result;
}

// Quadratic bezier interpolation
function quadraticBezier(p0: number, p1: number, p2: number, t: number): number {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

// Cubic bezier interpolation
function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

// Check if points contain any curves
export function hasCurves(points: PathPoint[]): boolean {
    return points.some(p => p.type === 'Q' || p.type === 'C');
}

// Create default rectangle points
export function createDefaultPoints(): PathPoint[] {
    return [
        { id: '1', x: 0, y: 0, type: 'L' },
        { id: '2', x: 100, y: 0, type: 'L' },
        { id: '3', x: 100, y: 100, type: 'L' },
        { id: '4', x: 0, y: 100, type: 'L' },
    ];
}

// Parse polygon CSS to points
export function polygonToPathPoints(polygon: string): PathPoint[] {
    const match = polygon.match(/polygon\(([^)]+)\)/);
    if (!match) return createDefaultPoints();

    const pointsStr = match[1];
    const points = pointsStr.split(',').map((p, index) => {
        const [xStr, yStr] = p.trim().split(' ');
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        return {
            id: String(index + 1),
            x,
            y,
            type: 'L' as PointType,
        };
    });

    return points;
}

// Parse path clip-path back to points
export function clipPathToPoints(clipPath: string): PathPoint[] {
    if (clipPath.includes('polygon')) {
        return polygonToPathPoints(clipPath);
    } else if (clipPath.includes('path')) {
        const match = clipPath.match(/path\("([^"]+)"\)/);
        if (match) {
            return pathToPathPoints(match[1]);
        }
    }
    return createDefaultPoints();
}

// Generate unique ID
export function generatePointId(): string {
    return Math.random().toString(36).substr(2, 9);
}
