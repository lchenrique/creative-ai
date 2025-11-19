import { type MoveableManagerInterface } from "react-moveable";
import { Button } from "@creative-ds/ui";
import { Bezier, LineSegment } from "@phosphor-icons/react";

interface CurveControlProps {
    onToggleCurve?: (elementId: string, pointIndex: number) => void;
    clippableId?: string | null;
}

export const CurveControl = {
    name: "curveControl",
    props: ["onToggleCurve", "clippableId"] as const,
    events: [],
    render(moveable: MoveableManagerInterface<CurveControlProps, any>) {
        const rect = moveable.getRect();
        const { pos1 } = moveable.state;
        const props = moveable.props;

        // Only show when in clippable mode
        if (!props.clippableId) {
            return null;
        }

        return (
            <div
                data-slot="floating-menu-content"
                key="curve-control-viewer"
                className="moveable-curve-control absolute flex gap-1 left-0 top-0 will-change-transform"
                style={{
                    transformOrigin: "0px 0px",
                    transform: `translate(${pos1[0]}px, ${pos1[1] - 40}px)`,
                }}
            >
                <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    title="Converter para curva"
                    onClick={() => {
                        // TODO: Implement curve conversion
                        // This would need to track which point is selected
                        // and convert it from L to Q or C command
                        console.log("Toggle curve mode");
                    }}
                >
                    <Bezier className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    title="Converter para linha"
                    onClick={() => {
                        console.log("Toggle line mode");
                    }}
                >
                    <LineSegment className="h-4 w-4" />
                </Button>
            </div>
        );
    },
} as const;
