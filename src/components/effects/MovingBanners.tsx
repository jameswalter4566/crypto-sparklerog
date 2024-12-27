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
    <div className="fixed top-24 left-0 right-0 z-10 overflow-hidden pointer-events-none">
      <div className="whitespace-nowrap animate-[slide-left_40s_linear_infinite] flex gap-8">
        {messages.map((message, index) => (
          <span 
            key={index}
            className="text-sm font-medium transition-colors duration-500"
            style={{ color: colors[index] || priceColors[0] }}
          >
            {message} • 
          </span>
        ))}
      </div>
    </div>
  );
};