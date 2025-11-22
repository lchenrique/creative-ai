import React, { useCallback, useRef, type RefObject } from "react";
import { type ElementsProps } from "@/stores/canva-store";

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
  const textElementRef = useRef<HTMLDivElement>(null);

  // Get styles from config
  const style = el.config.style;

  const textShadow = style.textShadow;
  const textStroke = style.WebkitTextStroke;

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
          data-element-type="text"
          style={{
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle || "normal",
            color: style.color === "transparent" ? "#000" : style.color,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            textAlign: style.textAlign || "left",
            letterSpacing: style.letterSpacing
              ? `${style.letterSpacing}px`
              : undefined,
            lineHeight: style.lineHeight || 1.2,
            fontSize: `${style.fontSize}px`,
            WebkitTextStroke: textStroke,
            textShadow: textShadow,
            width: "100%",
            height: "auto",
            backgroundColor: "red",
          }}
          dangerouslySetInnerHTML={{ __html: style.text || "Texto" }}
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
          className={
            !style.text || style.text.trim() === "" ? "empty-text" : ""
          }
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
            letterSpacing: style.letterSpacing
              ? `${style.letterSpacing}px`
              : undefined,
            lineHeight: style.lineHeight || 1.2,
            WebkitTextStroke: textStroke,
            textShadow: textShadow,
          }}
        />
      )}
    </div>
  );
};
