import { ColorPicker } from "@/components/color-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { generateCssString, parseCssString } from "@/lib/gradient-utils";
import type { ColorStop, GradientState, Point } from "@/types/gradient";
import { Palette, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GradientOverlay } from "./gradient-overlay";
import { StopSlider } from "./stop-slider";
import { GRADIENT_PRESETS } from "./gradient-presets";

const Separator = () => <div className="h-px bg-border w-full my-1" />;
export interface GradientEditorProps {
  defaultGradient: GradientState;
  onChange: (gradient: GradientState) => void;
}

const INITIAL_STOPS: ColorStop[] = [
  { id: "1", color: "#3b82f6", offset: 0 }, // Blue-500
  { id: "2", color: "#22d3ee", offset: 100 }, // Cyan-400
];

const INITIAL_LINEAR_START = { x: 1, y: 0.5 };
const INITIAL_LINEAR_END = { x: 0.8, y: 0.5 };

export function GradientEditor({
  defaultGradient,
  onChange,
}: GradientEditorProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  const [state, setState] = useState<GradientState>(
    defaultGradient || {
      type: "linear",
      angle: 90,
      linearStart: INITIAL_LINEAR_START,
      linearEnd: INITIAL_LINEAR_END,
      stops: INITIAL_STOPS,
    },
  );

  const [activeStopId, setActiveStopId] = useState<string>(INITIAL_STOPS[0].id);
  const [copied, setCopied] = useState(false);

  // Measure preview size
  useEffect(() => {
    if (!previewRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setPreviewSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    obs.observe(previewRef.current);
    return () => obs.disconnect();
  }, []);

  // Derived state
  const activeStop = useMemo(
    () => state.stops.find((s) => s.id === activeStopId) || state.stops[0],
    [state.stops, activeStopId],
  );

  const cssString = useMemo(() => {
    return generateCssString(
      state.type,
      state.stops,
      previewSize.width,
      previewSize.height,
      state.linearStart,
      state.linearEnd,
      state.angle,
    );
  }, [
    state.type,
    state.stops,
    state.linearStart,
    state.linearEnd,
    state.angle,
    previewSize,
  ]);

  // Handlers
  const handleUpdateStop = useCallback(
    (id: string, updates: Partial<ColorStop>) => {
      setState((prev) => ({
        ...prev,
        stops: prev.stops.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
    },
    [],
  );

  const handleUpdatePoints = useCallback((start: Point, end: Point) => {
    // Calculate the angle from the handles
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;
    const cssAngle = angleDeg + 90; // Convert geometric angle to CSS angle

    setState((prev) => ({
      ...prev,
      linearStart: start,
      linearEnd: end,
      angle: cssAngle,
    }));
  }, []);

  const handleAddStop = useCallback(
    (offset: number) => {
      const newId = Math.random().toString(36).substr(2, 9);
      const newColor =
        state.stops.find((s) => s.id === activeStopId)?.color || "#ffffff";

      const newStop: ColorStop = { id: newId, color: newColor, offset };

      setState((prev) => ({
        ...prev,
        stops: [...prev.stops, newStop],
      }));
      setActiveStopId(newId);
    },
    [activeStopId, state.stops],
  );

  const handleDeleteStop = useCallback(
    (id: string) => {
      if (state.stops.length <= 2) return;
      setState((prev) => {
        const newStops = prev.stops.filter((s) => s.id !== id);
        if (activeStopId === id) setActiveStopId(newStops[0].id);
        return { ...prev, stops: newStops };
      });
    },
    [state.stops.length, activeStopId],
  );

  const handleCopyCss = () => {
    navigator.clipboard.writeText(`background: ${cssString};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomize = () => {
    const randomColor = () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    const rStart = {
      x: 0.1 + Math.random() * 0.3,
      y: 0.1 + Math.random() * 0.8,
    };
    const rEnd = { x: 0.6 + Math.random() * 0.3, y: 0.1 + Math.random() * 0.8 };

    // Calculate angle from random handles
    const dx = rEnd.x - rStart.x;
    const dy = rEnd.y - rStart.y;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;
    const cssAngle = angleDeg + 90;

    setState((prev) => ({
      ...prev,
      linearStart: rStart,
      linearEnd: rEnd,
      angle: cssAngle,
      stops: prev.stops.map((s) => ({ ...s, color: randomColor() })),
    }));
  };

  const handleSelectPreset = useCallback((cssGradient: string) => {
    const parsed = parseCssString(cssGradient);
    if (parsed) {
      setState(parsed);
      if (parsed.stops.length > 0) {
        setActiveStopId(parsed.stops[0].id);
      }
    }
  }, []);

  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip onChange on initial mount to prevent moving stops
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    onChange?.(state);
  }, [state]);

  return (
    <div className="">
      <div className="">
        <div
          ref={previewRef}
          className="relative w-full h-35 bg-white rounded-lg overflow-hidden select-none shadow-inner"
        >
          <div className="absolute inset-0" style={{ background: cssString }} />
          <GradientOverlay
            type={state.type}
            width={previewSize.width}
            height={previewSize.height}
            stops={state.stops}
            linearStart={state.linearStart}
            linearEnd={state.linearEnd}
            activeStopId={activeStopId}
            onUpdateStop={handleUpdateStop}
            onUpdatePoints={handleUpdatePoints}
            onSelectStop={setActiveStopId}
            onAddStop={handleAddStop}
          />
        </div>
      </div>

      <div className="flex-1 py-3 space-y-3 overflow-hidden">
        <Separator />
        <div className="p-1 m-0">
          <div className="flex gap-1.5">
            <ToggleGroup type="single" className="w-full">
              <ToggleGroupItem
                className="flex-1"
                value="linear"
                size="sm"
                onClick={() => setState((s) => ({ ...s, type: "linear" }))}
              >
                Linear
              </ToggleGroupItem>
              <ToggleGroupItem
                className="flex-1"
                value="radial"
                size="sm"
                onClick={() => setState((s) => ({ ...s, type: "radial" }))}
              >
                Radial
              </ToggleGroupItem>
            </ToggleGroup>
            <button
              onClick={handleRandomize}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
              title="Cores Aleatórias"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        <Separator />
        <div className="p-2.5">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Palette size={14} className="text-blue-500" />
              Stops
            </label>
          </div>
          <StopSlider
            stops={state.stops}
            activeStopId={activeStopId}
            onSelectStop={setActiveStopId}
            onUpdateStop={handleUpdateStop}
            onAddStop={handleAddStop}
            onDeleteStop={handleDeleteStop}
          />
        </div>
        <Separator />
        <div className=" p-2.5  space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cor
            </label>
            <ColorPicker
              background={activeStop.color}
              setBackground={(value) =>
                handleUpdateStop(activeStopId, { color: value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 p-4 overflow-y-auto max-h-[300px]">
          {GRADIENT_PRESETS.map((gradient) => (
            <button
              key={gradient.name}
              onClick={() => handleSelectPreset(gradient.css)}
              className="w-full h-12 rounded-md border border-gray-200 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
              style={{ background: gradient.css }}
              aria-label={`Selecionar gradiente ${gradient.name}`}
              title={gradient.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
