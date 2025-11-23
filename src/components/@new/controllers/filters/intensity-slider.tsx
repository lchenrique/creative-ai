interface IntensitySliderProps {
    intensity: number;
    onChange: (value: number) => void;
}

export const IntensitySlider = ({ intensity, onChange }: IntensitySliderProps) => {
    const handleInteraction = (clientX: number, rect: DOMRect) => {
        const x = rect.left - clientX;
        const percentage = Math.round((x / (rect.width)) * -100);
        onChange(Math.max(6, Math.min(100, percentage)));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const slider = e.currentTarget;
        const rect = slider.getBoundingClientRect();

        handleInteraction(e.clientX, rect);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            handleInteraction(moveEvent.clientX, rect);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        handleInteraction(e.clientX, rect);
    };

    return (
        <div
            className="relative w-full h-15 bg-black/30 rounded-2xl mx-auto cursor-pointer"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            <div
                className="absolute bottom-0 h-3 w-full left-0 bg-white/20 rounded-2xl transition-all duration-300"
            />
            <div
                className="absolute bottom-0 h-3  left-0 bg-primary/50 rounded-2xl transition-all duration-300"
                style={{ width: `${intensity}% ` }}
            />
            <div
                className="absolute bottom-0 w-3 h-3 bg-white rounded-full shadow-lg pointer-events-none"
                style={{ left: `calc(${intensity}% - 12px)` }}
            />
        </div>
    );
};
