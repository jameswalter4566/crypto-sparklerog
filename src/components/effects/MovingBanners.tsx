import { useEffect, useState } from 'react';
import { priceColors } from '@/constants/colors';

const messages = [
  "Join a voice Channel now! Don't be shy",
  "Stay Updated with new platform updates! Click Community Updates and follow us on X!",
];

export const MovingBanners = () => {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setColors(messages.map(() => 
        priceColors[Math.floor(Math.random() * priceColors.length)]
      ));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-24 left-0 right-0 z-50 overflow-hidden pointer-events-none">
      <div className="relative flex whitespace-nowrap">
        <div className="animate-marquee flex gap-8">
          {[...Array(3)].map((_, i) => (
            messages.map((message, index) => (
              <span 
                key={`${i}-${index}`}
                className="text-sm font-medium transition-colors duration-500"
                style={{ color: colors[index] || priceColors[0] }}
              >
                {message} • 
              </span>
            ))
          ))}
        </div>
        <div className="absolute top-0 animate-marquee2 flex gap-8">
          {[...Array(3)].map((_, i) => (
            messages.map((message, index) => (
              <span 
                key={`${i}-${index}`}
                className="text-sm font-medium transition-colors duration-500"
                style={{ color: colors[index] || priceColors[0] }}
              >
                {message} • 
              </span>
            ))
          ))}
        </div>
      </div>
    </div>
  );
};