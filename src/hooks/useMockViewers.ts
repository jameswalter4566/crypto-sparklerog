import { useState, useEffect } from 'react';

export const useMockViewers = (isStreamer: boolean) => {
  const [mockViewers, setMockViewers] = useState(0);
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isStreamer) return;

    // Set stream start time
    setStreamStartTime(Date.now());

    const interval = setInterval(() => {
      const timeElapsed = streamStartTime ? (Date.now() - streamStartTime) / 1000 : 0;
      
      setMockViewers((current) => {
        // First 15 seconds: stay at 0
        if (timeElapsed < 15) {
          return 0;
        }
        
        // Growth phase: slowly increase to 20
        if (current < 20) {
          const change = Math.random() > 0.5 ? 2 : 1;
          return Math.min(current + change, 20);
        }
        
        // Maintenance phase: fluctuate between 10 and 20
        const shouldIncrease = Math.random() > 0.5;
        const change = Math.random() > 0.5 ? 2 : 1;
        
        if (shouldIncrease && current < 20) {
          return Math.min(current + change, 20);
        } else if (!shouldIncrease && current > 10) {
          return Math.max(current - change, 10);
        }
        
        return current;
      });
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(interval);
      setStreamStartTime(null);
    };
  }, [isStreamer, streamStartTime]);

  return mockViewers;
};