import { useEffect, useRef, useState } from 'react';

export const GridOverlay = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={gridRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(249, 115, 22, 0.2) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(249, 115, 22, 0.2) 1px, transparent 1px)
        `,
        backgroundSize: '25px 25px',
        mask: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, 
               rgba(255, 255, 255, 1) 0%,
               rgba(255, 255, 255, 0.9) 30%,
               rgba(255, 255, 255, 0) 70%)`,
        WebkitMask: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, 
                    rgba(255, 255, 255, 1) 0%,
                    rgba(255, 255, 255, 0.9) 30%,
                    rgba(255, 255, 255, 0) 70%)`,
        boxShadow: 'inset 0 0 50px rgba(249, 115, 22, 0.3)',
      }}
    />
  );
};