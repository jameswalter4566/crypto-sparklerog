export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export const generateMockData = () => {
  return Array.from({ length: 100 }, (_, i) => {
    const basePrice = 100;
    const volatility = 0.02;
    const time = new Date();
    time.setMinutes(time.getMinutes() - (100 - i));
    
    const randomWalk = Array.from({ length: i + 1 }, () => 
      (Math.random() - 0.5) * volatility
    ).reduce((a, b) => a + b, 0);
    
    return {
      date: time.toISOString(),
      price: basePrice * (1 + randomWalk)
    };
  });
};