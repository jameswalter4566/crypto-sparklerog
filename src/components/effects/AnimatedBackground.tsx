import { useEffect, useState } from 'react';
import { GridOverlay } from './GridOverlay';

export const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setTimeOfDay('morning');
      else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
      else if (hour >= 17 && hour < 20) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };

    window.addEventListener('mousemove', handleMouseMove);
    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const getGradientStyle = () => {
    const gradients = {
      morning: 'from-blue-500/20 via-purple-400/20 to-pink-300/20',
      afternoon: 'from-orange-400/20 via-amber-300/20 to-yellow-200/20',
      evening: 'from-purple-500/20 via-pink-400/20 to-orange-300/20',
      night: 'from-blue-900/20 via-purple-800/20 to-indigo-700/20'
    };

    return `bg-gradient-to-br ${gradients[timeOfDay]} transition-colors duration-1000`;
  };

  return (
    <>
      <div 
        className={`fixed inset-0 -z-10 ${getGradientStyle()}`}
        style={{
          transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />
      <div className="fixed inset-0 -z-10">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle absolute rounded-full bg-white/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animation: `float ${Math.random() * 10 + 5}s linear infinite`
            }}
          />
        ))}
      </div>
      <GridOverlay />
    </>
  );
};