import { IntensitySlider } from "./intensity-slider";

interface FilterItemProps {
    id: string;
    name: string;
    cssFilter: string;
    isActive: boolean;
    intensity: number;
    previewImage: string;
    onSelect?: () => void;
    onIntensityChange: (value: number) => void;
}

export const FilterItem = ({
    id,
    name,
    cssFilter,
    isActive,
    intensity,
    previewImage,
    onSelect,
    onIntensityChange,
}: FilterItemProps) => {
    return (
        <div className="relative flex gap-2 ">
            {id !== "original" && isActive && (
                <div className="absolute z-10 top-0 left-0 w-full h-full">
                    <IntensitySlider intensity={intensity} onChange={onIntensityChange} />
                </div>
            )}
            <button
                onClick={onSelect ? () => onSelect() : undefined}
                className={`w-full rounded-xl overflow-hidden transition-all ${isActive
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:ring-1 hover:ring-filter-hover"
                    }`}
            >
                <div className="relative h-15 w-full">
                    <img
                        src={previewImage}
                        alt={name}
                        className="w-full h-full object-cover pointer-events-none"
                        style={{ filter: cssFilter }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">
                        {name}
                    </span>
                </div>
            </button>


        </div>
    );
};
