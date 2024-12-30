import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LaunchCoin() {
  const [rocketPosition, setRocketPosition] = useState(-200);

  useEffect(() => {
    const animateRocket = () => {
      setRocketPosition(-200);
      const animation = setInterval(() => {
        setRocketPosition(prev => {
          if (prev >= window.innerWidth + 200) {
            clearInterval(animation);
            setTimeout(animateRocket, 5000); // Wait 5 seconds before next animation
            return -200;
          }
          return prev + 5; // Move 5px each frame
        });
      }, 16); // ~60fps

      return () => clearInterval(animation);
    };

    animateRocket();
    return () => setRocketPosition(-200);
  }, []);

  return (
    <div className="p-6 relative min-h-screen overflow-hidden">
      <Link to="/" className="text-primary hover:text-primary/90 inline-flex items-center gap-2 mb-8 relative z-10">
        <ArrowLeft className="h-4 w-4" />
        go back
      </Link>

      {/* Static Stars */}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            top: `${Math.floor(Math.random() * 100)}%`,
            left: `${Math.floor(Math.random() * 100)}%`,
            opacity: 0.7
          }}
        />
      ))}

      {/* Animated Rocket */}
      <div 
        className="absolute z-20"
        style={{
          left: `${rocketPosition}px`,
          top: '40%',
          transform: 'translateY(-50%)',
          transition: 'left 0.016s linear'
        }}
      >
        <div className="text-6xl transform rotate-90">🚀</div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Coin Launch Feature
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Releasing 1/01/2025
        </p>
      </div>
    </div>
  );
}