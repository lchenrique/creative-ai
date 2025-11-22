import { create } from "zustand";
import type { GradientState } from "@/types/gradient";

export type ColorConfig =
  | {
      type: "solid";
      value: string;
    }
  | {
      type: "gradient";
      value: GradientState;
    }
  | {
      type: "image";
      value: string;
    };

// Path point types for clip-path editor
export interface PathPoint {
  id: string;
  x: number;
  y: number;
  type: "line" | "curve";
  cp1?: { x: number; y: number };
  cp2?: { x: number; y: number };
}

export interface ElementConfig {
  size: { width: number; height: number };
  position: { x: number; y: number };
  style: {
    // Background & Border
    backgroundColor?: ColorConfig;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    // Clip path
    clipPath?: string;
    clipPathPoints?: PathPoint[];
    // Text properties (CSS standard)
    color?: string;
    fontFamily?: string;
    fontWeight?: string | number;
    fontStyle?: string;
    fontSize?: number;
    textAlign?: "left" | "center" | "right";
    letterSpacing?: number;
    lineHeight?: number;
    // Text content
    text?: string;
    // Shadow (box-shadow / text-shadow)
    boxShadow?: string;
    textShadow?: string;
    // Stroke (WebkitTextStroke)
    WebkitTextStroke?: string;
  };
}

export interface ElementsProps {
  id: string;
  type: "rectangle" | "circle" | "text" | "image";
  config: ElementConfig;
  content?: string;
}

interface CanvasStore {
  elements: ElementsProps[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  addElement?: (type: ElementsProps["type"]) => void;
  updateElementConfig?: (id: string, newConfig: Partial<ElementConfig>) => void;
  removeElement?: (id: string) => void;
  canvasBgColor?: ColorConfig;
  setCanvasBgColor?: (colorConfig: ColorConfig) => void;
  bgSlected?: boolean;
  setBgSlected?: (selected: boolean) => void;
}
export const useCanvasStore = create<CanvasStore>((set, get) => ({
  selectedIds: [],
  elements: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  canvasBgColor: { type: "solid", value: "#ffffff" },
  setCanvasBgColor: (colorConfig) => set({ canvasBgColor: colorConfig }),
  bgSlected: false,
  setBgSlected: (selected) => set({ bgSlected: selected }),
  addElement: (type) => {
    function randomHexColor() {
      return (
        "#" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0")
      );
    }

    const elementsTypeToAdd: { [key: string]: { config: ElementConfig } } = {
      rectangle: {
        config: {
          size: { width: 100, height: 100 },
          position: { x: 0, y: 0 },
          style: {
            backgroundColor: { type: "solid", value: randomHexColor() },
          },
        },
      },
      circle: {
        config: {
          size: { width: 100, height: 100 },
          position: { x: 0, y: 0 },
          style: {
            backgroundColor: { type: "solid", value: randomHexColor() },
            borderRadius: 50,
          },
        },
      },
      text: {
        config: {
          size: { width: 200, height: 50 },
          position: { x: 0, y: 0 },
          style: {
            text: "Texto",
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: 24,
            color: "#000000",
            textAlign: "left",
            letterSpacing: 0,
            lineHeight: 1.2,
          },
        },
      },
    };

    const newEl: ElementsProps = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      config: elementsTypeToAdd[type].config,
    };

    set({ elements: [...get().elements, newEl] });
  },

  updateElementConfig: (id, newConfig) => {
    set((state) => ({
      elements: state.elements.map((el) => {
        if (el.id === id) {
          const mergedConfig = {
            ...el.config,
            ...newConfig,
            style: {
              ...el.config.style,
              ...newConfig.style,
            },
          };
          return { ...el, config: mergedConfig };
        }
        return el;
      }),
    }));
  },

  removeElement: (id) => {
    set({
      elements: get().elements.filter((el) => el.id !== id),
      selectedIds: get().selectedIds.filter((selectedId) => selectedId !== id),
    });
  },
}));
