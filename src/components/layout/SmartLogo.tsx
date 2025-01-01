import React from 'react';

export const SmartLogo = () => (
  <div className="flex items-center gap-3">
    {/* Glowing Orb with Curved Arrows */}
    <div 
      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
      style={{
        boxShadow: `
          0 0 7px #F97316,
          0 0 10px #F97316,
          0 0 21px #F97316,
          0 0 42px #F97316
        `,
        animation: 'pulse 2s infinite'
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="w-4 h-4"
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M3 12c0-2.5 2-4.5 4.5-4.5S12 9.5 12 12" className="text-white" />
        <path d="M21 12c0 2.5-2 4.5-4.5 4.5S12 14.5 12 12" className="text-white" />
        <path d="M7 9l0.5-1.5" className="text-white" />
        <path d="M17 15l-0.5 1.5" className="text-white" />
      </svg>
    </div>
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
