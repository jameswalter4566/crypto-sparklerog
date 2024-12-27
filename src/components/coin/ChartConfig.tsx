import { useMemo } from 'react';

export const useChartConfig = (data: Array<{ date: string; price: number }>) => {
  return useMemo(() => {
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceChange: data.length >= 2 
        ? ((data[data.length - 1].price - data[0].price) / data[0].price) * 100
        : 0
    };
  }, [data]);
};

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