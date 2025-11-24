import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  rightElement?: React.ReactNode;
}

export function Section({
  title,
  icon,
  children,
  isExpanded,
  onToggle,
  rightElement,
}: SectionProps) {
  return (
    <div className="group border-b border-border/50 last:border-b-0">
      <div className="flex w-full items-center justify-between py-3">
        <button
          onClick={onToggle}
          className="flex flex-1 items-center justify-between text-sm font-medium px-3 py-1 rounded-md hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-foreground/80 group-hover:text-foreground">
            {icon && (
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                {icon}
              </span>
            )}
            <span>{title}</span>
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
          />
        </button>
        {rightElement && (
          <div className="ml-2" onClick={(e) => e.stopPropagation()}>
            {rightElement}
          </div>
        )}
      </div>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className=" pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
