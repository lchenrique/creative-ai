import { filters } from "@/lib/filters";
import { colorConfigToCss } from "@/lib/gradient-utils";
import type { ElementsProps } from "@/stores/canva-store";
import type { CSSProperties } from "react";

interface ImageElementProps {
    element: ElementsProps;
}

export const ImageElement = ({ element }: ImageElementProps) => {
    const bgColor = element.config.style.backgroundColor;
    const filter = element.config.filter;
    const intensity = element.config.filterIntensities?.[filter || "original"] || 100;
    const cssBackground = bgColor
        ? colorConfigToCss(
            bgColor,
            element.config.size.width,
            element.config.size.height,
        )
        : undefined;

    const getFilterStyle = () => {
        if (filter === "original") return {};

        const intensityFactor = (intensity - 12) / 100;
        const currentFilter = filters.find((f) => f.id === filter);
        const hasMixBlend = !!currentFilter?.mixBlendMode;

        return {
            filter: hasMixBlend ? undefined : currentFilter?.cssFilter,
            opacity: intensityFactor > 0 ? 0.2 + (1.4 * intensityFactor) : 0,
        };
    };

    const getMixFilterStyle = () => {
        if (filter === "original") return {};

        const currentFilter = filters.find((f) => f.id === filter);

        return {
            filter: currentFilter?.cssFilter,
            background: currentFilter?.background,
            mixBlendMode: currentFilter?.mixBlendMode as CSSProperties["mixBlendMode"],
        };
    };

    const mixBlendMode = element.config.style.mixBlendMode || "normal";



    return (
        <div
            style={{
                width: element.config.size.width,
                height: element.config.size.height,
                borderRadius: element.config.style.borderRadius,
                // clipPath: element.config.style.clipPath,
                overflow: "hidden",
                opacity: element.config.style.opacity,
                mixBlendMode: mixBlendMode as CSSProperties["mixBlendMode"],
            }}
        >
            {bgColor?.type === "image" && <img
                src={bgColor.value}
                alt="Image element"
                className="h-full w-full object-cover"
            />}
            <div
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={getFilterStyle()}
            >
                {filter && bgColor?.type === "image" && <img
                    src={bgColor.value}
                    alt="Filter applied"
                    className="w-full h-full object-cover"
                    style={{
                        mixBlendMode: filters.find((f) => f.id === filter)?.imageMixBlendMode as CSSProperties["mixBlendMode"]
                    }}
                />}
                {filters.find((f) => f.id === filter)?.mixBlendMode && (
                    <div
                        className="absolute inset-0 pointer-events-none transition-all duration-300 z-999"
                        style={getMixFilterStyle()}
                    />
                )}
            </div>
        </div>
    );
};
