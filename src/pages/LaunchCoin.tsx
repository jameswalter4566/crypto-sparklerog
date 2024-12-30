import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function LaunchCoin() {
  const [stars] = useState(() =>
    Array.from({ length: 50 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      animationDelay: `${Math.random() * 10}s`,
    }))
  );

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Stars background */}
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute bg-white rounded-full animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.animationDelay,
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
        Back to Home
      </Link>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Launch Your Coin</h1>
        <p className="text-lg text-gray-300 mb-8">
          Ready to launch your own cryptocurrency? Follow these steps to get started.
        </p>

        <div className="space-y-8">
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Step 1: Prepare Your Token</h2>
            <p className="text-gray-300">
              Ensure you have all the necessary information about your token:
              name, symbol, total supply, and tokenomics.
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Step 2: Deploy Smart Contract</h2>
            <p className="text-gray-300">
              Deploy your token's smart contract to the blockchain. Make sure to
              audit your code for security.
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Step 3: List Your Token</h2>
            <p className="text-gray-300">
              Submit your token for listing on our platform. We'll review it and
              make it available for trading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}