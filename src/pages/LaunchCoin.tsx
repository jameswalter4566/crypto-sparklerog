import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface Star {
  id: number;
  size: number;
  top: number;
  left: number;
  delay: number;
}

export default function LaunchCoin() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 50 }, (_, index) => ({
        id: index,
        size: Math.random() * 4 + 2, // Slightly larger stars
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 3, // Reduced delay range for faster initial appearance
      }));
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="p-6 relative min-h-screen overflow-hidden">
      <Link to="/" className="text-primary hover:text-primary/90 inline-flex items-center gap-2 mb-8 relative z-10">
        <ArrowLeft className="h-4 w-4" />
        go back
      </Link>

      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white opacity-70 particle"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: `${star.top}%`,
            left: `${star.left}%`,
            '--particle-index': star.delay,
          } as React.CSSProperties}
        />
      ))}

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