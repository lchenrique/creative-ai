import { FloatingMenuItem } from "@/components/floating-menu/floating-menu-item";
import { ShapeControls } from "@/components/shape-controls";
import { useCanvasStore, type ElementsProps } from "@/stores/canva-store";
import { Button } from "@creative-ds/ui";
import { PlusIcon, ShapesIcon, TextTIcon } from "@phosphor-icons/react";
import { CircleIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { BackgroundController } from "../controllers/background-controller";
import bgColorSvg from "@/assets/bg-color.svg";
import { TextElement } from "./text-element";
import { colorConfigToCss } from "@/lib/gradient-utils";

interface ElemetsComponentProps {
  selectedIds?: string[];
  editingTextId?: string | null;
  onEditEnd?: () => void;
}

interface ElementProps {
  element: ElementsProps;
  isEditing?: boolean;
  onEditEnd?: () => void;
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

  const bgColor = element.config.style.backgroundColor;
  const cssBackground = bgColor
    ? colorConfigToCss(
        bgColor,
        element.config.size.width,
        element.config.size.height,
      )
    : undefined;

  return (
    <div
      style={{
        width: element.config.size.width,
        height: element.config.size.height,
        left: element.config.position.x,
        top: element.config.position.y,
        background: cssBackground,
      }}
    />
  );
};

export const Elements = ({
  selectedIds,
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

  return (
    <>
      <div className="elements selecto-area gap-2 ">
        {elements.map((element) => {
          return (
            <div
              data-element-id={element.id}
              className="cube absolute group"
              key={element.id}
              style={{
                width: element.config.size?.width || 120,
                height: element.config.size?.height || 120,
                borderRadius: element.config.style.borderRadius
                  ? `${element.config.style.borderRadius}px`
                  : undefined,
                clipPath: element.config.style.clipPath || undefined,
              }}
            >
              <Element
                element={element}
                isEditing={editingTextId === element.id}
                onEditEnd={onEditEnd}
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
  const addElement = useCanvasStore((s) => s.addElement);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const elements = useCanvasStore((s) => s.elements);
  const bgSlected = useCanvasStore((s) => s.bgSlected);

  // Pega os elementos selecionados baseado nos IDs
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));

  return (
    <div
      data-slot="floating-menu-content"
      className="flex flex-col  gap-2  z-9999"
    >
      <FloatingMenuItem
        contentTitle="Adicionar Objetos"
        trigger={<PlusIcon weight="bold" />}
        variant="primary"
        menuContent={
          <div className=" space-y-2 max-h-[500px] overflow-y-auto [&>div]:w-full [&>div>button>span]:flex">
            <Button
              onClick={() => addElement?.("text")}
              className="flex justify-start w-full "
            >
              <TextTIcon className="w-4 h-4 mr-2" />
              Texto
            </Button>
            <Button
              onClick={() => addElement?.("rectangle")}
              className="w-full justify-start"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Retângulo
            </Button>
            <Button
              onClick={() => addElement?.("circle")}
              className="w-full justify-start"
            >
              <CircleIcon className="w-4 h-4 mr-2" />
              Círculo
            </Button>
            {/* <Button
                            onClick={() => addElement?.("triangle")}
                            className="w-full justify-start"
                        >
                            <TriangleIcon className="w-4 h-4 mr-2" />
                            Triângulo
                        </Button> */}
            {/* <Button onClick={() => addLine()} className="w-full justify-start">
                            <MinusIcon className="w-4 h-4 mr-2" />
                            Linha
                        </Button> */}
          </div>
        }
      />

      <FloatingMenuItem
        contentTitle="Controles de Elemento"
        trigger={<ShapesIcon weight="bold" />}
        menuContent={<ShapeControls />}
        open={
          selectedElements.length > 0
            ? !!selectedElements.find((e) => e.type === "rectangle")?.id
            : false
        }
      />

      <FloatingMenuItem
        contentTitle="Controles de Background"
        trigger={<img src={bgColorSvg} className="size-4.5 " />}
        menuContent={<BackgroundController />}
        open={bgSlected}
      />
    </div>
  );
};
