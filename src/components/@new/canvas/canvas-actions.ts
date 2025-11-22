import type {
  OnDrag,
  OnRenderGroup,
  OnResize,
  OnResizeEnd,
  OnRotate,
  OnRotateEnd,
  OnScale,
} from "react-moveable";
import type { ElementConfig } from "@/stores/canva-store";

// ============================================================================
// Types
// ============================================================================

export interface ResizeEndCallback {
  (elementId: string, size: { width: number; height: number }): void;
}

export interface RotateEndCallback {
  (elementId: string, angle: number): void;
}

export interface UpdateElementCallback {
  (elementId: string, config: Partial<ElementConfig>): void;
}

// ============================================================================
// Snap Configuration
// ============================================================================

export const snapConfig = {
  directions: {
    top: true,
    left: true,
    bottom: true,
    right: true,
    center: true,
    middle: true,
  },
  elementDirections: {
    top: true,
    left: true,
    bottom: true,
    right: true,
    center: true,
    middle: true,
  },
} as const;

// ============================================================================
// Action Handlers
// ============================================================================

/**
 * Handler para drag de elementos
 */
export const onDrag = (e: OnDrag): void => {
  e.target.style.transform = e.transform;
};

/**
 * Handler para renderização de grupos
 */
export const onRenderGroup = (e: OnRenderGroup): void => {
  e.events.forEach((ev) => {
    ev.target.style.cssText += ev.cssText;
  });
};

/**
 * Handler padrão para resize de elementos (não-texto)
 */
export const onResize = (e: OnResize): void => {
  e.target.style.width = `${e.width}px`;
  e.target.style.height = `${e.height}px`;
  e.target.style.transform = e.drag.transform;
};

/**
 * Handler para fim do resize
 */
export const onResizeEnd = (
  e: OnResizeEnd,
  callback?: ResizeEndCallback
): void => {
  const elementId = e.target.getAttribute("data-element-id");
  if (!elementId) return;

  const lastEvent = e.lastEvent;
  if (!lastEvent) return;

  const size = {
    width: lastEvent.width,
    height: lastEvent.height,
  };

  callback?.(elementId, size);
};

/**
 * Handler para rotação de elementos
 */
export const onRotate = (e: OnRotate): void => {
  e.target.style.transform = e.transform;
};

/**
 * Handler para fim da rotação
 */
export const onRotateEnd = (
  e: OnRotateEnd,
  callback?: RotateEndCallback
): void => {
  const elementId = e.target.getAttribute("data-element-id");
  if (!elementId) return;

  const lastEvent = e.lastEvent;
  if (!lastEvent) return;

  const newAngle = lastEvent.rotate;
  callback?.(elementId, newAngle);
};

/**
 * Handler para scale de elementos
 */
export const onScale = (e: OnScale): void => {
  e.target.style.transform = e.drag.transform;
};

// ============================================================================
// Canvas Actions Object (para compatibilidade)
// ============================================================================

export const canvasActions = {
  onDrag,
  onRenderGroup,
  onResize,
  onResizeEnd,
  onRotate,
  onRotateEnd,
  onScale,
  snapDirections: snapConfig.directions,
  elementSnapDirections: snapConfig.elementDirections,
};
