import React from 'react';

export const ChartLoading = () => {
  return (
    <div className="w-full h-[600px] bg-black border border-gray-800 rounded-lg flex flex-col items-center justify-center space-y-4">
      <img 
        src="/swaplogoofficial.jpg" 
        alt="Loading" 
        className="w-16 h-16 animate-spin rounded-full"
      />
      <p className="text-gray-400 text-lg font-semibold">Loading Chart</p>
    </div>
  );
};