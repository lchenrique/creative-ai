import { useEffect, useRef, useState } from "react";

interface AutoScaleTextProps {
    children: React.ReactNode;
    maxFontSize: number;
    minFontSize?: number;
    widthOnly?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export function AutoScaleText({
    children,
    maxFontSize,
    minFontSize = 10,
    widthOnly = false,
    className,
    style,
}: AutoScaleTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(maxFontSize);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        const adjustFontSize = () => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            let currentFontSize = maxFontSize;
            content.style.fontSize = `${currentFontSize}px`;

            // Binary search para encontrar o maior fontSize que cabe
            let minSize = minFontSize;
            let maxSize = maxFontSize;
            let iterations = 0;
            const maxIterations = 20;

            while (maxSize - minSize > 1 && iterations < maxIterations) {
                currentFontSize = Math.floor((minSize + maxSize) / 2);
                content.style.fontSize = `${currentFontSize}px`;

                const contentWidth = content.scrollWidth;
                const contentHeight = content.scrollHeight;

                const fitsWidth = contentWidth <= containerWidth;
                const fitsHeight = widthOnly ? true : contentHeight <= containerHeight;

                if (fitsWidth && fitsHeight) {
                    minSize = currentFontSize;
                } else {
                    maxSize = currentFontSize;
                }

                iterations++;
            }

            setFontSize(minSize);
        };

        // Ajustar inicialmente
        adjustFontSize();

        // Observar mudanças no tamanho do container
        const resizeObserver = new ResizeObserver(() => {
            adjustFontSize();
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [maxFontSize, minFontSize, widthOnly, children]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                ...style,
                width: "100%",
                height: "100%",
            }}
        >
            <div
                ref={contentRef}
                style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1,
                    whiteSpace: widthOnly ? "normal" : "nowrap",
                }}
            >
                {children}
            </div>
        </div>
    );
}
