import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Unlock, Trash2, Square, Circle, Triangle, Type, Minus, Star, Heart, Image } from "lucide-react";
import { useCreativeStore } from "@/stores/creative-store";

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
      if (type.includes('star')) return <Star className="w-4 h-4" />;
      if (type.includes('heart')) return <Heart className="w-4 h-4" />;
      return <Star className="w-4 h-4" />;
    case 'image':
    case 'fabricimage':
      return <Image className="w-4 h-4" />;
    default:
      return <Square className="w-4 h-4" />;
  }
};

export function LayerPanel() {
  const layers = useCreativeStore((state) => state.layers);
  const toggleLayerVisibility = useCreativeStore((state) => state.toggleLayerVisibility);
  const toggleLayerLock = useCreativeStore((state) => state.toggleLayerLock);
  const deleteLayer = useCreativeStore((state) => state.deleteLayer);
  const selectLayer = useCreativeStore((state) => state.selectLayer);

  // Sync layers with canvas objects
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const canvasLayers = objects.map((obj, index) => ({
      id: (obj as any).id || `layer-${index}`,
      type: obj.type || 'unknown',
      visible: obj.visible !== false,
      locked: obj.locked || false,
      name: (obj as any).name || `${obj.type} ${index + 1}`,
    }));

    // Only update if layers have changed
    const layersChanged = canvasLayers.length !== layers.length ||
      canvasLayers.some((layer, index) => {
        const existing = layers[index];
        return !existing ||
          existing.id !== layer.id ||
          existing.visible !== layer.visible ||
          existing.locked !== layer.locked;
      });

    if (layersChanged) {
      useCreativeStore.getState().setLayers(canvasLayers);
    }
  }, [layers.length]);

  const handleToggleVisibility = (id: string) => {
    toggleLayerVisibility(id);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const objIndex = objects.findIndex((obj) => (obj as any).id === id);
    if (objIndex !== -1) {
      const obj = objects[objIndex];
      obj.visible = !obj.visible;
      canvas.renderAll();
    }
  };

  const handleToggleLock = (id: string) => {
    toggleLayerLock(id);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const objIndex = objects.findIndex((obj) => (obj as any).id === id);
    if (objIndex !== -1) {
      const obj = objects[objIndex];
      obj.locked = !obj.locked;
      obj.selectable = !obj.locked;
      canvas.renderAll();
    }
  };

  const handleDeleteLayer = (id: string) => {
    deleteLayer(id);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const objIndex = objects.findIndex((obj) => (obj as any).id === id);
    if (objIndex !== -1) {
      canvas.remove(objects[objIndex]);
      canvas.renderAll();
    }
  };

  const handleSelectLayer = (id: string) => {
    selectLayer(id);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const objIndex = objects.findIndex((obj) => (obj as any).id === id);
    if (objIndex !== -1) {
      canvas.setActiveObject(objects[objIndex]);
      canvas.renderAll();
    }
  };

  return (
    <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
      <h3 className="text-sm font-medium mb-3">Camadas</h3>
      {layers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma camada encontrada
        </p>
      ) : (
        layers.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center gap-2 p-2 rounded border bg-card hover:bg-accent/50 cursor-pointer"
            onClick={() => handleSelectLayer(layer.id)}
          >
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {getLayerIcon(layer.type)}
              <span className="text-sm truncate">{layer.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(layer.id);
                }}
              >
                {layer.visible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLock(layer.id);
                }}
              >
                {layer.locked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Unlock className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLayer(layer.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
