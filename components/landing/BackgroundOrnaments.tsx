'use client';

import React from 'react';

export function BackgroundOrnaments() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large Soft Gradient Circles */}
      <div className="absolute top-[15%] left-[8%] w-[500px] h-[500px] bg-gradient-to-br from-zinc-300/40 to-zinc-200/30 rounded-full blur-[120px]" />
      <div className="absolute top-[50%] right-[10%] w-[600px] h-[600px] bg-gradient-to-tl from-zinc-300/50 to-zinc-100/40 rounded-full blur-[140px]" />
      <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-gradient-to-tr from-zinc-200/30 to-zinc-300/40 rounded-full blur-[100px]" />
      
      {/* Geometric Grid Pattern - More Visible */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#52525215_1px,transparent_1px),linear-gradient(to_bottom,#52525215_1px,transparent_1px)] bg-[size:48px_48px]" />
      
      {/* Decorative Circles Pattern - Darker & More Visible */}
      <svg className="absolute top-[25%] right-[12%] text-zinc-400 opacity-25 w-24 h-24" fill="currentColor" viewBox="0 0 100 100">
        <circle cx="10" cy="10" r="4" />
        <circle cx="35" cy="10" r="4" />
        <circle cx="60" cy="10" r="4" />
        <circle cx="85" cy="10" r="4" />
        <circle cx="10" cy="35" r="4" />
        <circle cx="35" cy="35" r="4" />
        <circle cx="60" cy="35" r="4" />
        <circle cx="85" cy="35" r="4" />
        <circle cx="10" cy="60" r="4" />
        <circle cx="35" cy="60" r="4" />
        <circle cx="60" cy="60" r="4" />
        <circle cx="85" cy="60" r="4" />
        <circle cx="10" cy="85" r="4" />
        <circle cx="35" cy="85" r="4" />
        <circle cx="60" cy="85" r="4" />
        <circle cx="85" cy="85" r="4" />
      </svg>

      <svg className="absolute bottom-[30%] left-[10%] text-zinc-400 opacity-20 w-20 h-20" fill="currentColor" viewBox="0 0 100 100">
        <circle cx="15" cy="15" r="3.5" />
        <circle cx="40" cy="15" r="3.5" />
        <circle cx="65" cy="15" r="3.5" />
        <circle cx="15" cy="40" r="3.5" />
        <circle cx="40" cy="40" r="3.5" />
        <circle cx="65" cy="40" r="3.5" />
        <circle cx="15" cy="65" r="3.5" />
        <circle cx="40" cy="65" r="3.5" />
        <circle cx="65" cy="65" r="3.5" />
      </svg>

      {/* Diagonal Lines Pattern */}
      <div className="absolute top-[10%] right-[5%] w-64 h-64 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-zinc-900">
          <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
          <line x1="10" y1="0" x2="100" y2="90" stroke="currentColor" strokeWidth="0.5" />
          <line x1="20" y1="0" x2="100" y2="80" stroke="currentColor" strokeWidth="0.5" />
          <line x1="30" y1="0" x2="100" y2="70" stroke="currentColor" strokeWidth="0.5" />
          <line x1="40" y1="0" x2="100" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="10" x2="90" y2="100" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="20" x2="80" y2="100" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="30" x2="70" y2="100" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="absolute bottom-[15%] right-[20%] w-48 h-48 opacity-8">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-zinc-900">
          <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="90" x2="90" y2="0" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="80" y2="0" stroke="currentColor" strokeWidth="0.5" />
          <line x1="10" y1="100" x2="100" y2="10" stroke="currentColor" strokeWidth="0.5" />
          <line x1="20" y1="100" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}
