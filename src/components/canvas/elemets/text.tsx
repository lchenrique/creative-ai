import type { CanvasElement } from "@/stores/creative-store";
import React, { useCallback, useRef, type RefObject } from "react";
import { useElementSize } from "@reactuses/core";
import { useKeycon } from "react-keycon";
import { useCreativeStore } from "@/stores/creative-store";

export interface TextElementProps {
  el: CanvasElement;
  editing: boolean;
  editableRef: RefObject<HTMLDivElement | null>;
  onEditEnd?: () => void;
  onTextChange?: (text: string) => void;
}

export const TextElement = ({
  el,
  editing,
  editableRef,
  onEditEnd,
  onTextChange,
}: TextElementProps) => {
  const { isKeydown: isShift } = useKeycon({ keys: "shift" });
  const updateElement = useCreativeStore((state) => state.updateElement);
  const textElementRef = useRef<HTMLDivElement>(null);
  const [width, height] = useElementSize(textElementRef, { box: "border-box" });
  const initialHeightRef = useRef<number>(0);
  const initialFontSizeRef = useRef<number>(0);
  const prevShiftRef = useRef(isShift);
  const currentFontSizeRef = useRef<number>(el.fontSize || height);

  const textShadow = el.shadowEnabled
    ? `${el.shadowX || 0}px ${el.shadowY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || "rgba(0,0,0,0.5)"}`
    : undefined;

  // Quando Shift é pressionado, salva altura e fontSize inicial
  if (isShift && !prevShiftRef.current) {
    // Shift acabou de ser pressionado
    initialHeightRef.current = height;
    initialFontSizeRef.current = currentFontSizeRef.current;
  }

  // Quando Shift é solto durante o resize, atualiza o fontSize no store
  if (!isShift && prevShiftRef.current && initialHeightRef.current > 0) {
    const scale = height / initialHeightRef.current;
    const finalFontSize = initialFontSizeRef.current * scale;

    updateElement(el.id, { fontSize: finalFontSize });
    currentFontSizeRef.current = finalFontSize;
    initialHeightRef.current = 0; // Reset
  }

  prevShiftRef.current = isShift;

  let fontSize: number;
  if (isShift && initialHeightRef.current > 0) {
    const scale = height / initialHeightRef.current;
    fontSize = initialFontSizeRef.current * scale;
    currentFontSizeRef.current = fontSize;
  } else {
    fontSize = el.fontSize || height;
    currentFontSizeRef.current = fontSize;
  }

  React.useEffect(() => {
    if (textElementRef.current) {
      const parentElement = textElementRef.current.parentElement;
      if (parentElement) {
        parentElement.setAttribute(
          "data-calculated-fontsize",
          String(fontSize),
        );
      }
    }
  }, [fontSize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onEditEnd?.();
    }
  };

  const handleBlur = useCallback(() => {
    const html = editableRef.current?.innerHTML ?? "";
    onTextChange?.(html);
    onEditEnd?.();
  }, [onTextChange, onEditEnd, editableRef]);

  console.log({
    width,
    height,
  });

  return (
    <div
      ref={textElementRef}
      className="absolute inset-0"
      style={{
        overflow: "visible",
      }}
    >
      {!editing ? (
        <div
          style={{
            fontFamily: el.fontFamily,
            fontWeight: el.fontWeight,
            fontStyle: el.fontStyle || "normal",
            color: el.color === "transparent" ? "#000" : el.color,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            textAlign: el.textAlign || "left",
            letterSpacing: `${el.letterSpacing || 0}px`,
            lineHeight: `${fontSize}px`,
            textShadow,
            fontSize: `${fontSize}px`,
          }}
        >
          {el.text}
        </div>
      ) : (
        <div
          ref={editableRef}
          autoFocus
          contentEditable
          suppressContentEditableWarning
          onBlur={() => {
            handleBlur();
          }}
          onKeyDown={handleKeyDown}
          style={{
            fontFamily: el.fontFamily,
            fontWeight: el.fontWeight,
            fontStyle: el.fontStyle || "normal",
            color: el.color === "transparent" ? "#000" : el.color,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            outline: "none",
            minHeight: "1em",
            textAlign: el.textAlign || "left",
            letterSpacing: `${el.letterSpacing || 0}px`,
            lineHeight: el.lineHeight || 1.2,
            textShadow,
          }}
          dangerouslySetInnerHTML={{ __html: el.text || "" }}
        />
      )}
    </div>
  );
};
