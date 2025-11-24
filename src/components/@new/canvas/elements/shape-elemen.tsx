import { colorConfigToCss } from "@/lib/gradient-utils";
import type { ElementsProps } from "@/stores/canva-store";

interface ShapeProps {
    element: ElementsProps;
}

export const ShapeElement = ({ element }: ShapeProps) => {
    const bgColor = element.config.style.backgroundColor;
    const cssBackground = bgColor
        ? colorConfigToCss(
            bgColor,
            element.config.size.width,
            element.config.size.height,
        )
        : undefined;


    return <div
        style={{
            width: element.config.size.width,
            height: element.config.size.height,
            left: element.config.position.x,
            top: element.config.position.y,
            background: cssBackground,
            borderRadius: element.config.style.borderRadius,
        }}
    />
};