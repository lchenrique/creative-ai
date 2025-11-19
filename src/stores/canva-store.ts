
import { create } from "zustand";


export type ColorConfig = {
    type: "solid" | "gradient";
    value: string;
}

// Path point types for clip-path editor
export type PathPointType = 'L' | 'Q' | 'C';
export interface PathPoint {
    id: string;
    x: number;
    y: number;
    type: PathPointType;
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
    type: "rectangle" | "circle" | "text" | "image"
    config: ElementConfig,
    content?: string;
}




interface CanvasStore {
    elements: ElementsProps[];
    selected: ElementsProps[];
    setSelected: (elements: ElementsProps[]) => void;
    addElement?: (type: ElementsProps["type"]) => void;
    updateElementConfig?: (id: string, newConfig: Partial<ElementConfig>) => void;
    removeElement?: (id: string) => void;
}
export const useCanvasStore = create<CanvasStore>((set, get) => ({
    selected: [],
    elements: [],
    setSelected: (elements) => set({ selected: elements }),
    addElement: (type) => {
        function randomHexColor() {
            return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
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
        }


        const newEl: ElementsProps = {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            config: elementsTypeToAdd[type].config,
        };

        set({ elements: [...get().elements, newEl] });

    },

    updateElementConfig: (id, newConfig) => {
        const elemets = get().selected.map((el) => {
            if (el.id === id) {
                return {
                    ...el,
                    config: {
                        ...el.config,
                        ...newConfig,
                        // Deep merge para style
                        style: {
                            ...el.config.style,
                            ...newConfig.style,
                        },
                    },
                };
            }
            return el;
        });
        set({
            elements: get().elements.map(el => {
                const updatedEl = elemets.find(e => e.id === el.id);
                return updatedEl ? updatedEl : el;
            })
        });
    },

    removeElement: (id) => {
        set({
            elements: get().elements.filter(el => el.id !== id),
            selected: get().selected.filter(el => el.id !== id),
        });
    },
}));