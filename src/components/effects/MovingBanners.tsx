import { useEffect, useState } from 'react';
import { priceColors } from '@/constants/colors';

const tradingTips = [
  "Always DYOR (Do Your Own Research) before investing",
  "Never invest more than you can afford to lose",
  "Diversify your portfolio to manage risk",
  "Keep track of your trades and learn from them",
  "Stay updated with market news and trends",
  "Use stop-loss orders to protect your investments",
  "Don't chase pumps, stick to your strategy",
  "Take profits regularly, don't be too greedy",
  "Watch trading volume, not just price",
  "Be patient, successful trading takes time"
];

export const MovingBanners = () => {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setColors(tradingTips.map(() => 
        priceColors[Math.floor(Math.random() * priceColors.length)]
      ));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-24 left-0 right-0 z-10 overflow-hidden pointer-events-none">
      <div className="whitespace-nowrap animate-[slide-left_20s_linear_infinite] flex gap-8">
        {tradingTips.map((tip, index) => (
          <span 
            key={index}
            className="text-sm font-medium transition-colors duration-500"
            style={{ color: colors[index] || priceColors[0] }}
          >
            {tip} • 
          </span>
        ))}
      </div>
    </div>
  );
};