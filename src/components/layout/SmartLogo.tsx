import React from 'react';

export const SmartLogo = () => (
  <div className="flex items-center gap-3">
    {/* Glowing Orb */}
    <div 
      className="w-6 h-6 rounded-full bg-primary"
      style={{
        boxShadow: `
          0 0 7px #F97316,
          0 0 10px #F97316,
          0 0 21px #F97316,
          0 0 42px #F97316
        `,
        animation: 'pulse 2s infinite'
      }}
    />
    {/* SMART Text */}
    <div className="flex items-center space-x-[1px] font-bold text-2xl">
      {['S', 'M', 'A', 'R', 'T'].map((letter, index) => (
        <span
          key={index}
          className="animate-glow-pulse text-white font-['Poppins']"
          style={{
            textShadow: `
              0 0 7px #F97316,
              0 0 10px #F97316,
              0 0 21px #F97316
            `
          }}
        >
          {letter}
        </span>
      ))}
    </div>
  </div>
);