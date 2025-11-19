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

    // For curves, convert coordinates to 0-1 range for objectBoundingBox
    // and use path() - but path() doesn't support objectBoundingBox in CSS
    // So we need to use polygon approximation or SVG clipPath

    // Approximate curves with multiple line segments for polygon
    const approximatedPoints = approximateCurvesToPolygon(points);
    const polygonPoints = approximatedPoints.map(p => `${p.x}% ${p.y}%`).join(', ');
    return `polygon(${polygonPoints})`;
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
            // Quadratic bezier - approximate with 16 segments for smoother curves
            const segments = 16;
            for (let t = 1; t <= segments; t++) {
                const ratio = t / segments;
                const x = quadraticBezier(prevPoint.x, point.cp1.x, point.x, ratio);
                const y = quadraticBezier(prevPoint.y, point.cp1.y, point.y, ratio);
                result.push({ x, y });
            }
        } else if (point.type === 'C' && point.cp1 && point.cp2) {
            // Cubic bezier - approximate with 20 segments for smoother curves
            const segments = 20;
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

// Generate unique ID
export function generatePointId(): string {
    return Math.random().toString(36).substr(2, 9);
}
