import bgColorSvg from "@/assets/bg-color.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShapeControls } from "@/components/shape-controls";
import { colorConfigToCss } from "@/lib/gradient-utils";
import { useCanvasStore, type ElementsProps } from "@/stores/canva-store";
import { ShapesIcon, TextTIcon } from "@phosphor-icons/react";
import { useRef } from "react";
import { BackgroundController } from "../../controllers/background-controller";
import { TextController } from "../../controllers/text-controller";
import { TextElement } from "./text-element";
import { FloatingMenuItem } from "../../menu/floating-menu/floating-menu-item";
import { FiltersController } from "../../controllers/filters-controller";
import { useState } from "react";
import { filters } from "@/lib/filters";
import sampleImage from "@/assets/sample-image.png";
import { Background } from "@/components/art-background";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShapeElement } from "./shape-elemen";
import { FilterSelector } from "../../image-selector/filter-selector";
const BackgroundMenu = () => {
  const filter = useCanvasStore((state) => state.canvasFilter);
  const filterIntensities = useCanvasStore((state) => state.canvasFilterIntensities);

  const [activeFilter, setActiveFilter] = useState(filter);
  const imageUrl = useCanvasStore((state) => state.canvasBgColor);

  const handleFilterSelect = (filterId: typeof filters[number]["id"]) => {
    setActiveFilter(filterId);
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      useCanvasStore.setState({ canvasFilter: filter.id });
    }
  };

  const handleIntensityChange = (filterId: typeof filters[number]["id"], value: number) => {
    console.log({ filterId, value });
    useCanvasStore.setState({ canvasFilterIntensities: { ...filterIntensities!, [filterId]: value } });
  };


  return (
    <div className="w-full flex flex-col ">

      <Tabs defaultValue="background" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
          <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
        </TabsList>
        <TabsContent value="background" >
          <BackgroundController />
        </TabsContent>
        <TabsContent value="filters">
          <FilterSelector
            value={activeFilter || "original"}
            onChange={handleFilterSelect}
            intensity={filterIntensities}
            onIntensityChange={handleIntensityChange}
            previewImage={imageUrl?.type === "image" ? imageUrl.value : sampleImage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

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
                borderRadius: element.type === "circle" ? element.config.style.borderRadius : element.config.style.borderRadius
                  ? `${element.config.style.borderRadius}px`
                  : undefined,
                clipPath: element.config.style.clipPath || undefined,
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
  const addElement = useCanvasStore((s) => s.addElement);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const elements = useCanvasStore((s) => s.elements);
  const bgSlected = useCanvasStore((s) => s.bgSlected);

  // Pega os elementos selecionados baseado nos IDs
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));

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
        trigger={<img src={bgColorSvg} className="size-4.5 " />}
        menuContent={<BackgroundMenu />}
        open={bgSlected}
      />
    </div>
  );
};
