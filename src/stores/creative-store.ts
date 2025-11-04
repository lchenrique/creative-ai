import type { ColorConfig } from "@/components/gradient-control"
import { create } from "zustand"

export const INITIAL_COLOR_CONFIG: ColorConfig = {
    colorType: "solid",
    solidColor: "#ffffff",
    gradient: {
        type: "linear",
        angle: 90,
        radialType: "circle",
        radialSize: "farthest-corner",
        radialPosition: { x: 50, y: 50 },
        stops: [
            { id: "1", color: "#ff6b6b", position: 0, opacity: 100 },
            { id: "2", color: "#4ecdc4", position: 100, opacity: 100 },
        ],
    },
    pattern: null,
    image: null,
    video: null,
}

export interface TextProperties {
    fontFamily: string
    fontSize: number
    fontWeight: string
    fontStyle: 'normal' | 'italic'
    fill: ColorConfig
    textAlign: 'left' | 'center' | 'right' | 'justify'
    letterSpacing: number
    lineHeight: number
}

export interface LayerObject {
    id: string
    type: string
    visible: boolean
    locked: boolean
    name: string
}

export interface CreativeStore {
    background: ColorConfig
    updateBackground: (config: ColorConfig) => void
    // Canvas actions
    addRectangle: (() => void) | null
    addTextbox: (() => void) | null
    addCircle: (() => void) | null
    addTriangle: (() => void) | null
    addLine: (() => void) | null
    addStar: (() => void) | null
    addHeart: (() => void) | null
    addImage: (() => void) | null
    addImageFromURL: ((url: string) => void) | null
    setCanvasActions: (actions: {
        addRectangle: () => void
        addTextbox: () => void
        addCircle: () => void
        addTriangle: () => void
        addLine: () => void
        addStar: () => void
        addHeart: () => void
        addImage: () => void
        addImageFromURL: (url: string) => void
    }) => void
    // Layer management
    layers: LayerObject[]
    setLayers: (layers: LayerObject[]) => void
    updateLayer: (id: string, updates: Partial<LayerObject>) => void
    deleteLayer: (id: string) => void
    toggleLayerVisibility: (id: string) => void
    toggleLayerLock: (id: string) => void
    selectLayer: (id: string) => void
    // Selected text
    selectedText: TextProperties | null
    setSelectedText: (text: TextProperties | null) => void
    updateTextProperty: (property: Partial<TextProperties>) => void
}

export const useCreativeStore = create<CreativeStore>((set) => ({
    background: INITIAL_COLOR_CONFIG,
    updateBackground: (config: ColorConfig) => set({ background: config }),
    // Canvas actions
    addRectangle: null,
    addTextbox: null,
    addCircle: null,
    addTriangle: null,
    addLine: null,
    addStar: null,
    addHeart: null,
    addImage: null,
    addImageFromURL: null,
    setCanvasActions: (actions) => set({
        addRectangle: actions.addRectangle,
        addTextbox: actions.addTextbox,
        addCircle: actions.addCircle,
        addTriangle: actions.addTriangle,
        addLine: actions.addLine,
        addStar: actions.addStar,
        addHeart: actions.addHeart,
        addImage: actions.addImage,
        addImageFromURL: actions.addImageFromURL
    }),
    // Layer management
    layers: [],
    setLayers: (layers) => set({ layers }),
    updateLayer: (id, updates) => set((state) => ({
        layers: state.layers.map(layer =>
            layer.id === id ? { ...layer, ...updates } : layer
        )
    })),
    deleteLayer: (id) => set((state) => ({
        layers: state.layers.filter(layer => layer.id !== id)
    })),
    toggleLayerVisibility: (id) => set((state) => ({
        layers: state.layers.map(layer =>
            layer.id === id ? { ...layer, visible: !layer.visible } : layer
        )
    })),
    toggleLayerLock: (id) => set((state) => ({
        layers: state.layers.map(layer =>
            layer.id === id ? { ...layer, locked: !layer.locked } : layer
        )
    })),
    selectLayer: (id) => {
        // This will be implemented in the canvas component
        console.log('Select layer:', id)
    },
    // Selected text
    selectedText: null,
    setSelectedText: (text) => set({ selectedText: text }),
    updateTextProperty: (property) => set((state) => ({
        selectedText: state.selectedText ? { ...state.selectedText, ...property } : null
    })),
}))
