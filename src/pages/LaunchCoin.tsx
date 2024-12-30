import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function LaunchCoin() {
  return (
    <div className="p-6">
      <Link to="/" className="text-primary hover:text-primary/90 inline-flex items-center gap-2 mb-8">
        <ArrowLeft className="h-4 w-4" />
        go back
      </Link>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
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