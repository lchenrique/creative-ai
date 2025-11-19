import React, { useCallback, useRef, type RefObject } from "react";
import { useElementSize } from "@reactuses/core";
import { useKeycon } from "react-keycon";
import { useCanvasStore, type ElementsProps } from "@/stores/canva-store";

export interface TextElementProps {
  el: ElementsProps;
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
  const updateElement = useCanvasStore((state) => state.updateElementConfig);
  const textElementRef = useRef<HTMLDivElement>(null);
  const [width, height] = useElementSize(textElementRef, { box: "border-box" });
  const initialHeightRef = useRef<number>(0);
  const initialFontSizeRef = useRef<number>(0);
  const prevShiftRef = useRef(isShift);

  // Get styles from config
  const style = el.config.style;
  const currentFontSizeRef = useRef<number>(style.fontSize || height);

  const textShadow = style.textShadow;
  const textStroke = style.WebkitTextStroke;

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

    updateElement?.(el.id, { style: { fontSize: finalFontSize } });
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
    fontSize = style.fontSize || height;
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
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        // Enter sem Shift: previne
        e.preventDefault();
      } else {
        // Shift+Enter: permite quebra de linha
        // Deixa o comportamento padrão acontecer
      }
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
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle || "normal",
            color: style.color === "transparent" ? "#000" : style.color,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            textAlign: style.textAlign || "left",
            letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
            lineHeight: style.lineHeight || 1.2,
            fontSize: `${fontSize}px`,
            WebkitTextStroke: textStroke,
            textShadow: textShadow,
            width: "100%",
            height: "100%",
            backgroundColor: "blue",
            clipPath: "path('M76.86 202.05L76.86 202.05Q57.03 202.05 40.97 193.41Q24.90 184.77 15.53 168.12Q6.15 151.46 6.15 127.34L6.15 127.34Q6.15 103.03 15.53 86.33Q24.90 69.63 40.97 61.04Q57.03 52.44 76.86 52.44L76.86 52.44Q96.68 52.44 112.70 61.04Q128.71 69.63 138.13 86.33Q147.56 103.03 147.56 127.34L147.56 127.34Q147.56 151.56 138.13 168.21Q128.71 184.86 112.70 193.46Q96.68 202.05 76.86 202.05ZM76.86 167.48L76.86 167.48Q86.72 167.48 93.36 162.84Q100 158.20 103.42 149.22Q106.84 140.23 106.84 127.34L106.84 127.34Q106.84 114.36 103.42 105.32Q100 96.29 93.36 91.65Q86.72 87.01 76.86 87.01L76.86 87.01Q67.19 87.01 60.50 91.65Q53.81 96.29 50.34 105.32Q46.88 114.36 46.88 127.34L46.88 127.34Q46.88 140.23 50.34 149.22Q53.81 158.20 60.50 162.84Q67.19 167.48 76.86 167.48ZM163.38 54.49L202.64 54.49L202.64 200L163.38 200L163.38 54.49ZM252.54 201.76L252.54 201.76Q242.09 201.76 234.08 198.34Q226.07 194.92 221.58 187.94Q217.09 180.96 217.09 170.31L217.09 170.31Q217.09 161.33 220.12 155.08Q223.14 148.83 228.61 144.82Q234.08 140.82 241.36 138.67Q248.63 136.52 257.03 135.94L257.03 135.94Q266.21 135.25 271.73 134.28Q277.25 133.30 279.74 131.40Q282.23 129.49 282.23 126.46L282.23 126.46L282.23 126.07Q282.23 123.34 280.71 121.48Q279.20 119.63 276.51 118.60Q273.83 117.58 270.02 117.58L270.02 117.58Q266.31 117.58 263.33 118.65Q260.35 119.73 258.45 121.88Q256.54 124.02 255.96 127.25L255.96 127.25L220.51 124.51Q221.88 114.75 227.88 107.08Q233.89 99.41 244.63 95.02Q255.37 90.63 270.80 90.63L270.80 90.63Q282.52 90.63 291.89 93.26Q301.27 95.90 307.81 100.73Q314.36 105.57 317.82 112.11Q321.29 118.65 321.29 126.46L321.29 126.46L321.29 200L284.28 200L284.28 184.77L283.59 184.77Q280.27 190.92 275.68 194.63Q271.09 198.34 265.33 200.05Q259.57 201.76 252.54 201.76ZM265.23 177.05L265.23 177.05Q269.63 177.05 273.58 175.24Q277.54 173.44 280.08 170.07Q282.62 166.70 282.62 161.82L282.62 161.82L282.62 153.03Q281.05 153.52 279.35 154.10Q277.64 154.69 275.63 155.18Q273.63 155.66 271.53 156.05Q269.43 156.45 266.99 156.84L266.99 156.84Q262.50 157.52 259.62 159.08Q256.74 160.64 255.32 162.89Q253.91 165.14 253.91 167.97L253.91 167.97Q253.91 170.90 255.37 172.95Q256.84 175 259.38 176.03Q261.91 177.05 265.23 177.05Z')",
          }}
        // dangerouslySetInnerHTML={{ __html: style.text || "Texto" }}
        />
      ) : (
        <div
          ref={(node) => {
            if (node && editableRef) {
              (
                editableRef as React.MutableRefObject<HTMLDivElement | null>
              ).current = node;
              // Só define o conteúdo inicial se estiver vazio
              if (node.innerHTML === "") {
                node.innerHTML = style.text || "";
              }
              // Auto-focus when entering edit mode
              requestAnimationFrame(() => {
                node.focus();
                // Move cursor to end
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(node);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
              });
            }
          }}
          contentEditable
          suppressContentEditableWarning
          onBlur={() => {
            handleBlur();
          }}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            // Atualiza conforme o usuário digita, mas não força re-render
            const html = e.currentTarget.innerHTML;
            onTextChange?.(html);
          }}
          data-placeholder={
            !style.text || style.text.trim() === "" ? "Digite seu texto..." : ""
          }
          className={!style.text || style.text.trim() === "" ? "empty-text" : ""}
          style={{
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle || "normal",
            color: style.color === "transparent" ? "#000" : style.color,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            outline: "none",
            minHeight: "1em",
            textAlign: style.textAlign || "left",
            letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
            lineHeight: style.lineHeight || 1.2,
            fontSize: `${fontSize}px`,
            WebkitTextStroke: textStroke,
            textShadow: textShadow,
          }}
        />
      )}
    </div>
  );
};
