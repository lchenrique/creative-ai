import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Square,
  Circle,
  Triangle,
  Type,
  Minus,
  Star,
  Heart,
  Image,
  GripVertical
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';

const getLayerIcon = (type: string) => {
  switch (type) {
    case 'rect':
      return <Square className="w-4 h-4" />;
    case 'circle':
      return <Circle className="w-4 h-4" />;
    case 'triangle':
      return <Triangle className="w-4 h-4" />;
    case 'textbox':
    case 'text':
      return <Type className="w-4 h-4" />;
    case 'line':
      return <Minus className="w-4 h-4" />;
    case 'polygon':
      return <Star className="w-4 h-4" />;
    case 'image':
    case 'fabricimage':
      return <Image className="w-4 h-4" />;
    default:
      return <Square className="w-4 h-4" />;
  }
};

interface LayerObject {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  locked: boolean;
  index: number;
}

interface LayerControlsProps {
  canvas: any; // Fabric Canvas instance
}

interface SortableLayerItemProps {
  layer: LayerObject;
  isActive: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

function SortableLayerItem({
  layer,
  isActive,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
}: SortableLayerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded border transition-colors ${
        isActive
          ? 'bg-primary/10 border-primary'
          : 'bg-card hover:bg-accent/50 border-border'
      } cursor-pointer`}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getLayerIcon(layer.type)}
        <span className="text-sm truncate">{layer.name}</span>
      </div>

      <div className="flex items-center gap-0.5">
        {/* Z-Index controls */}
        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            title="Trazer para frente"
            onClick={(e) => {
              e.stopPropagation();
              onBringToFront();
            }}
          >
            <ChevronsUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            title="Avançar uma camada"
            onClick={(e) => {
              e.stopPropagation();
              onBringForward();
            }}
          >
            <ArrowUp className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            title="Recuar uma camada"
            onClick={(e) => {
              e.stopPropagation();
              onSendBackward();
            }}
          >
            <ArrowDown className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            title="Enviar para trás"
            onClick={(e) => {
              e.stopPropagation();
              onSendToBack();
            }}
          >
            <ChevronsDown className="w-3 h-3" />
          </Button>
        </div>

        {/* Visibility toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          title={layer.visible ? "Ocultar" : "Mostrar"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
        >
          {layer.visible ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
        </Button>

        {/* Lock toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          title={layer.locked ? "Desbloquear" : "Bloquear"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
        >
          {layer.locked ? (
            <Lock className="w-3 h-3" />
          ) : (
            <Unlock className="w-3 h-3" />
          )}
        </Button>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          title="Deletar"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function LayerControls({ canvas }: LayerControlsProps) {
  const [localLayers, setLocalLayers] = useState<LayerObject[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      const objects = canvas.getObjects();
      const layers: LayerObject[] = objects.map((obj: any, index: number) => ({
        id: obj.id || `layer-${index}`,
        type: obj.type || 'unknown',
        name: obj.name || `${obj.type || 'objeto'} ${index + 1}`,
        visible: obj.visible !== false,
        locked: obj.selectable === false,
        index,
      })).reverse(); // Reverse para mostrar objetos do topo primeiro

      setLocalLayers(layers);
    };

    updateLayers();

    // Listen to canvas events
    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);
    canvas.on('selection:created', () => setForceUpdate(prev => prev + 1));
    canvas.on('selection:updated', () => setForceUpdate(prev => prev + 1));
    canvas.on('selection:cleared', () => setForceUpdate(prev => prev + 1));

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
    };
  }, [canvas]);

  if (!canvas) {
    return (
      <div className="p-4 w-[280px]">
        <p className="text-sm text-muted-foreground text-center">
          Canvas não disponível
        </p>
      </div>
    );
  }

  const objects = canvas.getObjects();
  const layers = localLayers;

  const handleToggleVisibility = (index: number) => {
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];
    obj.visible = !obj.visible;
    canvas.renderAll();
  };

  const handleToggleLock = (index: number) => {
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];
    obj.selectable = !obj.selectable;
    obj.evented = !obj.evented;
    if (!obj.selectable) {
      canvas.discardActiveObject();
    }
    canvas.renderAll();
  };

  const handleDelete = (index: number) => {
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];
    canvas.remove(obj);
    canvas.renderAll();
  };

  const handleSelect = (index: number) => {
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];
    if (obj.selectable !== false) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  };

  const handleBringForward = (index: number) => {
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];
    obj.bringForward();
    canvas.renderAll();
  };

  const handleSendBackward = (index: number) => {
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];
    obj.sendBackwards();
    canvas.renderAll();
  };

  const handleBringToFront = (index: number) => {
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];
    obj.bringToFront();
    canvas.renderAll();
  };

  const handleSendToBack = (index: number) => {
    const actualIndex = objects.length - 1 - index;
    const obj = objects[actualIndex];
    obj.sendToBack();
    canvas.renderAll();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = layers.findIndex((layer) => layer.id === active.id);
    const newIndex = layers.findIndex((layer) => layer.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Reordenar no array local
    const newLayers = arrayMove(layers, oldIndex, newIndex);
    setLocalLayers(newLayers);

    // Reordenar no canvas (lembrar que layers está invertido)
    const actualOldIndex = objects.length - 1 - oldIndex;
    const actualNewIndex = objects.length - 1 - newIndex;

    const obj = objects[actualOldIndex];

    // Move o objeto para a nova posição no canvas
    // Remove from current position
    canvas.remove(obj);
    // Insert at new position
    canvas.insertAt(actualNewIndex, obj);
    canvas.renderAll();
  };

  return (
    <div className="w-[320px]">
      <div className="p-3 border-b">
        <h3 className="text-sm font-medium">Camadas</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {layers.length} {layers.length === 1 ? 'objeto' : 'objetos'}
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={layers.map(layer => layer.id)}
          strategy={verticalListSortingStrategy}
        >
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-1">
              {layers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma camada encontrada
                </p>
              ) : (
                layers.map((layer, index) => {
                  const activeObject = canvas.getActiveObject();
                  const isActive = activeObject && (activeObject.id === layer.id || objects[objects.length - 1 - index] === activeObject);

                  return (
                    <SortableLayerItem
                      key={layer.id}
                      layer={layer}
                      isActive={isActive}
                      onSelect={() => handleSelect(index)}
                      onToggleVisibility={() => handleToggleVisibility(index)}
                      onToggleLock={() => handleToggleLock(index)}
                      onDelete={() => handleDelete(index)}
                      onBringForward={() => handleBringForward(index)}
                      onSendBackward={() => handleSendBackward(index)}
                      onBringToFront={() => handleBringToFront(index)}
                      onSendToBack={() => handleSendToBack(index)}
                    />
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SortableContext>
      </DndContext>
    </div>
  );
}
