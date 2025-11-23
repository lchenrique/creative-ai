import React, { useEffect, useRef, useState } from 'react';

interface AnglePickerProps {
  angle: number;
  onChange: (angle: number) => void;
}

export const AnglePicker: React.FC<AnglePickerProps> = ({ angle, onChange }) => {
  const circleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateAngle = (clientX: number, clientY: number) => {
    if (!circleRef.current) return;
    const rect = circleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Calculate angle in degrees (0-360), adjusting so 0 is up or right as per standard
    // Standard CSS: 0deg is North (Up), 90deg is East (Right)
    // Math.atan2(y, x) returns radians. 0 is East.
    
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    deg = deg + 90; // Adjust so 0 is up
    
    if (deg < 0) deg += 360;
    
    return Math.round(deg);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const newAngle = calculateAngle(e.clientX, e.clientY);
    if (newAngle !== undefined) onChange(newAngle);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newAngle = calculateAngle(e.clientX, e.clientY);
      if (newAngle !== undefined) onChange(newAngle);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onChange]);

  return (
    <div 
      className="relative w-16 h-16 rounded-full border-2 border-white/30 bg-black/20 backdrop-blur-sm shadow-lg cursor-pointer flex items-center justify-center group hover:bg-black/30 transition-colors"
      ref={circleRef}
      onMouseDown={handleMouseDown}
      title="Drag to change angle"
    >
        {/* Center dot */}
        <div className="w-1.5 h-1.5 bg-white rounded-full absolute"></div>
        
        {/* Indicator Line */}
        <div 
            className="absolute w-full h-full pointer-events-none"
            style={{ transform: `rotate(${angle}deg)` }}
        >
             <div className="w-1 h-[50%] bg-gradient-to-t from-transparent to-white mx-auto origin-bottom rounded-t-full relative -top-1/2 translate-y-full"></div>
             {/* The handle dot at the end of the line */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm group-hover:scale-125 transition-transform"></div>
        </div>
        
        {/* Text tooltip on hover */}
        <div className="absolute -bottom-8 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono">
            {angle}°
        </div>
    </div>
  );
};
