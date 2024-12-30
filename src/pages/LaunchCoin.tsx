import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function LaunchCoin() {
  // Generate an array of 50 stars with random positions and animation delays
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1, // Random size between 1-3px
    delay: Math.random() * 100, // Random delay for animation
  }));

  return (
    <div className="relative min-h-screen p-6 overflow-hidden">
      {/* Slowly moving stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full opacity-70 particle"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--particle-index': star.delay,
          }}
        />
      ))}

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