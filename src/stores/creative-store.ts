import type { ColorConfig } from "@/components/gradient-control"
import type { FabricTemplate } from "@/types/templates"
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
    applyPatternToObject: ((imageUrl: string, repeatMode?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat') => void) | null
    removePatternFromObject: ((color?: string) => void) | null
    applyImageAsClipMask: ((imageUrl: string) => Promise<void>) | null
    // Simple ClipPath functions
    applyClipPathToObject: ((clipShapeType?: 'circle' | 'rect' | 'path', showShell?: boolean) => Promise<void>) | null
    removeClipPath: (() => void) | null
    // Image Frame functions
    convertToImageFrame: ((imageUrl?: string) => Promise<void>) | null
    removeFrameImage: (() => void) | null
    // Clip Group functions (legacy)
    convertToClipGroup: (() => Promise<any>) | null
    enterClipGroupEditMode: (() => void) | null
    exitClipGroupEditMode: (() => void) | null
    addToClipGroup: ((object: any) => void) | null
    removeFromClipGroup: ((object: any) => void) | null
    convertClipGroupToNormal: (() => void) | null
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
        applyPatternToObject?: (imageUrl: string, repeatMode?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat') => void
        removePatternFromObject?: (color?: string) => void
        applyImageAsClipMask?: (imageUrl: string) => Promise<void>
        applyClipPathToObject?: (clipShapeType?: 'circle' | 'rect' | 'path', showShell?: boolean) => Promise<void>
        removeClipPath?: () => void
        convertToImageFrame?: (imageUrl?: string) => Promise<void>
        removeFrameImage?: () => void
        convertToClipGroup?: () => Promise<any>
        enterClipGroupEditMode?: () => void
        exitClipGroupEditMode?: () => void
        addToClipGroup?: (object: any) => void
        removeFromClipGroup?: (object: any) => void
        convertClipGroupToNormal?: () => void
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
    // Template management
    currentTemplate: FabricTemplate | null
    setCurrentTemplate: (template: FabricTemplate | null) => void
    loadTemplateIntoCanvas: ((template: FabricTemplate) => void) | null
    setLoadTemplateAction: (action: (template: FabricTemplate) => void) => void
    // Parametrized canvas actions for AI
    canvasToolsReady: boolean
    addTextboxWithParams: ((text: string, options?: any) => void) | null
    addRectangleWithParams: ((options?: any) => void) | null
    addCircleWithParams: ((options?: any) => void) | null
    addImageFromURLWithParams: ((url: string, options?: any) => void) | null
    setParametrizedActions: (actions: {
        addTextboxWithParams: (text: string, options?: any) => void
        addRectangleWithParams: (options?: any) => void
        addCircleWithParams: (options?: any) => void
        addImageFromURLWithParams: (url: string, options?: any) => void
    }) => void
    // Export actions
    exportCanvasImage: (() => string | null) | null
    exportCanvasJSON: (() => any) | null
    downloadDesign: (() => void) | null
    importCanvasJSON: ((jsonData: any) => void) | null
    setExportActions: (actions: {
        exportCanvasImage: () => string | null
        exportCanvasJSON: () => any
        downloadDesign: () => void
        importCanvasJSON: (jsonData: any) => void
    }) => void
    // Canvas instance
    fabricCanvas: any | null
    setFabricCanvas: (canvas: any) => void
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
    applyPatternToObject: null,
    removePatternFromObject: null,
    applyImageAsClipMask: null,
    applyClipPathToObject: null,
    removeClipPath: null,
    convertToImageFrame: null,
    removeFrameImage: null,
    convertToClipGroup: null,
    enterClipGroupEditMode: null,
    exitClipGroupEditMode: null,
    addToClipGroup: null,
    removeFromClipGroup: null,
    convertClipGroupToNormal: null,
    setCanvasActions: (actions) => set({
        addRectangle: actions.addRectangle,
        addTextbox: actions.addTextbox,
        addCircle: actions.addCircle,
        addTriangle: actions.addTriangle,
        addLine: actions.addLine,
        addStar: actions.addStar,
        addHeart: actions.addHeart,
        addImage: actions.addImage,
        addImageFromURL: actions.addImageFromURL,
        applyPatternToObject: actions.applyPatternToObject || null,
        removePatternFromObject: actions.removePatternFromObject || null,
        applyImageAsClipMask: actions.applyImageAsClipMask || null,
        applyClipPathToObject: actions.applyClipPathToObject || null,
        removeClipPath: actions.removeClipPath || null,
        convertToImageFrame: actions.convertToImageFrame || null,
        removeFrameImage: actions.removeFrameImage || null,
        convertToClipGroup: actions.convertToClipGroup || null,
        enterClipGroupEditMode: actions.enterClipGroupEditMode || null,
        exitClipGroupEditMode: actions.exitClipGroupEditMode || null,
        addToClipGroup: actions.addToClipGroup || null,
        removeFromClipGroup: actions.removeFromClipGroup || null,
        convertClipGroupToNormal: actions.convertClipGroupToNormal || null,
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
    // Template management
    currentTemplate: null,
    setCurrentTemplate: (template) => set({ currentTemplate: template }),
    loadTemplateIntoCanvas: null,
    setLoadTemplateAction: (action) => set({ loadTemplateIntoCanvas: action }),
    // Parametrized canvas actions for AI
    canvasToolsReady: false,
    addTextboxWithParams: null,
    addRectangleWithParams: null,
    addCircleWithParams: null,
    addImageFromURLWithParams: null,
    setParametrizedActions: (actions) => set({
        addTextboxWithParams: actions.addTextboxWithParams,
        addRectangleWithParams: actions.addRectangleWithParams,
        addCircleWithParams: actions.addCircleWithParams,
        addImageFromURLWithParams: actions.addImageFromURLWithParams,
        canvasToolsReady: true,
    }),
    // Export actions
    exportCanvasImage: null,
    exportCanvasJSON: null,
    downloadDesign: null,
    importCanvasJSON: null,
    setExportActions: (actions) => set({
        exportCanvasImage: actions.exportCanvasImage,
        exportCanvasJSON: actions.exportCanvasJSON,
        downloadDesign: actions.downloadDesign,
        importCanvasJSON: actions.importCanvasJSON,
    }),
    // Canvas instance
    fabricCanvas: null,
    setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
}))
