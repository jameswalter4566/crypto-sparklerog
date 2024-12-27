import { formatDate, formatPrice } from './chartUtils';

export const getChartConfig = (minPrice: number, maxPrice: number) => ({
  xAxis: {
    dataKey: "date",
    axisLine: { stroke: '#333' },
    tickLine: false,
    tick: { fill: '#666', fontSize: 12 },
    tickFormatter: formatDate,
    minTickGap: 50
  },
  yAxis: {
    domain: [minPrice, maxPrice],
    axisLine: { stroke: '#333' },
    tickLine: false,
    tick: { fill: '#666', fontSize: 12 },
    tickFormatter: formatPrice,
    width: 80,
    orientation: "right"
  },
  cartesianGrid: {
    strokeDasharray: "3 3",
    stroke: "rgba(255, 255, 255, 0.1)",
    vertical: false
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      border: '1px solid #333',
      borderRadius: '4px',
      padding: '8px'
    },
    labelStyle: { color: '#999' },
    formatter: (value: number) => [formatPrice(value), 'Price'],
    labelFormatter: formatDate
  }
});