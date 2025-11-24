import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MixBlendModeProps {
    mixBlendMode: string;
    onMixBlendModeChange: (value: string) => void;
}
export const MixBlendMode = ({ mixBlendMode, onMixBlendModeChange }: MixBlendModeProps) => {
    const blends = [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
    ];
    return (
        <div className="flex gap-2 flex-col divide-y overflow-auto h-full">
            {blends.map((blend) => (
                <button
                    key={blend}
                    onClick={() => onMixBlendModeChange(blend)}
                    className={`p-2 rounded-sm shadow-sm ${blend === mixBlendMode ? "bg-primary text-white" : ""}`}
                >
                    {blend}
                </button>
            ))}
        </div>
    )
}