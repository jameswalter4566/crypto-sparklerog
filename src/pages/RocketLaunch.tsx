import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RocketLaunch() {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect back to home after animation completes
    const timeout = setTimeout(() => {
      navigate('/');
    }, 4000); // 4 seconds total animation

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative w-32 h-32">
        {/* Rocket */}
        <div className="absolute inset-0 animate-[launch_2s_ease-in_forwards]">
          <div className="w-32 h-32 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-16 bg-white rounded-t-full" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary rounded-lg" />
            {/* Fins */}
            <div className="absolute bottom-12 -left-2 w-4 h-8 bg-secondary rotate-[-30deg]" />
            <div className="absolute bottom-12 -right-2 w-4 h-8 bg-secondary rotate-[30deg]" />
          </div>
        </div>
        {/* Flame */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-16 animate-[flame_0.2s_ease-in-out_infinite_alternate]">
          <div className="w-full h-full bg-gradient-to-t from-orange-500 via-yellow-500 to-transparent rounded-b-full" />
        </div>
      </div>
      <p className="absolute bottom-20 left-1/2 -translate-x-1/2 text-2xl text-white animate-pulse">
        Launching your coin... 🚀
      </p>
    </div>
  );
}