import { useState } from "react";

const MODES = {
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  INSET: "inset",
  POLYGON: "polygon",
} as const;

type Mode = (typeof MODES)[keyof typeof MODES];

interface Point {
  x: number;
  y: number;
}

const PRESETS: Record<Mode, Point[]> = {
  circle: [
    { x: 150, y: 150 }, // center
    { x: 250, y: 150 }, // radius
  ],
  ellipse: [
    { x: 150, y: 150 }, // center
    { x: 250, y: 150 }, // x radius
    { x: 150, y: 50 }, // y radius
  ],
  inset: [
    { x: 150, y: 30 }, // top
    { x: 270, y: 150 }, // right
    { x: 150, y: 270 }, // bottom
    { x: 30, y: 150 }, // left
  ],
  polygon: [
    { x: 150, y: 20 },
    { x: 280, y: 100 },
    { x: 230, y: 280 },
    { x: 70, y: 280 },
    { x: 20, y: 100 },
  ],
};

const getClipPath = (nodes: Point[], size: number, mode: Mode): string => {
  if (!nodes.length) return "";

  const getRatio = (d: number) => Math.floor((d / size) * 100);
  let path = "";

  switch (mode) {
    case MODES.POLYGON:
      path = nodes
        .map((n) => `${getRatio(n.x)}% ${getRatio(n.y)}%`)
        .join(", ");
      return `polygon(${path})`;

    case MODES.INSET:
      return `inset(${getRatio(nodes[0].y)}% ${100 - getRatio(nodes[1].x)}% ${100 - getRatio(nodes[2].y)}% ${getRatio(nodes[3].x)}%)`;

    case MODES.ELLIPSE:
      const xDist = Math.abs(getRatio(nodes[1].x - nodes[0].x));
      const yDist = Math.abs(getRatio(nodes[2].y - nodes[0].y));
      return `ellipse(${xDist}% ${yDist}% at ${getRatio(nodes[0].x)}% ${getRatio(nodes[0].y)}%)`;

    case MODES.CIRCLE:
      const dx = nodes[1].x - nodes[0].x;
      const dy = nodes[1].y - nodes[0].y;
      const dist = getRatio(Math.sqrt(dx * dx + dy * dy));
      return `circle(${dist}% at ${getRatio(nodes[0].x)}% ${getRatio(nodes[0].y)}%)`;

    default:
      return "";
  }
};

interface NodeProps {
  x: number;
  y: number;
  id: number;
  removing: boolean;
  restrictX?: boolean;
  restrictY?: boolean;
  onMove: (id: number, x: number, y: number) => void;
  onRemove: (id: number) => void;
}

const ClipPathNode = ({ x, y, id, removing, restrictX, restrictY, onMove, onRemove }: NodeProps) => {
  const [pos, setPos] = useState({ x, y });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (removing) {
      onRemove(id);
      return;
    }

    const parent = (e.currentTarget as HTMLElement).parentElement!;
    const rect = parent.getBoundingClientRect();

    const move = (moveE: MouseEvent) => {
      const newX = moveE.clientX - rect.left;
      const newY = moveE.clientY - rect.top;
      const clampedX = Math.max(0, Math.min(rect.width, restrictX ? pos.x : newX));
      const clampedY = Math.max(0, Math.min(rect.height, restrictY ? pos.y : newY));
      setPos({ x: clampedX, y: clampedY });
      onMove(id, clampedX, clampedY);
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return (
    <div
      className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white cursor-pointer z-50 ${
        removing ? "bg-red-500 hover:scale-125" : "bg-blue-500 hover:scale-110"
      }`}
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={handleMouseDown}
    >
      {removing && (
        <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
    </div>
  );
};

interface ClipPathEditorProps {
  elementId: string;
  element: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  onUpdate: (clipPath: string) => void;
  onClose: () => void;
}

export const ClipPathEditor = ({ element, onUpdate, onClose }: ClipPathEditorProps) => {
  const SIZE = 300;
  const [mode, setMode] = useState<Mode>(MODES.POLYGON);
  const [nodes, setNodes] = useState<Point[]>(PRESETS[MODES.POLYGON]);
  const [removing, setRemoving] = useState(false);

  const clipPath = getClipPath(nodes, SIZE, mode);

  const handleNodeMove = (id: number, x: number, y: number) => {
    const newNodes = [...nodes];
    newNodes[id] = { x, y };

    // Atualiza nós dependentes
    if (mode === MODES.CIRCLE && id === 0) {
      const dx = x - nodes[0].x;
      const dy = y - nodes[0].y;
      newNodes[1] = { x: nodes[1].x + dx, y: nodes[1].y + dy };
    } else if (mode === MODES.ELLIPSE && id === 0) {
      const dx = x - nodes[0].x;
      const dy = y - nodes[0].y;
      newNodes[1] = { x: nodes[1].x + dx, y: nodes[1].y };
      newNodes[2] = { x: nodes[2].x, y: nodes[2].y + dy };
    }

    setNodes(newNodes);
    onUpdate(clipPath);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setNodes(PRESETS[newMode]);
    setRemoving(false);
  };

  const addNode = () => {
    if (mode === MODES.POLYGON) {
      setNodes([...nodes, { x: SIZE / 2, y: SIZE / 2 }]);
    }
  };

  const removeNode = (id: number) => {
    if (mode === MODES.POLYGON && nodes.length > 3) {
      setNodes(nodes.filter((_, i) => i !== id));
    }
  };

  const getRestrictions = (idx: number) => {
    if (mode === MODES.INSET) {
      return { restrictX: idx % 2 === 0, restrictY: idx % 2 === 1 };
    }
    if (mode === MODES.ELLIPSE) {
      if (idx === 1) return { restrictY: true };
      if (idx === 2) return { restrictX: true };
    }
    return {};
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 shadow-2xl max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">Clip Path Editor</h2>

        {/* Preview */}
        <div className="relative bg-gray-100 rounded mb-4" style={{ width: SIZE, height: SIZE, margin: "0 auto" }}>
          <div
            className="absolute inset-0 bg-purple-500"
            style={{ clipPath }}
          />
          {nodes.map((node, i) => (
            <ClipPathNode
              key={i}
              id={i}
              x={node.x}
              y={node.y}
              removing={removing}
              onMove={handleNodeMove}
              onRemove={removeNode}
              {...getRestrictions(i)}
            />
          ))}
        </div>

        {/* CSS Output */}
        <div className="bg-gray-100 p-3 rounded mb-4 font-mono text-sm">
          clip-path: {clipPath};
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-4">
          {Object.values(MODES).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-4 py-2 rounded capitalize ${
                mode === m ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {mode === MODES.POLYGON && (
            <>
              <button onClick={addNode} className="px-4 py-2 bg-green-500 text-white rounded">
                Add Node
              </button>
              <button
                onClick={() => setRemoving(!removing)}
                className={`px-4 py-2 rounded text-white ${removing ? "bg-orange-500" : "bg-red-500"}`}
              >
                {removing ? "Done" : "Remove Node"}
              </button>
            </>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
