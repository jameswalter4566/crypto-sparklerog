import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function LaunchCoin() {
  // Generate an array of 50 stars with random positions
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1, // Random size between 1-3px
  }));

  return (
    <div className="relative min-h-screen p-6 overflow-hidden">
      {/* Static stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full opacity-70"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
        />
      ))}

      {/* Animated Rocket */}
      <div className="absolute w-12 h-12 animate-rocket">
        <div className="relative transform -rotate-45">
          <div className="w-8 h-16 bg-primary rounded-t-full" /> {/* Rocket body */}
          <div className="absolute bottom-0 left-1/2 w-4 h-4 -translate-x-1/2 bg-secondary" /> {/* Rocket window */}
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-primary -translate-y-full transform -rotate-45" /> {/* Left fin */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary -translate-y-full transform rotate-45" /> {/* Right fin */}
          <div className="absolute -bottom-2 left-1/2 w-2 h-4 -translate-x-1/2 bg-orange-600 animate-pulse" /> {/* Rocket flame */}
        </div>
      </div>

      {/* Main content */}
      <Link to="/" className="relative z-10 text-primary hover:text-primary/90 inline-flex items-center gap-2 mb-8">
        <ArrowLeft className="h-4 w-4" />
        go back
      </Link>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[50vh] text-center">
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