import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

export const SmartLogo = () => (
  <div className="flex items-center gap-3">
    {/* Glowing Orb with Arrows */}
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
      <ArrowLeftRight className="w-4 h-4 text-white" />
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