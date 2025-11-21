export type GradientType = "linear" | "radial";

export interface Point {
  x: number; // 0 to 1 (percentage of container)
  y: number; // 0 to 1
}

export interface ColorStop {
  id: string;
  color: string;
  offset: number; // 0 to 100
}

export interface GradientState {
  type: GradientType;
  angle: number; // 0 to 360 (Calculated from points for linear, or fixed for radial)
  linearStart: Point;
  linearEnd: Point;
  stops: ColorStop[];
}
