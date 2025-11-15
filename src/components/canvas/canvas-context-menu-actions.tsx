import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Copy,
  Trash2,
  Send,
  BringToFront,
  Group,
  Ungroup,
  Move3d,
  Maximize2,
  Scissors,
  FileImage,
  Eraser,
  Image as ImageIcon,
} from "lucide-react";
import type { CanvasElement } from "@/stores/creative-store";

interface CanvasContextMenuActionsProps {
  selectedIds: number[];
  elements: CanvasElement[];
  useWarpable: boolean;
  useClippable: boolean;
  isConverting: boolean;
  isConvertingWebP: boolean;
  isRemovingBackground: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onConvertToSVG: () => void;
  onConvertToWebP: () => void;
  onRemoveBackground: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onToggleWarpable: (value: boolean) => void;
  onToggleClippable: () => void;
}

export const CanvasContextMenuActions = ({
  selectedIds,
  elements,
  useWarpable,
  useClippable,
  isConverting,
  isConvertingWebP,
  isRemovingBackground,
  onDuplicate,
  onDelete,
  onConvertToSVG,
  onConvertToWebP,
  onRemoveBackground,
  onGroup,
  onUngroup,
  onBringToFront,
  onSendToBack,
  onToggleWarpable,
  onToggleClippable,
}: CanvasContextMenuActionsProps) => {
  const hasSelection = selectedIds.length > 0;
  const singleSelection = selectedIds.length === 1;
  const multiSelection = selectedIds.length >= 2;

  const selectedElement = singleSelection
    ? elements.find((e) => e.id === selectedIds[0])
    : null;

  const canConvertToSVG =
    singleSelection && selectedElement?.type === "image" && !isConverting;

  const canConvertToWebP =
    singleSelection &&
    (selectedElement?.type === "image" ||
      selectedElement?.type === "svg-clipart") &&
    !isConvertingWebP;

  const canRemoveBackground =
    singleSelection &&
    selectedElement?.type === "image" &&
    !isRemovingBackground;

  const canGroup =
    multiSelection &&
    !selectedIds.some((id) => elements.find((e) => e.id === id)?.isGroup);

  const canUngroup = selectedIds.some(
    (id) => elements.find((e) => e.id === id)?.isGroup,
  );

  return (
    <>
      <ContextMenuItem onClick={onDuplicate} disabled={!hasSelection}>
        <Copy className="mr-2 h-4 w-4" />
        <span>Duplicar</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={onDelete} disabled={!hasSelection}>
        <Trash2 className="mr-2 h-4 w-4" />
        <span>Deletar</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onClick={onConvertToSVG} disabled={!canConvertToSVG}>
        <FileImage className="mr-2 h-4 w-4" />
        <span>{isConverting ? "Convertendo..." : "Converter para SVG"}</span>
      </ContextMenuItem>

      <ContextMenuItem onClick={onConvertToWebP} disabled={!canConvertToWebP}>
        <ImageIcon className="mr-2 h-4 w-4" />
        <span>
          {isConvertingWebP ? "Convertendo..." : "Converter para WebP"}
        </span>
      </ContextMenuItem>

      <ContextMenuItem
        onClick={onRemoveBackground}
        disabled={!canRemoveBackground}
      >
        <Eraser className="mr-2 h-4 w-4" />
        <span>
          {isRemovingBackground ? "Removendo..." : "Remover fundo"}
        </span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onClick={onGroup} disabled={!canGroup}>
        <Group className="mr-2 h-4 w-4" />
        <span>Agrupar</span>
      </ContextMenuItem>

      <ContextMenuItem onClick={onUngroup} disabled={!canUngroup}>
        <Ungroup className="mr-2 h-4 w-4" />
        <span>Desagrupar</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onClick={onBringToFront} disabled={!hasSelection}>
        <BringToFront className="mr-2 h-4 w-4" />
        <span>Trazer para frente</span>
      </ContextMenuItem>

      <ContextMenuItem onClick={onSendToBack} disabled={!hasSelection}>
        <Send className="mr-2 h-4 w-4" />
        <span>Enviar para trás</span>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem
        onClick={() => onToggleWarpable(false)}
        disabled={!hasSelection || !useWarpable}
      >
        <Maximize2 className="mr-2 h-4 w-4" />
        <span>{useWarpable ? "✓ " : ""}Modo Redimensionar</span>
      </ContextMenuItem>

      <ContextMenuItem
        onClick={() => onToggleWarpable(true)}
        disabled={!hasSelection || useWarpable}
      >
        <Move3d className="mr-2 h-4 w-4" />
        <span>{!useWarpable ? "✓ " : ""}Modo Distorcer</span>
      </ContextMenuItem>

      <ContextMenuItem onClick={onToggleClippable} disabled={!hasSelection}>
        <Scissors className="mr-2 h-4 w-4" />
        <span>{useClippable ? "✓ " : ""}Modo Recorte</span>
      </ContextMenuItem>
    </>
  );
};
