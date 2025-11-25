import bgColorSvg from "@/assets/bg-color.svg";
import { ShapeControls } from "@/components/shape-controls";
import { useCanvasStore, type ElementsProps } from "@/stores/canva-store";
import { ShapesIcon, TextTIcon } from "@phosphor-icons/react";
import { useRef, type CSSProperties } from "react";
import { BackgroundController } from "../../controllers/background-controller";
import { ImageController } from "../../controllers/image-controller";
import { TextController } from "../../controllers/text-controller";
import { FloatingMenuItem } from "../../menu/floating-menu/floating-menu-item";
import { ElementActions } from "./element-actions";
import { ImageElement } from "./image-element";
import { ShapeElement } from "./shape-elemen";
import { TextElement } from "./text-element";

interface ElemetsComponentProps {
  selectedIds?: string[];
  editingTextId?: string | null;
  onEditEnd?: (elementId: string, newHeight?: number) => void;
}

interface ElementProps {
  element: ElementsProps;
  isEditing?: boolean;
  onEditEnd?: (newHeight?: number) => void;
  onTextChange?: (text: string) => void;
}

const Element = ({
  element,
  isEditing,
  onEditEnd,
  onTextChange,
}: ElementProps) => {
  const ref = useRef<HTMLDivElement>(null);

  if (!element) return null;

  if (element.type === "text") {
    return (
      <TextElement
        el={element}
        editing={isEditing || false}
        editableRef={ref}
        onEditEnd={onEditEnd}
        onTextChange={onTextChange}
      />
    );
  }

  if (element.type === "image") {
    return <ImageElement element={element} />;
  }

  return (
    <ShapeElement element={element} />

  );
};

export const Elements = ({
  editingTextId,
  onEditEnd,
}: ElemetsComponentProps) => {
  const elements = useCanvasStore((state) => state.elements);
  const duplicateElement = useCanvasStore((state) => state.duplicateElement);
  const removeElement = useCanvasStore((state) => state.removeElement);
  const updateElementConfig = useCanvasStore(
    (state) => state.updateElementConfig,
  );

  const handleTextChange = (elementId: string, text: string) => {
    updateElementConfig?.(elementId, {
      style: { text },
    });
  };
  const ElementsArr = Object.values(elements);


  const handleDuplicate = (element: ElementsProps) => {
    duplicateElement?.(element);
  }

  const handleDelete = (elementId: string) => {
    window.dispatchEvent(new CustomEvent("-delete-element", { detail: { elementId } }));
  }

  const handleRemoveBackground = async (element: ElementsProps) => {
    if (element.type !== "image") return;

    const imageUrl = element.config.style.backgroundColor?.value;
    if (!imageUrl || typeof imageUrl !== "string") {
      console.error("No image URL found");
      return;
    }

    try {
      // Show loading toast
      const loadingToast = document.createElement("div");
      loadingToast.id = "bg-removal-toast";
      loadingToast.className = "fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg z-[9999] flex items-center gap-3";
      loadingToast.innerHTML = `
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
        <div>
          <div class="font-medium">Removendo fundo...</div>
          <div class="text-xs opacity-80">Processando no servidor...</div>
        </div>
      `;
      document.body.appendChild(loadingToast);

      console.log("Removing background (backend)...");

      const response = await fetch(`${import.meta.env.VITE_VECTORIZE_API_URL}/remove-background`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove background");
      }

      const data = await response.json();

      if (data.success && data.image) {
        // Update element with new image (background removed)
        updateElementConfig?.(element.id, {
          style: {
            backgroundColor: { type: "image", value: data.image },
          },
        });

        // Remove loading toast
        loadingToast.remove();

        // Show success toast
        const successToast = document.createElement("div");
        successToast.className = "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-[9999] flex items-center gap-3";
        successToast.innerHTML = `
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Fundo removido!</span>
        `;
        document.body.appendChild(successToast);
        setTimeout(() => successToast.remove(), 2000);

        console.log("Background removed successfully!");
      }
    } catch (error) {
      // Remove loading toast if exists
      document.getElementById("bg-removal-toast")?.remove();

      console.error("Error removing background:", error);

      // Show error toast
      const errorToast = document.createElement("div");
      errorToast.className = "fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg z-[9999] flex items-center gap-3";
      errorToast.innerHTML = `
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>Erro ao remover fundo</span>
      `;
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    }
  }

  return (
    <>
      <div className="elements selecto-area gap-2 ">
        {ElementsArr.map((element) => {
          return (
            <div
              data-element-id={element.id}
              className="cube absolute group"
              key={element.id}
              style={{
                width: element.config.size?.width || 120,
                height: element.config.size?.height || 120,
                borderRadius: element.config.style.borderRadius,
                clipPath: element.config.style.clipPath || undefined,
                mixBlendMode: element.config.style.mixBlendMode as CSSProperties["mixBlendMode"] || "normal",
                opacity: element.config.style.opacity,
                transform: `translate(${element.config.position.x}px, ${element.config.position.y}px)`,
              }}
            >
              <ElementActions
                element={element}
                onDuplicate={handleDuplicate}
                onDelete={() => handleDelete(element.id)}
                onRemoveBackground={handleRemoveBackground}
              >
                <div style={{ width: '100%', height: '100%' }}>
                  <Element
                    element={element}
                    isEditing={editingTextId === element.id}
                    onEditEnd={(newHeight) => onEditEnd?.(element.id, newHeight)}
                    onTextChange={(text) => handleTextChange(element.id, text)}
                  />
                </div>
              </ElementActions>

            </div>
          );
        })}
      </div>
      <div className="empty elements"></div>
    </>
  );
};

export const Menu = () => {
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const elements = useCanvasStore((s) => s.elements);
  const bgSlected = useCanvasStore((s) => s.bgSlected);

  // Pega os elementos selecionados baseado nos IDs
  const selectedElements = Object.values(elements).filter((el) => selectedIds.includes(el.id));

  return (
    <div
      data-slot="floating-menu-content"
      className="flex flex- absolute -top-10  gap-2  z-9999"
    >
      <FloatingMenuItem
        contentTitle="Controles de Elemento"
        trigger={<ShapesIcon weight="bold" />}
        menuContent={<ShapeControls />}
        open={
          selectedElements.length > 0
            ? !!selectedElements.find(
              (e) => e.type === "rectangle" || e.type === "circle",
            )?.id
            : false
        }
      />

      <FloatingMenuItem
        contentTitle="Controles de Texto"
        trigger={<TextTIcon weight="bold" />}
        menuContent={<TextController />}
        open={
          selectedElements.length > 0
            ? !!selectedElements.find((e) => e.type === "text")?.id
            : false
        }
      />

      <FloatingMenuItem
        contentTitle="Controles de Background"
        trigger={<img src={bgColorSvg} className="size-4.5 " />}
        menuContent={<BackgroundController />}
        open={bgSlected}
      />
      <FloatingMenuItem
        contentTitle="Controles de Imagem"
        trigger={<img src={bgColorSvg} className="size-4.5 " />}
        menuContent={<ImageController />}
        open={selectedElements.length > 0 && !!selectedElements.find((e) => e.type === "image")?.id}
      />
    </div>
  );
};
