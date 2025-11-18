import { generateBackgroundCSS, polygonToPoints } from "@/lib/utils";
import { type CanvasElement, type BlendMode, useCreativeStore } from "@/stores/creative-store";
import { CanvasRenderElement } from "./render-element";
import { useRef, useState } from "react";

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
  onDoubleClick?: (id: number) => void;
  elementRef?: (ref: HTMLDivElement | null) => void;
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
  onDoubleClick,
  elementRef,
}: CanvasElementProps) => {


  const points = useCreativeStore((state) => {
    return state.getSelectedElements().find(el => el.id === element.id)?.points
  })
  const cp = points || [];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Apenas seleciona, não inicia edição
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Double click ativa edição para elementos de texto
    if (element.type === "text") {
      onEditStart(element.id);
    } else {
      // Para elementos não-texto, chama o callback se fornecido
      onDoubleClick?.(element.id);
    }
  };
  const clipPath = cp.length > 0 && cp ? polygonToPoints(element.clipPath || "").concat(cp) : undefined;
  return (
    <div
      ref={elementRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-element-id={element.id}
      className={`element absolute select-none ${element.isGroup
        ? "border-2 border-dashed border-blue-400"
        : element.type === "text"
          ? element.color
          : `${element.color}`
        } ${isEditing ? "cursor-text" : "cursor-move"}`}
      style={{
        width: `${element.w}px`,
        height: `${element.h}px`,
        transform: element.warpMatrix
          ? `translate(${element.x}px, ${element.y}px) matrix3d(${element.warpMatrix.join(",")})`
          : `translate(${element.x}px, ${element.y}px) rotate(${element.angle}deg)`,
        transformOrigin: "50% 50%",
        borderRadius:
          element.type === "circle"
            ? "9999px"
            : element.borderRadius
              ? `${element.borderRadius}px`
              : "",
        backgroundSize: "cover",
        backgroundOrigin: "content-box",

        background: element.background
          ? generateBackgroundCSS(element.background)
          : undefined,
        opacity: element.opacity ?? 1,
        mixBlendMode: (element.blendMode || "normal") as BlendMode,
        clipPath: element.points ? `polygon(${element.points.map(p => `${p.x}px ${p.y}px`).join(', ')})` : element.clipPath,
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
