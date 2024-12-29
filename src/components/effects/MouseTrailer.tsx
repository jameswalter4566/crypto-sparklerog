import { useEffect, useState } from 'react';

export const MouseTrailer = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      // Removed requestAnimationFrame for immediate response
      setPosition({
        x: e.clientX,
        y: e.clientY
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
      className="pointer-events-none fixed z-50 h-4 w-4 rounded-full bg-primary/40 transition-transform duration-75 animate-glow-pulse"
      style={{
        transform: `translate(${position.x - 8}px, ${position.y - 8}px)`,
        boxShadow: '0 0 20px rgba(249,115,22,0.6), 0 0 40px rgba(249,115,22,0.3)'
      }}
    />
  );
};