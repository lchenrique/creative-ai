import type { ColorConfig } from "@/components/gradient-control";
import { create } from "zustand";
import { encode, decode } from "@toon-format/toon";

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
};

export interface TextProperties {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: "normal" | "italic";
  fill: ColorConfig;
  textAlign: "left" | "center" | "right" | "justify";
  letterSpacing: number;
  lineHeight: number;
}

export interface LayerObject {
  id: string;
  type: string;
  visible: boolean;
  locked: boolean;
  name: string;
}

// Canvas Element (nosso canvas nativo)
export interface CanvasElement {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  color: string;
  groupId?: number;
  isGroup?: boolean;
  children?: number[];
  type?:
    | "box"
    | "text"
    | "circle"
    | "triangle"
    | "line"
    | "image"
    | "svg-clipart";
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right" | "justify";
  letterSpacing?: number;
  lineHeight?: number;
  // Shadow properties
  shadowEnabled?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  image?: string;
  background?: ColorConfig;
  // SVG Clipart specific properties
  svgContent?: string; // Conteúdo SVG completo
  svgColors?: string[]; // Cores extraídas do SVG
  originalSvgUrl?: string; // URL original do SVG
}

export interface CreativeStore {
  // Background
  background: ColorConfig;
  updateBackground: (config: ColorConfig) => void;

  // Canvas Elements State
  canvasElements: CanvasElement[];
  selectedCanvasIds: number[];

  // Element Management
  setCanvasElements: (
    elements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[]),
  ) => void;
  setSelectedCanvasIds: (ids: number[]) => void;
  addElement: (element: CanvasElement) => void;
  removeElement: (id: number) => void;
  updateElement: (id: number, updates: Partial<CanvasElement>) => void;

  // Bulk Operations
  getSelectedElements: () => CanvasElement[];
  updateSelectedElements: (updates: Partial<CanvasElement>) => void;
  deleteSelected: () => void;

  // Shape Creators (helper functions)
  addShape: (
    type: CanvasElement["type"],
    overrides?: Partial<CanvasElement>,
  ) => void;
  addRectangle: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addTextbox: () => void;
  addImage: () => void;

  // Image/Clipart Creators
  addClipartToCanvas: (svgContent: string, url: string) => void;
  addImageToCanvas: (imageUrl: string) => void;

  // Convert PNG to SVG
  convertImageToSVG: (elementId: number) => Promise<void>;

  // Save/Load Canvas (usando TOON format)
  exportCanvas: () => string;
  importCanvas: (toon: string) => void;
  downloadCanvas: (fileName?: string) => void;
  clearCanvas: () => void;

  // Export Canvas as Image
  exportCanvasAsPNG: () => Promise<void>;
  exportCanvasAsJPG: () => Promise<void>;
  exportCanvasAsPDF: () => Promise<void>;

  // Remove Background from Image
  removeBackground: (elementId: number) => Promise<void>;
}

const getNextId = (elements: CanvasElement[]) =>
  Math.max(...elements.map((e) => e.id), 0) + 1;

// Helper function para preparar canvas para exportação
const prepareCanvasForExport = async () => {
  const canvasElement = document.getElementById("canvas-paper");
  if (!canvasElement) {
    throw new Error("Canvas não encontrado");
  }

  // Adicionar classe temporária
  canvasElement.classList.add("exporting");

  // Adicionar CSS temporário
  const style = document.createElement("style");
  style.id = "export-temp-style";
  style.textContent = `
    .exporting * {
      border: none !important;
      outline: none !important;
    }
    .exporting .moveable-control-box,
    .exporting .moveable-line,
    .exporting .moveable-direction {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  // Aguardar CSS ser aplicado
  await new Promise((resolve) => setTimeout(resolve, 100));

  return canvasElement;
};

// Helper function para limpar após exportação
const cleanupAfterExport = () => {
  const canvasElement = document.getElementById("canvas-paper");
  canvasElement?.classList.remove("exporting");
  document.getElementById("export-temp-style")?.remove();
};

export const useCreativeStore = create<CreativeStore>((set, get) => ({
  // Background
  background: INITIAL_COLOR_CONFIG,
  updateBackground: (config) => set({ background: config }),

  // Canvas Elements State
  canvasElements: [
    {
      id: 1,
      x: 50,
      y: 50,
      w: 150,
      h: 100,
      angle: 0,
      color: "bg-blue-500",
      type: "box",
    },
    {
      id: 2,
      x: 280,
      y: 140,
      w: 180,
      h: 120,
      angle: 0,
      color: "bg-green-500",
      type: "box",
    },
    {
      id: 3,
      x: 520,
      y: 220,
      w: 140,
      h: 140,
      angle: 0,
      color: "bg-pink-500",
      type: "box",
    },
    {
      id: 4,
      x: 100,
      y: 400,
      w: 300,
      h: 50,
      angle: 0,
      color: "transparent",
      type: "text",
      text: "Clique duas vezes para editar",
      fontSize: 24,
      fontFamily: "Arial",
      fontWeight: "normal",
    },
  ],
  selectedCanvasIds: [],

  // Element Management
  setCanvasElements: (elements) =>
    set({
      canvasElements:
        typeof elements === "function"
          ? elements(get().canvasElements)
          : elements,
    }),

  setSelectedCanvasIds: (ids) => set({ selectedCanvasIds: ids }),

  addElement: (element) =>
    set((state) => ({
      canvasElements: [...state.canvasElements, element],
      selectedCanvasIds: [element.id],
    })),

  removeElement: (id) =>
    set((state) => ({
      canvasElements: state.canvasElements.filter((el) => el.id !== id),
      selectedCanvasIds: state.selectedCanvasIds.filter(
        (selectedId) => selectedId !== id,
      ),
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      canvasElements: state.canvasElements.map((el) =>
        el.id === id ? { ...el, ...updates } : el,
      ),
    })),

  // Bulk Operations
  getSelectedElements: () => {
    const state = get();
    return state.canvasElements.filter((el) =>
      state.selectedCanvasIds.includes(el.id),
    );
  },

  updateSelectedElements: (updates) =>
    set((state) => ({
      canvasElements: state.canvasElements.map((el) =>
        state.selectedCanvasIds.includes(el.id) ? { ...el, ...updates } : el,
      ),
    })),

  deleteSelected: () =>
    set((state) => ({
      canvasElements: state.canvasElements.filter(
        (el) => !state.selectedCanvasIds.includes(el.id),
      ),
      selectedCanvasIds: [],
    })),

  // Shape Creators - Single generic function
  addShape: (
    type: CanvasElement["type"],
    overrides?: Partial<CanvasElement>,
  ) => {
    const state = get();
    const id = getNextId(state.canvasElements);

    // Default configs for each shape type
    const shapeDefaults: Record<
      NonNullable<CanvasElement["type"]>,
      Omit<CanvasElement, "id" | "x" | "y" | "angle" | "type">
    > = {
      box: { w: 150, h: 100, color: "bg-blue-500" },
      circle: { w: 100, h: 100, color: "bg-red-500" },
      triangle: { w: 100, h: 100, color: "bg-yellow-500" },
      line: { w: 200, h: 5, color: "bg-gray-800" },
      text: {
        w: 200,
        h: 50,
        color: "transparent",
        text: "Digite aqui",
        fontSize: 24,
        fontFamily: "Arial",
        fontWeight: "normal",
      },
      image: { w: 150, h: 150, color: "bg-gray-300" },
      "svg-clipart": { w: 150, h: 150, color: "transparent" },
    };

    const defaults = shapeDefaults[type!];
    const element: CanvasElement = {
      id,
      x: 100,
      y: 100,
      angle: 0,
      type,
      ...defaults,
      ...overrides,
    };

    state.addElement(element);
  }, // Convenience methods (wrapper around addShape)
  addRectangle: () => get().addShape("box"),
  addCircle: () => get().addShape("circle"),
  addTriangle: () => get().addShape("triangle"),
  addLine: () => get().addShape("line"),
  addTextbox: () => get().addShape("text"),
  addImage: () => get().addShape("image"),

  // Add SVG Clipart to Canvas
  addClipartToCanvas: async (svgContent: string, url: string) => {
    const state = get();
    const id = getNextId(state.canvasElements);

    // Importar a função de extração de cores
    const { extractColorsFromSVG } = await import("@/lib/svg-color-utils");
    const colors = extractColorsFromSVG(svgContent);

    // Criar elemento SVG temporário para obter dimensões
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = svgDoc.querySelector("svg");

    let width = 150;
    let height = 150;

    if (svgElement) {
      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const [, , w, h] = viewBox.split(" ").map(Number);
        width = w || 150;
        height = h || 150;
      } else {
        width = parseFloat(svgElement.getAttribute("width") || "150");
        height = parseFloat(svgElement.getAttribute("height") || "150");
      }
    }

    const element: CanvasElement = {
      id,
      x: 100,
      y: 100,
      w: width,
      h: height,
      angle: 0,
      color: "transparent",
      type: "svg-clipart",
      svgContent,
      svgColors: colors,
      originalSvgUrl: url,
    };

    state.addElement(element);
  },

  // Add regular image to Canvas
  addImageToCanvas: (imageUrl: string) => {
    const state = get();
    const id = getNextId(state.canvasElements);

    const element: CanvasElement = {
      id,
      x: 100,
      y: 100,
      w: 200,
      h: 200,
      angle: 0,
      color: "transparent",
      type: "image",
      image: imageUrl,
    };

    state.addElement(element);
  },

  // Converter imagem PNG para SVG
  convertImageToSVG: async (elementId: number) => {
    const state = get();
    const element = state.canvasElements.find((el) => el.id === elementId);

    if (!element || element.type !== "image" || !element.image) {
      console.error("Elemento não é uma imagem ou não tem URL");
      return;
    }

    try {
      // Importar a função de conversão
      const { convertPNGtoSVG } = await import("@/lib/png-to-svg");

      // Converter PNG para SVG
      const svgContent = await convertPNGtoSVG(element.image);

      // Importar extração de cores
      const { extractColorsFromSVG } = await import("@/lib/svg-color-utils");
      const colors = extractColorsFromSVG(svgContent);

      // Atualizar elemento para SVG
      state.updateElement(elementId, {
        type: "svg-clipart",
        svgContent,
        svgColors: colors,
        originalSvgUrl: element.image,
      });

      console.log("✅ Imagem convertida para SVG com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao converter imagem para SVG:", error);
      throw error;
    }
  },

  // Exportar canvas para TOON (Token-Oriented Object Notation)
  exportCanvas: () => {
    const state = get();
    const canvasData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      background: state.background,
      elements: state.canvasElements,
    };
    return encode(canvasData);
  },

  // Importar canvas de TOON
  importCanvas: (toon: string) => {
    try {
      const canvasData = decode(toon) as any;

      // Validar estrutura básica
      if (
        !canvasData ||
        !canvasData.elements ||
        !Array.isArray(canvasData.elements)
      ) {
        throw new Error("Formato inválido: elementos não encontrados");
      }

      set({
        canvasElements: canvasData.elements as CanvasElement[],
        background: canvasData.background || INITIAL_COLOR_CONFIG,
        selectedCanvasIds: [],
      });

      console.log("✅ Canvas carregado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao importar canvas:", error);
      throw error;
    }
  },

  // Fazer download do canvas em TOON
  downloadCanvas: (fileName = "canvas-design.toon") => {
    const state = get();
    const toon = state.exportCanvas();
    const blob = new Blob([toon], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("✅ Canvas salvo com sucesso em formato TOON!");
  },

  // Limpar canvas
  clearCanvas: () => {
    set({
      canvasElements: [],
      selectedCanvasIds: [],
      background: INITIAL_COLOR_CONFIG,
    });
    console.log("✅ Canvas limpo!");
  },

  // Exportar canvas como PNG
  exportCanvasAsPNG: async () => {
    try {
      const domtoimage = (await import("dom-to-image-more")).default;
      const canvasElement = await prepareCanvasForExport();

      const blob = await domtoimage.toBlob(canvasElement, {
        quality: 1.0,
        bgcolor: null,
      });

      cleanupAfterExport();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `canvas-design-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("✅ PNG exportado com sucesso!");
    } catch (error) {
      cleanupAfterExport();
      console.error("❌ Erro ao exportar PNG:", error);
      throw error;
    }
  },

  // Exportar canvas como JPG
  exportCanvasAsJPG: async () => {
    try {
      const domtoimage = (await import("dom-to-image-more")).default;
      const canvasElement = await prepareCanvasForExport();

      const dataUrl = await domtoimage.toJpeg(canvasElement, {
        quality: 0.95,
        bgcolor: "#ffffff",
      });

      // Converter dataURL para blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      cleanupAfterExport();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `canvas-design-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("✅ JPG exportado com sucesso!");
    } catch (error) {
      cleanupAfterExport();
      console.error("❌ Erro ao exportar JPG:", error);
      throw error;
    }
  },

  // Exportar canvas como PDF
  exportCanvasAsPDF: async () => {
    try {
      const domtoimage = (await import("dom-to-image-more")).default;
      const { jsPDF } = await import("jspdf");
      const canvasElement = await prepareCanvasForExport();

      const imgData = await domtoimage.toPng(canvasElement, {
        quality: 1.0,
        bgcolor: "#ffffff",
      });

      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      cleanupAfterExport();

      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, img.width, img.height);
      pdf.save(`canvas-design-${Date.now()}.pdf`);
      console.log("✅ PDF exportado com sucesso!");
    } catch (error) {
      cleanupAfterExport();
      console.error("❌ Erro ao exportar PDF:", error);
      throw error;
    }
  },

  // Remover fundo de uma imagem
  removeBackground: async (elementId: number) => {
    const state = get();
    const element = state.canvasElements.find((el) => el.id === elementId);

    if (!element || element.type !== "image" || !element.image) {
      throw new Error("Elemento não é uma imagem");
    }

    try {
      console.log("🔄 Removendo fundo da imagem...");

      const VECTORIZE_API_URL =
        import.meta.env.VITE_VECTORIZE_API_URL || "http://localhost:3001";

      const response = await fetch(`${VECTORIZE_API_URL}/remove-background`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: element.image,
          outputFormat: "image/png",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Falha ao remover fundo",
        );
      }

      if (!data?.success || !data.image) {
        throw new Error("Resposta inválida do serviço de remoção de fundo");
      }

      // Atualizar elemento com nova imagem sem fundo
      state.updateElement(elementId, {
        image: data.image,
      });

      console.log("✅ Fundo removido com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao remover fundo:", error);
      throw error;
    }
  },
}));
