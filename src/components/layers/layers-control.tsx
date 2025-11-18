import { useCreativeStore } from "@/stores/creative-store";
import {
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Type,
  Square,
  Circle,
  Triangle,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CanvasElement } from "@/stores/creative-store";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const getElementIcon = (type: CanvasElement["type"]) => {
  switch (type) {
    case "image":
      return ImageIcon;
    case "text":
      return Type;
    case "box":
      return Square;
    case "circle":
      return Circle;
    case "triangle":
      return Triangle;
    case "line":
      return Minus;
    case "svg-clipart":
      return ImageIcon;
    default:
      return Square;
  }
};

const getElementName = (element: CanvasElement) => {
  if (element.type === "text") {
    return element.text?.slice(0, 20) || "Texto";
  }
  if (element.type === "image") {
    return "Imagem";
  }
  if (element.type === "svg-clipart") {
    return "SVG Clipart";
  }
  return element.type?.charAt(0).toUpperCase() + (element.type?.slice(1) || "");
};

interface SortableLayerItemProps {
  element: CanvasElement;
  isSelected: boolean;
  isHidden: boolean;
  onSelect: (id: number, multiSelect: boolean) => void;
  onToggleVisibility: (id: number) => void;
  onDelete: (id: number) => void;
}

function SortableLayerItem({
  element,
  isSelected,
  isHidden,
  onSelect,
  onToggleVisibility,
  onDelete,
}: SortableLayerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getElementIcon(element.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer
        ${
          isSelected
            ? "bg-primary/10 border-primary"
            : "border-border hover:bg-muted"
        }
        ${isHidden ? "opacity-50" : ""}
      `}
      onClick={(e) => onSelect(element.id, e.shiftKey)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Ícone do tipo */}
      <div className="shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Nome */}
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{getElementName(element)}</p>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1">
        {/* Toggle visibilidade */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(element.id);
          }}
        >
          {isHidden ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
        </Button>

        {/* Deletar */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function LayersControl() {
  const elements = useCreativeStore((state) => state.canvasElements);
  const selectedIds = useCreativeStore((state) => state.selectedCanvasIds);
  const setSelectedIds = useCreativeStore(
    (state) => state.setSelectedCanvasIds,
  );
  const setCanvasElements = useCreativeStore(
    (state) => state.setCanvasElements,
  );
  const deleteSelected = useCreativeStore((state) => state.deleteSelected);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Elementos em ordem reversa para exibição (último criado no topo)
  const sortedElements = [...elements].reverse();

  const handleSelect = (id: number, multiSelect: boolean) => {
    if (multiSelect) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      setSelectedIds([id]);
    }
  };

  const handleToggleVisibility = (id: number) => {
    setCanvasElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, opacity: el.opacity === 0 ? 1 : 0 } : el,
      ),
    );
  };

  const handleDelete = (id: number) => {
    setSelectedIds([id]);
    setTimeout(() => {
      deleteSelected();
    }, 0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedElements.findIndex((el) => el.id === active.id);
    const newIndex = sortedElements.findIndex((el) => el.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Reordenar no array de exibição
    const reordered = arrayMove(sortedElements, oldIndex, newIndex);

    // Reverter de volta para a ordem original (último = maior índice)
    const reorderedOriginal = [...reordered].reverse();

    setCanvasElements(reorderedOriginal);
  };

  return (
    <div className="pt-4 space-y-1 max-h-[500px] overflow-y-auto">
      {sortedElements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nenhuma camada ainda
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedElements.map((el) => el.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedElements.map((element) => {
                const isSelected = selectedIds.includes(element.id);
                const isHidden = element.opacity === 0;

                return (
                  <SortableLayerItem
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    isHidden={isHidden}
                    onSelect={handleSelect}
                    onToggleVisibility={handleToggleVisibility}
                    onDelete={handleDelete}
                  />
                );
              })}
            </SortableContext>
          </DndContext>

          {/* Info */}
          <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <p>
              💡 Dica: Arraste para reordenar • Shift + Clique para selecionar
              múltiplas
            </p>
          </div>
        </>
      )}
    </div>
  );
}
