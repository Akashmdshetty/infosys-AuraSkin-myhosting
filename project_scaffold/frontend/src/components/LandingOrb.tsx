import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Droplets, Moon, Sun, HeartPulse, Cpu } from 'lucide-react';

export const LandingOrb: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="orb-container relative w-60 h-60 md:w-72 md:h-72 flex items-center justify-center select-none cursor-pointer"
      style={{
        transform: reducedMotion
          ? 'none'
          : `perspective(700px) rotateY(${mousePos.x * 24}deg) rotateX(${-mousePos.y * 24}deg)`,
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      title="AuraSkin AI Dermal Intelligence Core"
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-teal-500/25 via-sky-400/20 to-emerald-400/25 blur-2xl pointer-events-none" />

      {/* SVG Rotating Rings & Hexagonal Orbital Structure */}
      <svg className="w-full h-full absolute inset-0 transform -rotate-12" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="landingOrbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00685f" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="landingOrbitStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Orbit Ring Outer */}
        <circle
          cx="120"
          cy="120"
          r="92"
          fill="none"
          stroke="url(#landingOrbitStroke)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />

        {/* Orbit Ring Ellipse */}
        <ellipse
          cx="120"
          cy="120"
          rx="102"
          ry="54"
          fill="none"
          stroke="url(#landingOrbitStroke)"
          strokeWidth="1.2"
          strokeDasharray="8 4"
        />

        {/* Hexagonal Connection Polygon */}
        <polygon
          points="120,32 198,75 198,165 120,208 42,165 42,75"
          fill="rgba(0, 104, 95, 0.03)"
          stroke="rgba(0, 104, 95, 0.22)"
          strokeWidth="1"
        />
      </svg>

      {/* Central Core */}
      <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-700 via-[#005049] to-slate-900 text-white flex flex-col items-center justify-center shadow-xl shadow-teal-950/40 border border-teal-300/50">
        <span className="text-[10px] font-black tracking-widest uppercase text-teal-200">AURASKIN</span>
        <span className="text-sm font-black tracking-tight text-white flex items-center gap-0.5">
          <Cpu size={14} className="text-teal-300" />
          <span>AI CORE</span>
        </span>
      </div>

      {/* Node 1: Skin (Top) */}
      <div
        className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center group"
        style={{
          transform: `translate(-50%, ${mousePos.y * -10}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-md border border-teal-200 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-all">
          <Sparkles size={16} />
        </div>
        <span className="text-[9px] font-bold text-slate-700 mt-0.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.2 rounded-full border border-slate-200/60 shadow-2xs">
          Skin
        </span>
      </div>

      {/* Node 2: Hydration (Top Right) */}
      <div
        className="absolute top-10 right-2 z-20 flex flex-col items-center group"
        style={{
          transform: `translate(${mousePos.x * 8}px, ${mousePos.y * -8}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-md border border-cyan-200 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition-all">
          <Droplets size={16} />
        </div>
        <span className="text-[9px] font-bold text-slate-700 mt-0.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.2 rounded-full border border-slate-200/60 shadow-2xs">
          Hydration
        </span>
      </div>

      {/* Node 3: Sleep (Bottom Right) */}
      <div
        className="absolute bottom-6 right-3 z-20 flex flex-col items-center group"
        style={{
          transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-md border border-indigo-200 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-all">
          <Moon size={16} />
        </div>
        <span className="text-[9px] font-bold text-slate-700 mt-0.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.2 rounded-full border border-slate-200/60 shadow-2xs">
          Sleep
        </span>
      </div>

      {/* Node 4: UV Exposure (Bottom) */}
      <div
        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center group"
        style={{
          transform: `translate(-50%, ${mousePos.y * 10}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-md border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-all">
          <Sun size={16} />
        </div>
        <span className="text-[9px] font-bold text-slate-700 mt-0.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.2 rounded-full border border-slate-200/60 shadow-2xs">
          UV Sun
        </span>
      </div>

      {/* Node 5: Lifestyle (Bottom Left) */}
      <div
        className="absolute bottom-6 left-3 z-20 flex flex-col items-center group"
        style={{
          transform: `translate(${mousePos.x * -8}px, ${mousePos.y * 8}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-md border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-all">
          <HeartPulse size={16} />
        </div>
        <span className="text-[9px] font-bold text-slate-700 mt-0.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.2 rounded-full border border-slate-200/60 shadow-2xs">
          Lifestyle
        </span>
      </div>

      {/* Node 6: AI Engine (Top Left) */}
      <div
        className="absolute top-10 left-2 z-20 flex flex-col items-center group"
        style={{
          transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-md border border-sky-200 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-all">
          <Cpu size={16} />
        </div>
        <span className="text-[9px] font-bold text-slate-700 mt-0.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.2 rounded-full border border-slate-200/60 shadow-2xs">
          AI Engine
        </span>
      </div>
    </div>
  );
};
