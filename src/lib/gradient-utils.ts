import type {
  ColorStop,
  GradientState,
  GradientType,
  Point,
} from "@/types/gradient";
import type { ColorConfig } from "@/stores/canva-store";

export const generateCssString = (
  type: GradientType,
  stops: ColorStop[],
  width: number,
  height: number,
  start: Point,
  end: Point,
  angle?: number,
): string => {
  // Sort stops to ensure valid CSS syntax usually, but for a tool, order matters.
  // We usually trust the stops order or sort them.
  const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);

  const w = width || 1; // Prevent division by zero
  const h = height || 1;

  // Convert relative 0-1 coordinates to pixels
  const p1 = { x: start.x * w, y: start.y * h };
  const p2 = { x: end.x * w, y: end.y * h };

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (type === "linear") {
    // Calculate the CSS angle
    const cssAngle = angle !== undefined ? angle : 90;

    // Simple mapping: stops are always 0-100%, handles are just visual
    const cssStops = sortedStops
      .map((stop) => `${stop.color} ${stop.offset}%`)
      .join(", ");

    return `linear-gradient(${cssAngle}deg, ${cssStops})`;
  } else {
    // Radial
    // circle at X% Y%
    const cx = (start.x * 100).toFixed(2);
    const cy = (start.y * 100).toFixed(2);

    const cssStops = sortedStops
      .map((stop) => {
        // Map 0-100 offset to pixel radius based on handle distance
        const r = (stop.offset / 100) * length;
        return `${stop.color} ${r.toFixed(1)}px`;
      })
      .join(", ");

    return `radial-gradient(circle at ${cx}% ${cy}%, ${cssStops})`;
  }
};

export const generatePreviewBackground = (stops: ColorStop[]): string => {
  const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);
  const stopsString = sortedStops
    .map((stop) => `${stop.color} ${stop.offset.toFixed(2)}%`)
    .join(", ");
  return `linear-gradient(to right, ${stopsString})`;
};

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Converts a ColorConfig to CSS string
 * Used to apply colors to elements
 */
export const colorConfigToCss = (
  colorConfig: ColorConfig | string,
  width: number = 100,
  height: number = 100,
): string => {
  // Handle legacy string colors
  if (typeof colorConfig === "string") {
    return colorConfig;
  }

  if (!colorConfig || !colorConfig.type) {
    return "transparent";
  }

  if (colorConfig.type === "solid") {
    return colorConfig.value || "transparent";
  } else {
    // gradient
    const gradient = colorConfig.value;
    if (!gradient || !gradient.type) {
      return "transparent";
    }
    return generateCssString(
      gradient.type,
      gradient.stops,
      width,
      height,
      gradient.linearStart,
      gradient.linearEnd,
      gradient.angle,
    );
  }
};

export const parseCssString = (cssString: string): GradientState | null => {
  // Split by comma, but not inside parentheses (for rgb/rgba/hsl/hsla)
  const splitStops = (content: string): string[] => {
    const stops: string[] = [];
    let current = "";
    let parenDepth = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === "(") {
        parenDepth++;
        current += char;
      } else if (char === ")") {
        parenDepth--;
        current += char;
      } else if (char === "," && parenDepth === 0) {
        stops.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      stops.push(current.trim());
    }

    return stops;
  };

  // Regex para capturar cores incluindo rgb(), rgba(), hsl(), hsla(), hex e nomes
  const colorStopRegex =
    /^((?:rgb|rgba|hsl|hsla)\s*\([^)]+\)|#[\da-fA-F]{3,8}|[a-zA-Z]+)\s+([\d.]+)(%|px)?$/;

  if (cssString.startsWith("linear-gradient")) {
    const linearMatch = cssString.match(/linear-gradient\((.+)\)$/);
    if (!linearMatch) return null;

    const content = linearMatch[1];
    const parts = splitStops(content);

    let angle: number = 0;
    let colorStopStrings: string[] = [];

    const anglePart = parts[0];
    const angleMatch = anglePart.match(/^(\d+\.?\d*)deg$/);
    if (angleMatch) {
      angle = parseFloat(angleMatch[1]);
      colorStopStrings = parts.slice(1);
    } else {
      angle = 90;
      colorStopStrings = parts;
    }

    // Calculate handles based on angle
    const HANDLE_START_POSITION = 0.2; // Where the start handle appears visually
    const HANDLE_END_POSITION = 0.8; // Where the end handle appears visually

    const geometricAngleDeg = angle - 90;
    const geometricAngleRad = (geometricAngleDeg * Math.PI) / 180;

    const dx = Math.cos(geometricAngleRad);
    const dy = Math.sin(geometricAngleRad);

    // Simply position handles at the specified positions along the angle
    const linearStart: Point = {
      x: 0.5 + (HANDLE_START_POSITION - 0.5) * dx,
      y: 0.5 + (HANDLE_START_POSITION - 0.5) * dy,
    };
    const linearEnd: Point = {
      x: 0.5 + (HANDLE_END_POSITION - 0.5) * dx,
      y: 0.5 + (HANDLE_END_POSITION - 0.5) * dy,
    };

    // Parse all stops - simple mapping now
    const stops: ColorStop[] = [];
    let currentStopId = 1;

    for (const stopString of colorStopStrings) {
      const stopMatch = stopString.trim().match(colorStopRegex);

      if (stopMatch) {
        const color = stopMatch[1];
        let offsetValue = parseFloat(stopMatch[2]);
        const unit = stopMatch[3];

        let offset: number;
        if (unit === "%") {
          offset = offsetValue;
        } else if (unit === "px") {
          offset = offsetValue;
        } else {
          offset = offsetValue;
        }

        if (offset < 0) offset = 0;
        if (offset > 100) offset = 100;

        stops.push({
          id: (currentStopId++).toString(),
          color,
          offset: parseFloat(offset.toFixed(2)),
        });
      }
    }

    // Default stops if parsing failed
    if (stops.length === 0) {
      stops.push({ id: "1", color: "#000000", offset: 0 });
      stops.push({ id: "2", color: "#FFFFFF", offset: 100 });
    }

    return {
      type: "linear",
      angle: angle,
      linearStart,
      linearEnd,
      stops: stops,
    };
  } else if (cssString.startsWith("radial-gradient")) {
    const radialMatch = cssString.match(/radial-gradient\(([^)]+)\)/);
    if (!radialMatch) return null;

    const content = radialMatch[1];
    const parts = splitStops(content);

    let centerPoint: Point = { x: 0.5, y: 0.5 };
    let colorStopStrings: string[] = parts;

    const firstPart = parts[0];
    const shapePosMatch = firstPart.match(
      /(circle|ellipse)?\s*(at\s*(\d+\.?\d*)%\s*(\d+\.?\d*)%)?/,
    );
    if (shapePosMatch && shapePosMatch[3] && shapePosMatch[4]) {
      centerPoint = {
        x: parseFloat(shapePosMatch[3]) / 100,
        y: parseFloat(shapePosMatch[4]) / 100,
      };
      colorStopStrings = parts.slice(1);
    } else {
      const explicitPosMatch = firstPart.match(
        /at\s*(\d+\.?\d*)%\s*(\d+\.?\d*)%/,
      );
      if (explicitPosMatch) {
        centerPoint = {
          x: parseFloat(explicitPosMatch[1]) / 100,
          y: parseFloat(explicitPosMatch[2]) / 100,
        };
        colorStopStrings = parts.slice(1);
      }
    }

    const stops: ColorStop[] = [];
    let currentStopId = 1;
    let prevOffset = -1;

    for (const stopString of colorStopStrings) {
      const stopMatch = stopString.trim().match(colorStopRegex);

      if (stopMatch) {
        const color = stopMatch[1];
        let offsetValue = parseFloat(stopMatch[2]);
        const unit = stopMatch[3];

        let offset: number;
        if (unit === "%") {
          offset = offsetValue;
        } else if (unit === "px") {
          offset = offsetValue;
        } else {
          offset = offsetValue;
        }

        if (offset < 0) offset = 0;
        if (offset > 100) offset = 100;

        stops.push({
          id: (currentStopId++).toString(),
          color,
          offset: parseFloat(offset.toFixed(2)),
        });
        prevOffset = offset;
      }
    }

    // Only add default stops if parsing completely failed
    if (stops.length === 0) {
      stops.push({ id: "1", color: "#000000", offset: 0 });
      stops.push({ id: "2", color: "#FFFFFF", offset: 100 });
    }

    const radiusHandleDistance = 0.2;
    const linearEnd: Point = {
      x: centerPoint.x + radiusHandleDistance,
      y: centerPoint.y,
    };

    return {
      type: "radial",
      angle: 0,
      linearStart: centerPoint,
      linearEnd: linearEnd,
      stops: stops,
    };
  }

  return null;
};
