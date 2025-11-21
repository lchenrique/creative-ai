import type { GeometricShapes01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export interface IconProps extends React.ComponentProps<typeof HugeiconsIcon> {
  icon: typeof GeometricShapes01Icon;
  size?: number;
}

export const Icon = ({ icon, size = 24, ...props }: IconProps) => {
  return <HugeiconsIcon icon={icon} size={size} {...props} />;
};
