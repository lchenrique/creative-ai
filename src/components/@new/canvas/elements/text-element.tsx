import React, { useCallback, useMemo, useRef, type RefObject } from "react";
import { type ElementsProps } from "@/stores/canva-store";
import { colorConfigToCss } from "@/lib/gradient-utils";

export interface TextElementProps {
  el: ElementsProps;
  editing: boolean;
  editableRef: RefObject<HTMLDivElement | null>;
  onEditEnd?: (newHeight?: number) => void;
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
    if (e.key === "Escape") {
      e.preventDefault();
      onEditEnd?.();
    }
    // Enter normal: permite quebra de linha (comportamento padrão)
    // Não precisa fazer nada, o contentEditable já quebra linha com Enter
  };

  const handleBlur = useCallback(() => {
    const html = editableRef.current?.innerHTML ?? "";
    const newHeight = editableRef.current?.offsetHeight;
    onTextChange?.(html);
    onEditEnd?.(newHeight);
  }, [onTextChange, onEditEnd, editableRef]);

  // Gerar CSS de background (suporta gradiente)
  const backgroundCss = useMemo(() => {
    const bgConfig = style.backgroundColor;
    if (!bgConfig) return "transparent";

    // Se for string simples (cor sólida), retorna direto
    if (typeof bgConfig === "string") return bgConfig;

    // Se for objeto ColorConfig, usa a função colorConfigToCss
    return colorConfigToCss(
      bgConfig,
      el.config.size.width,
      el.config.size.height,
    );
  }, [style.backgroundColor, el.config.size.width, el.config.size.height]);

  const componentStyle = {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle || "normal",
    color: style.color === "transparent" ? "#000" : style.color,
    background: backgroundCss,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    textAlign: style.textAlign || "left",
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
    lineHeight: style.lineHeight || 1.2,
    fontSize: `${style.fontSize}px`,
    WebkitTextStroke: textStroke,
    textShadow: textShadow,
    width: "100%",
    height: "auto",
  };

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
          style={componentStyle}
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
            // Atualiza conforme o usuário digita
            const html = e.currentTarget.innerHTML;
            onTextChange?.(html);
          }}
          data-placeholder={
            !style.text || style.text.trim() === "" ? "Digite seu texto..." : ""
          }
          className={
            !style.text || style.text.trim() === "" ? "empty-text" : ""
          }
          style={componentStyle}
        />
      )}
    </div>
  );
};
