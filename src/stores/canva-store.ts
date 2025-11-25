import { create } from "zustand";
import type { GradientState } from "@/types/gradient";
import type { filters } from "@/lib/filters";

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
type TextVariant = "heading" | "title" | "body";

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
  filter?: typeof filters[number]["id"];
  filterIntensities?: Partial<Record<typeof filters[number]["id"], number>>;
  style: {
    // Background & Border
    backgroundColor?: ColorConfig;
    borderRadius?: string;
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
    // Mix Blend Mode
    mixBlendMode?: string;
    opacity?: number;
  };
}

export interface ElementsProps {
  id: string;
  type: "rectangle" | "circle" | "text" | "image";
  config: ElementConfig;
  content?: string;
}


export interface Element {
  [id: string]: ElementsProps;
}

interface CanvasStore {
  elements: Element;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  addElement?: (type: ElementsProps["type"], variant?: TextVariant) => void;
  duplicateElement?: (element: ElementsProps) => void;

  updateElementConfig: (id: string, newConfig: Partial<ElementConfig>) => void;
  removeElement?: (id: string) => void;
  canvasBgColor?: ColorConfig;
  canvasFilter?: typeof filters[number]["id"]
  canvasFilterIntensities?: Partial<Record<typeof filters[number]["id"], number>>;
  setCanvasFilter?: (filter: typeof filters[number]["id"]) => void;
  setCanvasBgColor?: (colorConfig: ColorConfig) => void;
  setCanvasFilterIntensities?: (intensities: Partial<Record<typeof filters[number]["id"], number>>) => void;
  bgSlected?: boolean;
  setBgSlected?: (selected: boolean) => void;
}


const textPresets: Record<TextVariant, ElementConfig> = {
  heading: {
    size: { width: 140, height: 48 },
    position: { x: 0, y: 0 },
    style: {
      fontFamily: "Roboto",
      fontSize: 36,
      fontWeight: "bold",
      color: "#000000",
      text: "Heading",
      lineHeight: 1.2,
    },
  },
  title: {
    size: { width: 55, height: 36 },
    position: { x: 0, y: 0 },
    style: {
      fontFamily: "Roboto",
      fontSize: 24,
      fontWeight: "bold",
      color: "#000000",
      text: "Title",
      lineHeight: 1.2,
    },
  },
  body: {
    size: { width: 45, height: 20 },
    position: { x: 0, y: 0 },
    style: {
      fontFamily: "Roboto",
      fontSize: 16,
      fontWeight: "normal",
      color: "#000000",
      text: "Body",
      lineHeight: 1.3,
    },
  },
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  selectedIds: [],
  elements: {} as Element,
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  canvasBgColor: { type: "solid", value: "#ffffff" },
  canvasFilter: "original",
  canvasFilterIntensities: {} as Partial<Record<typeof filters[number]["id"], number>>,
  setCanvasFilter: (filter) => set({ canvasFilter: filter }),
  setCanvasBgColor: (colorConfig) => set({ canvasBgColor: colorConfig }),
  setCanvasFilterIntensities: (intensities) => set({ canvasFilterIntensities: intensities }),
  bgSlected: false,
  setBgSlected: (selected) => set({ bgSlected: selected }),
  addElement: (type, variant) => {
    function randomHexColor() {
      return (
        "#" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0")
      );
    }

    const baseElements: { [key: string]: { config: ElementConfig } } = {
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
            borderRadius:
              "118px 118.5px 116.799px 118.201px / 115.5px 118.004px 119.996px 115.5px",
          },
        },
      },
      text: {
        config: textPresets[variant ?? "body"],
      },
      image: {
        config: {
          size: { width: 300, height: 300 },
          position: { x: 0, y: 0 },
          style: {
            backgroundColor: { type: "image", value: "" },
          }

        },
      },
    };

    const newEl: ElementsProps = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      config: baseElements[type].config,
    };

    set((state) => ({
      elements: {
        ...state.elements,
        [newEl.id]: newEl,
      },
    }));
  },

  duplicateElement: (element) => {
    const newElement = {
      ...element, id: Math.random().toString(36).substr(2, 9),
      config: {
        ...element.config,
        position: {
          x: element.config.position.x + 50,
          y: element.config.position.y - 50,
        },
      },
    };
    set((state) => ({
      elements: {
        ...state.elements,
        [newElement.id]: newElement,
      },
    }));
  },

  updateElementConfig: (id, newConfig) => {
    set((state) => ({
      elements: {
        ...state.elements,
        [id]: {
          ...state.elements[id],
          config: {
            ...state.elements[id].config,
            ...newConfig,
            style: {
              ...state.elements[id].config.style,
              ...newConfig.style,
            },
          },
        },
      },
    }));
  },

  removeElement: (id) => {
    const elements = get().elements;
    delete elements[id];
    set({ elements });
  },
}));
