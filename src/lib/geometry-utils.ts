export interface Point {
  x: number;
  y: number;
}

export interface PathPoint extends Point {
  id: string;
  type: "line" | "curve";
  // Control points for bezier curves
  cp1?: Point;
  cp2?: Point;
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Calculate distance from point to line segment
 */
export function distanceToLineSegment(
  point: Point,
  lineStart: Point,
  lineEnd: Point,
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get point on bezier curve at t (0 to 1)
 */
export function getPointOnBezier(
  start: Point,
  cp1: Point,
  cp2: Point,
  end: Point,
  t: number,
): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * start.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * end.x,
    y: mt3 * start.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * end.y,
  };
}

/**
 * Find closest point on bezier curve to given point
 */
export function findClosestPointOnBezier(
  point: Point,
  start: Point,
  cp1: Point,
  cp2: Point,
  end: Point,
  samples: number = 20,
): { point: Point; t: number; distance: number } {
  let minDist = Infinity;
  let closestT = 0;
  let closestPoint = start;

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = getPointOnBezier(start, cp1, cp2, end, t);
    const dist = distance(point, p);

    if (dist < minDist) {
      minDist = dist;
      closestT = t;
      closestPoint = p;
    }
  }

  return { point: closestPoint, t: closestT, distance: minDist };
}

/**
 * Generate default control points for a curve
 */
export function generateControlPoints(
  start: Point,
  end: Point,
): { cp1: Point; cp2: Point } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = dist * 0.3;

  return {
    cp1: {
      x: start.x + dx * 0.33,
      y: start.y + dy * 0.33 - offset,
    },
    cp2: {
      x: start.x + dx * 0.66,
      y: start.y + dy * 0.66 + offset,
    },
  };
}

/**
 * Generate clip-path CSS using path() - for editing mode
 * Uses pixel values, supports true bezier curves
 */
export function generateClipPathPath(points: PathPoint[]): string {
  if (points.length === 0) return "polygon(0% 0%)";

  const pathCommands: string[] = [];

  points.forEach((point, index) => {
    const nextPoint = points[(index + 1) % points.length];

    if (index === 0) {
      pathCommands.push(`M ${point.x} ${point.y}`);
    }

    if (point.type === "curve" && point.cp1 && point.cp2) {
      pathCommands.push(
        `C ${point.cp1.x} ${point.cp1.y}, ${point.cp2.x} ${point.cp2.y}, ${nextPoint.x} ${nextPoint.y}`,
      );
    } else {
      pathCommands.push(`L ${nextPoint.x} ${nextPoint.y}`);
    }
  });

  pathCommands.push("Z");
  return `path('${pathCommands.join(" ")}')`;
}

/**
 * Generate clip-path CSS using polygon() - for final output
 * Uses percentages for proper scaling
 * Curves are approximated with multiple points
 */
export function generateClipPath(
  points: PathPoint[],
  width?: number,
  height?: number,
): string {
  if (points.length === 0) return "polygon(0% 0%)";

  const w = width || 100;
  const h = height || 100;

  // Convert point to percentage
  const toPercent = (x: number, y: number) => {
    return `${((x / w) * 100).toFixed(2)}% ${((y / h) * 100).toFixed(2)}%`;
  };

  const polygonPoints: string[] = [];

  points.forEach((point, index) => {
    const nextPoint = points[(index + 1) % points.length];

    // Add the current point
    polygonPoints.push(toPercent(point.x, point.y));

    // If it's a curve, add intermediate points to approximate it
    if (point.type === "curve" && point.cp1 && point.cp2) {
      const steps = 40; // Number of points to approximate the curve
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const p = getPointOnBezier(point, point.cp1, point.cp2, nextPoint, t);
        polygonPoints.push(toPercent(p.x, p.y));
      }
    }
  });

  return `polygon(${polygonPoints.join(", ")})`;
}

import { Point } from "../types";

export const degToRad = (deg: number) => (deg * Math.PI) / 180;

// Calculate angle in degrees (CSS standard: 0=Up, 90=Right) from two points
export const calculateAngleFromPoints = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // atan2(y, x) gives angle from X axis (Right) in radians
  // We want: 0deg = Up (0, -1)

  // Convert to degrees
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI;

  // CSS: 0=Up, 90=Right
  deg = deg + 90;

  // Normalize to 0-360
  if (deg < 0) deg += 360;
  return Math.round(deg);
};

export const getCssGradientGeometry = (
  width: number,
  height: number,
  angleDeg: number,
) => {
  // Convert CSS angle (0=Up, 90=Right) to Standard Trig (0=Right, 90=Down/Up)
  // CSS 0deg (Up) is (0, -1). Trig -90deg.
  const rad = (angleDeg - 90) * (Math.PI / 180);

  const cx = width / 2;
  const cy = height / 2;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Box corners relative to center
  const corners = [
    { x: -cx, y: -cy }, // Top-Left
    { x: cx, y: -cy }, // Top-Right
    { x: cx, y: cy }, // Bottom-Right
    { x: -cx, y: cy }, // Bottom-Left
  ];

  // Project all corners onto the gradient vector
  // The vector is (cos, sin)
  let minProj = Infinity;
  let maxProj = -Infinity;

  corners.forEach((p) => {
    const proj = p.x * cos + p.y * sin;
    if (proj < minProj) minProj = proj;
    if (proj > maxProj) maxProj = proj;
  });

  // Calculate absolute start and end points
  return {
    x1: cx + minProj * cos,
    y1: cy + minProj * sin,
    x2: cx + maxProj * cos,
    y2: cy + maxProj * sin,
    length: maxProj - minProj,
  };
};

export const getGradientLineGeometry = (
  width: number,
  height: number,
  start: Point,
  end: Point,
  type: "linear" | "radial",
  angleDeg: number,
) => {
  if (type === "radial") {
    const cx = width / 2;
    const cy = height / 2;
    const length = Math.min(width, height) * 0.45;

    return {
      x1: cx,
      y1: cy,
      x2: cx,
      y2: cy - length,
      length,
    };
  }

  // For Linear, we usually default to the handles,
  // but for CSS accuracy we should prefer getCssGradientGeometry usage in the component.
  // This fallback renders exactly between points.
  return {
    x1: start.x * width,
    y1: start.y * height,
    x2: end.x * width,
    y2: end.y * height,
    length: Math.sqrt(
      Math.pow(
        end.x * width - start.x * width,
        Math.pow(end.y * height - start.y * height, 2),
      ),
    ),
  };
};

// Project a pixel coordinate onto a line segment defined by (x1,y1) -> (x2,y2)
// Returns t (0.0 to 1.0 usually, but can be outside if unclamped)
export const calculateProjectedOffset = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  const px = clientX - rect.left;
  const py = clientY - rect.top;

  return projectPointOnLine(px, py, x1, y1, x2, y2);
};

export const projectPointOnLine = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;

  if (len2 === 0) return 0;

  // Project point onto line segment
  // t = dot(AP, AB) / dot(AB, AB)
  const t = ((px - x1) * dx + (py - y1) * dy) / len2;
  return t;
};

// Get the absolute pixel coordinates of a specific offset along the line
export const getAbsolutePositionOnLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  offsetPercent: number,
) => {
  const t = offsetPercent / 100;
  return {
    x: x1 + (x2 - x1) * t,
    y: y1 + (y2 - y1) * t,
  };
};
