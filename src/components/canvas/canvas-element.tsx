import { generateBackgroundCSS } from "@/lib/utils";
import type { CanvasElement } from "@/stores/creative-store";
import { CanvasRenderElement } from "./render-element";

interface CanvasElementProps {
  element: CanvasElement;
  elements: CanvasElement[];
  isSelected: boolean;
  isEditing: boolean;
  isProcessing?: boolean;
  onSelect: (id: number, multiSelect: boolean) => void;
  onEditStart: (id: number) => void;
  onTextChange: (text: string) => void;
  onEditEnd: () => void;
  elementRef: (ref: HTMLDivElement | null) => void;
}

const getClipPathStyle = (type: CanvasElement["type"]) => {
  if (type === "triangle") {
    return "polygon(50% 0%, 0% 100%, 100% 100%)";
  }
  return undefined;
};

export const CanvasElementComponent = ({
  element,
  elements,
  isSelected,
  isEditing,
  isProcessing,
  onSelect,
  onEditStart,
  onTextChange,
  onEditEnd,
  elementRef,
}: CanvasElementProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Click em elemento já selecionado - ativa edição se for texto
    if (element.type === "text" && isSelected) {
      onEditStart(element.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === "text") {
      onEditStart(element.id);
    }
  };

  return (
    <div
      ref={elementRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-element-id={element.id}
      className={`element absolute select-none ${
        element.isGroup
          ? "border-2 border-dashed border-blue-400"
          : element.type === "text"
            ? element.color
            : `${element.color}`
      } ${isEditing ? "cursor-text" : "cursor-move"}`}
      style={{
        width: `${element.w}px`,
        height: `${element.h}px`,
        transform: `translate(${element.x}px, ${element.y}px) rotate(${element.angle}deg)`,
        transformOrigin: "50% 50%",
        borderRadius: element.type === "circle" ? "9999px" : "",
        backgroundSize: "cover",
        backgroundOrigin: "content-box",
        clipPath: getClipPathStyle(element.type),
        background: element.background
          ? generateBackgroundCSS(element.background)
          : undefined,
      }}
    >
      {isProcessing && (
        <div className="shimmer-effect absolute inset-0 z-10 rounded-[inherit]  h-full w-full" />
      )}
      {element.isGroup ? (
        // Render children inside group
        <>
          {element.children?.map((childId) => {
            const child = elements.find((e) => e.id === childId);
            if (!child) return null;
            return (
              <div
                key={child.id}
                className={`absolute shadow ${child.color}`}
                style={{
                  left: `${child.x - element.x}px`,
                  top: `${child.y - element.y}px`,
                  width: `${child.w}px`,
                  height: `${child.h}px`,
                  transform: `rotate(${child.angle}deg)`,
                  transformOrigin: "50% 50%",
                }}
              >
                <CanvasRenderElement element={child} />
              </div>
            );
          })}
        </>
      ) : element.type === "text" ? (
        <CanvasRenderElement
          element={element}
          isEditing={isEditing}
          onTextChange={onTextChange}
          onEditEnd={onEditEnd}
        />
      ) : (
        <CanvasRenderElement
          element={element}
          isResizing={isSelected && false}
        />
      )}
    </div>
  );
};
