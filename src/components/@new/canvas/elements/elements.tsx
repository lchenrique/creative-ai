import bgColorSvg from "@/assets/bg-color.svg";
import sampleImage from "@/assets/sample-image.png";
import { ShapeControls } from "@/components/shape-controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { filters } from "@/lib/filters";
import { useCanvasStore, type ElementsProps } from "@/stores/canva-store";
import { ShapesIcon, TextTIcon } from "@phosphor-icons/react";
import { useRef, useState, type CSSProperties } from "react";
import { BackgroundController } from "../../controllers/background-controller";
import { TextController } from "../../controllers/text-controller";
import { FilterSelector } from "../../image-selector/filter-selector";
import { FloatingMenuItem } from "../../menu/floating-menu/floating-menu-item";
import { ShapeElement } from "./shape-elemen";
import { TextElement } from "./text-element";
import { ImageElement } from "./image-element";
import { ImageController } from "../../controllers/image-controller";

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
  console.log({ element });
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
  const updateElementConfig = useCanvasStore(
    (state) => state.updateElementConfig,
  );

  const handleTextChange = (elementId: string, text: string) => {
    updateElementConfig?.(elementId, {
      style: { text },
    });
  };
  const ElementsArr = Object.values(elements);

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
              }}
            >
              <Element
                element={element}
                isEditing={editingTextId === element.id}
                onEditEnd={(newHeight) => onEditEnd?.(element.id, newHeight)}
                onTextChange={(text) => handleTextChange(element.id, text)}
              />
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
