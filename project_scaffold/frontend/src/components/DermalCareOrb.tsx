import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Stethoscope, HeartPulse } from 'lucide-react';

export const DermalCareOrb: React.FC = () => {
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
      className="orb-container relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center select-none cursor-pointer"
      style={{
        transform: reducedMotion
          ? 'none'
          : `perspective(600px) rotateY(${mousePos.x * 20}deg) rotateX(${-mousePos.y * 20}deg)`,
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      title="AuraSkin Connected Dermal Care Pipeline"
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-teal-500/20 via-sky-400/15 to-emerald-400/20 blur-xl pointer-events-none" />

      {/* SVG Rotating Rings and Orbit Paths */}
      <svg className="w-full h-full absolute inset-0 transform -rotate-45" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="orbTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00685f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="orbitStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Orbit Ring 1 */}
        <circle
          cx="100"
          cy="100"
          r="72"
          fill="none"
          stroke="url(#orbitStroke)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Orbit Ring 2 */}
        <ellipse
          cx="100"
          cy="100"
          rx="82"
          ry="38"
          fill="none"
          stroke="url(#orbitStroke)"
          strokeWidth="1.2"
          strokeDasharray="6 3"
        />

        {/* Connector Triangulation */}
        <polygon
          points="100,32 165,138 35,138"
          fill="rgba(0, 104, 95, 0.04)"
          stroke="rgba(0, 104, 95, 0.25)"
          strokeWidth="1"
        />
      </svg>

      {/* Central Core Pulse */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-[#005049] text-white flex flex-col items-center justify-center shadow-lg shadow-teal-900/30 border border-teal-300/40">
        <span className="text-[9px] font-black tracking-wider uppercase text-teal-200">Aura</span>
        <span className="text-xs font-black tracking-tight text-white">HUB</span>
      </div>

      {/* Node 1: AI Assessment (Top) */}
      <div
        className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center group"
        style={{
          transform: `translate(-50%, ${mousePos.y * -8}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-teal-200/90 text-teal-700 flex items-center justify-center group-hover:scale-110 group-hover:border-teal-500 transition-all duration-200">
          <Cpu size={18} />
        </div>
        <span className="text-[10px] font-bold text-slate-700 mt-1 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-full shadow-2xs border border-slate-200/60">
          AI Analysis
        </span>
      </div>

      {/* Node 2: Specialist (Bottom Right) */}
      <div
        className="absolute bottom-4 right-3 z-20 flex flex-col items-center group"
        style={{
          transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 6}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-sky-200/90 text-sky-700 flex items-center justify-center group-hover:scale-110 group-hover:border-sky-500 transition-all duration-200">
          <Stethoscope size={18} />
        </div>
        <span className="text-[10px] font-bold text-slate-700 mt-1 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-full shadow-2xs border border-slate-200/60">
          Specialist
        </span>
      </div>

      {/* Node 3: Clinical Care (Bottom Left) */}
      <div
        className="absolute bottom-4 left-3 z-20 flex flex-col items-center group"
        style={{
          transform: `translate(${mousePos.x * -8}px, ${mousePos.y * 6}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-emerald-200/90 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:border-emerald-500 transition-all duration-200">
          <HeartPulse size={18} />
        </div>
        <span className="text-[10px] font-bold text-slate-700 mt-1 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-full shadow-2xs border border-slate-200/60">
          Care Plan
        </span>
      </div>
    </div>
  );
};
