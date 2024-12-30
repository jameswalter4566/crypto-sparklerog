import { useState, useEffect } from 'react';

export const useMockViewers = (isStreamer: boolean) => {
  const [mockViewers, setMockViewers] = useState(0);

  useEffect(() => {
    if (!isStreamer) return;

    // Generate initial random viewer count between 5-20
    const initialViewers = Math.floor(Math.random() * 16) + 5;
    setMockViewers(initialViewers);

    // Update viewers every 3-7 seconds
    const interval = setInterval(() => {
      setMockViewers((current) => {
        // Decide whether to increase or decrease
        const shouldIncrease = Math.random() > 0.5;
        
        // Change by 1 or 2 viewers
        const change = Math.random() > 0.5 ? 2 : 1;
        
        let newCount;
        if (shouldIncrease) {
          newCount = current + change;
          // Cap at 20 viewers
          return Math.min(newCount, 20);
        } else {
          newCount = current - change;
          // Minimum 5 viewers
          return Math.max(newCount, 5);
        }
      });
    }, Math.floor(Math.random() * 4000) + 3000); // Random interval between 3-7 seconds

    return () => clearInterval(interval);
  }, [isStreamer]);

  return mockViewers;
};