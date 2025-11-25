import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuTrigger,
  ContextMenuLabel,
} from "@/components/ui/context-menu"
import type { ElementsProps } from "@/stores/canva-store";


interface ElementActionsProps {
  children: React.ReactNode;
  element: ElementsProps;

  // Generic actions
  onDuplicate?: (el: ElementsProps) => void;
  onDelete?: (el: ElementsProps) => void;
  onBringToFront?: (el: ElementsProps) => void;
  onSendToBack?: (el: ElementsProps) => void;
  onBringForward?: (el: ElementsProps) => void;
  onSendBackward?: (el: ElementsProps) => void;
  onLock?: (el: ElementsProps) => void;
  onUnlock?: (el: ElementsProps) => void;
  onGroup?: (el: ElementsProps) => void;
  onUngroup?: (el: ElementsProps) => void;

  // Image actions
  onConvertToSVG?: (el: ElementsProps) => void;
  onConvertToWebP?: (el: ElementsProps) => void;
  onConvertFromSVG?: (el: ElementsProps) => void; // SVG → PNG/JPG
  onRemoveBackground?: (el: ElementsProps) => void;
}

export function ElementActions({
  children,
  element,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onLock,
  onUnlock,
  onGroup,
  onUngroup,
  onConvertToSVG,
  onConvertFromSVG,
  onConvertToWebP,
  onRemoveBackground,
}: ElementActionsProps) {

  const isImage = element.type === "image";
  const isSVG = isImage && element.content?.toLowerCase().endsWith(".svg");

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56">

        {/* --- AÇÕES COMUNS A TODOS OS ELEMENTOS --- */}
        <ContextMenuItem onClick={() => onDuplicate?.(element)}>
          Duplicar
          <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onDelete?.(element)} variant="destructive">
          Deletar
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Z-INDEX / ORGANIZAÇÃO */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>Organizar</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem onClick={() => onBringToFront?.(element)}>
              Trazer para frente
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onBringForward?.(element)}>
              Trazer 1 nível
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onSendBackward?.(element)}>
              Enviar 1 nível
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onSendToBack?.(element)}>
              Enviar para trás
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* AGRUPAMENTO */}
        <ContextMenuItem onClick={() => onGroup?.(element)}>Agrupar</ContextMenuItem>
        <ContextMenuItem onClick={() => onUngroup?.(element)}>Desagrupar</ContextMenuItem>

        <ContextMenuSeparator />

        {/* BLOQUEIO */}
        <ContextMenuItem onClick={() => onLock?.(element)}>
          Bloquear
          <ContextMenuShortcut>Ctrl+L</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onUnlock?.(element)}>
          Desbloquear
        </ContextMenuItem>

        {/* --- MENU ESPECIAL PARA IMAGENS --- */}
        {isImage && (
          <>
            <ContextMenuSeparator />

            <ContextMenuLabel>Imagem</ContextMenuLabel>

            {/* Remover fundo */}
            <ContextMenuItem onClick={() => onRemoveBackground?.(element)}>
              Remover fundo
            </ContextMenuItem>

            {/* Conversões */}
            <ContextMenuSub>
              <ContextMenuSubTrigger>Converter</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">

                {/* Se for SVG → PNG/JPG */}
                {isSVG && (
                  <ContextMenuItem onClick={() => onConvertFromSVG?.(element)}>
                    SVG → PNG/JPG
                  </ContextMenuItem>
                )}

                {/* Se NÃO for SVG → converter PNG/JPG → SVG */}
                {!isSVG && (
                  <ContextMenuItem onClick={() => onConvertToSVG?.(element)}>
                    PNG/JPG → SVG
                  </ContextMenuItem>
                )}

                {/* Sempre pode converter para WebP */}
                <ContextMenuItem onClick={() => onConvertToWebP?.(element)}>
                  Converter para WebP
                </ContextMenuItem>

              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}

      </ContextMenuContent>
    </ContextMenu>
  );
}
