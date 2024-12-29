import { useEffect, useState } from 'react';

export const MouseTrailer = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      // Adding a slight delay using requestAnimationFrame for smooth movement
      requestAnimationFrame(() => {
        setPosition({
          x: e.clientX,
          y: e.clientY
        });
      });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 h-4 w-4 rounded-full bg-primary/30 transition-transform duration-200 animate-glow-pulse"
      style={{
        transform: `translate(${position.x - 8}px, ${position.y - 8}px)`,
        boxShadow: '0 0 20px rgba(249,115,22,0.4), 0 0 40px rgba(249,115,22,0.2)'
      }}
    />
  );
};