import {
  Palette,
  Plus,
  Type,
  Shapes,
  Circle,
  Triangle,
  Minus,
  ImageIcon,
  Save,
  Download,
  Upload,
  Trash,
  FileImage,
  Layers,
} from "lucide-react";
import { Button } from "@creative-ds/ui";
import GradientControl from "../gradient-control";
import { FloatingMenuItem } from "./floating-menu-item";
import {
  useCreativeStore,
  INITIAL_COLOR_CONFIG,
} from "@/stores/creative-store";
import { TextControls } from "../text-controls";
import { ShapeControls } from "../shape-controls";
import { ImageGallery } from "../image-gallery";
import { LayersControl } from "../layers/layers-control";

// Re-export for backward compatibility

export function FloatingMenus() {
  const background = useCreativeStore((state) => state.background);
  const updateBackground = useCreativeStore((state) => state.updateBackground);
  const addTextbox = useCreativeStore((state) => state.addTextbox);
  const addRectangle = useCreativeStore((state) => state.addRectangle);
  const selectedElements = useCreativeStore((state) => state.selectedCanvasIds);
  const addCircle = useCreativeStore((state) => state.addCircle);
  const addTriangle = useCreativeStore((state) => state.addTriangle);
  const addLine = useCreativeStore((state) => state.addLine);
  const downloadCanvas = useCreativeStore((state) => state.downloadCanvas);
  const importCanvas = useCreativeStore((state) => state.importCanvas);
  const clearCanvas = useCreativeStore((state) => state.clearCanvas);
  const exportCanvasAsPNG = useCreativeStore(
    (state) => state.exportCanvasAsPNG,
  );
  const exportCanvasAsJPG = useCreativeStore(
    (state) => state.exportCanvasAsJPG,
  );
  const exportCanvasAsPDF = useCreativeStore(
    (state) => state.exportCanvasAsPDF,
  );
  const hasSelectedText = selectedElements.some((id) => {
    const element = useCreativeStore
      .getState()
      .canvasElements.find((el) => el.id === id);
    return element?.type === "text";
  });

  const hasSelectedShapes = selectedElements.some((id) => {
    const element = useCreativeStore
      .getState()
      .canvasElements.find((el) => el.id === id);
    return element?.type && element.type !== "text";
  });


  const handleImportCanvas = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".toon";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        importCanvas(text);
        alert("Canvas carregado com sucesso!");
      } catch (error) {
        alert(
          "Erro ao carregar canvas: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
        );
      }
    };
    input.click();
  };

  const handleClearCanvas = () => {
    if (confirm("Tem certeza que deseja limpar todo o canvas?")) {
      clearCanvas();
    }
  };

  return (
    <div className="absolute top-1/2 right-1/2 translate-x-[350px] p-1 bg-background -translate-y-1/2 flex flex-col gap-3 z-999999 ">
      <FloatingMenuItem
        contentTitle="Fundo"
        trigger={<Palette />}
        menuContent={
          <GradientControl
            setColorConfig={(newConfig) => {
              if (typeof newConfig === "function") {
                // Pegar o valor mais recente do background do store
                const latestBackground = useCreativeStore.getState().background;
                const updatedConfig = newConfig(
                  latestBackground || INITIAL_COLOR_CONFIG,
                );
                updateBackground(updatedConfig);
              } else {
                updateBackground(newConfig);
              }
            }}
            colorConfig={background || INITIAL_COLOR_CONFIG}
            enableGradient
            enableImage
            enableVideo
            enablePattern
          />
        }
      />

      <FloatingMenuItem
        contentTitle="Adicionar Objetos"
        trigger={<Plus />}
        menuContent={
          <div className="pt-4 space-y-2 max-h-[500px] overflow-y-auto [&>div]:w-full [&>div>button>span]:flex">
            <Button
              onClick={() => addTextbox()}
              className="flex justify-start w-full "
            >
              <Type className="w-4 h-4 mr-2" />
              Texto
            </Button>
            <Button
              onClick={() => addRectangle()}
              className="w-full justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              Retângulo
            </Button>
            <Button
              onClick={() => addCircle()}
              className="w-full justify-start"
            >
              <Circle className="w-4 h-4 mr-2" />
              Círculo
            </Button>
            <Button
              onClick={() => addTriangle()}
              className="w-full justify-start"
            >
              <Triangle className="w-4 h-4 mr-2" />
              Triângulo
            </Button>
            <Button onClick={() => addLine()} className="w-full justify-start">
              <Minus className="w-4 h-4 mr-2" />
              Linha
            </Button>
          </div>
        }
      />

      <FloatingMenuItem
        contentTitle="Galeria de Imagens"
        trigger={<ImageIcon />}
        menuContent={<ImageGallery />}
      />

      <FloatingMenuItem
        contentTitle="Controles de Texto"
        trigger={<Type />}
        menuContent={<TextControls />}
      />

      <FloatingMenuItem
        contentTitle="Controles de Elemento"
        trigger={<Shapes />}
        menuContent={<ShapeControls />}
      />

      <FloatingMenuItem
        contentTitle="Camadas"
        trigger={<Layers />}
        menuContent={<LayersControl />}
      />

      <FloatingMenuItem
        contentTitle="Salvar/Carregar"
        trigger={<Save />}
        menuContent={
          <div className="pt-4 space-y-2 w-full">
            <Button onClick={() => downloadCanvas()} className="w-full ">
              <div className="flex items-center justify-start w-full">
                <Download className="w-4 h-4 mr-2" />
                <span>Baixar Canvas (.toon)</span>
              </div>
            </Button>
            <Button
              onClick={handleImportCanvas}
              className="w-full"
              variant="outline"
            >
              <div className="flex items-center justify-start w-full">
                <Upload className="w-4 h-4 mr-2" />
                <span>Carregar Canvas</span>
              </div>
            </Button>
            <Button
              onClick={handleClearCanvas}
              className="w-full"
              variant="destructive"
            >
              <div className="flex items-center justify-start w-full">
                <Trash className="w-4 h-4 mr-2" />
                <span>Limpar Canvas</span>
              </div>
            </Button>
          </div>
        }
      />

      <FloatingMenuItem
        contentTitle="Exportar Imagem"
        trigger={<FileImage />}
        menuContent={
          <div className="pt-4 space-y-2 w-full">
            <Button onClick={() => exportCanvasAsPNG()} className="w-full">
              <div className="flex items-center justify-start w-full">
                <FileImage className="w-4 h-4 mr-2" />
                <span>Exportar como PNG</span>
              </div>
            </Button>
            <Button
              onClick={() => exportCanvasAsJPG()}
              className="w-full"
              variant="secondary"
            >
              <div className="flex items-center justify-start w-full">
                <FileImage className="w-4 h-4 mr-2" />
                <span>Exportar como JPG</span>
              </div>
            </Button>
            <Button
              onClick={() => exportCanvasAsPDF()}
              className="w-full"
              variant="outline"
            >
              <div className="flex items-center justify-start w-full">
                <FileImage className="w-4 h-4 mr-2" />
                <span>Exportar como PDF</span>
              </div>
            </Button>
          </div>
        }
      />
    </div>
  );
}
