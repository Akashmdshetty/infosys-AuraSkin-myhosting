import React, { useRef, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────
   Config – all tuneable at the call-site via props
   ───────────────────────────────────────────────────────── */
export interface NetworkConfig {
  /** Max particles at ≥1280 px width */
  particleCountDesktop?: number;
  /** Max particles between 768–1279 px */
  particleCountTablet?: number;
  /** Max particles below 768 px */
  particleCountMobile?: number;
  /** Distance (px) within which two particles connect */
  connectionDistance?: number;
  /** Max connections drawn per particle (keeps the web sparse) */
  maxConnectionsPerParticle?: number;
  /** Base speed multiplier (pixels / frame) */
  particleSpeed?: number;
  /** Mouse influence radius (px) */
  interactionRadius?: number;
  /** Global opacity multiplier for the whole canvas */
  opacity?: number;
  /** Chance (0-1) per frame that a signal is spawned */
  signalSpawnChance?: number;
}

/* ─────────────────────────────────────────────────────────
   Default config
   ───────────────────────────────────────────────────────── */
const DEFAULTS: Required<NetworkConfig> = {
  particleCountDesktop: 65,
  particleCountTablet: 40,
  particleCountMobile: 22,
  connectionDistance: 220,
  maxConnectionsPerParticle: 8,
  particleSpeed: 0.25,
  interactionRadius: 200,
  opacity: 1,
  signalSpawnChance: 0.002,
};

/* ─────────────────────────────────────────────────────────
   Palette (matching AuraSkin teal / cyan / aqua)
   ───────────────────────────────────────────────────────── */
const PALETTE = [
  { r: 13, g: 148, b: 136 },   // teal  --color-primary
  { r: 2, g: 132, b: 199 },    // sky   --color-accent
  { r: 20, g: 184, b: 166 },   // light teal
  { r: 56, g: 189, b: 248 },   // light sky
  { r: 110, g: 231, b: 183 },  // mint
  { r: 94, g: 234, b: 212 },   // aqua
];

/* ─────────────────────────────────────────────────────────
   Internal types
   ───────────────────────────────────────────────────────── */
interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  color: typeof PALETTE[number];
  opacity: number;
  pulseOffset: number;
  pulseSpeed: number;
}

interface Signal {
  fromIdx: number;
  toIdx: number;
  progress: number; // 0 → 1
  speed: number;
  color: typeof PALETTE[number];
}

/* ─────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────── */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const dist = (ax: number, ay: number, bx: number, by: number) =>
  Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function getParticleCount(
  w: number,
  desktop: number,
  tablet: number,
  mobile: number,
) {
  if (w >= 1280) return desktop;
  if (w >= 768) return tablet;
  return mobile;
}

/* ─────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────── */
export const SkinIntelligenceNetwork: React.FC<NetworkConfig> = (props) => {
  const cfg = { ...DEFAULTS, ...props };
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const signalsRef = useRef<Signal[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const sizeRef = useRef({ w: 0, h: 0 });
  const prefersReducedMotion = useRef(false);

  /* ── create particles for current size ── */
  const createParticles = useCallback(
    (w: number, h: number): Particle[] => {
      const count = getParticleCount(
        w,
        cfg.particleCountDesktop,
        cfg.particleCountTablet,
        cfg.particleCountMobile,
      );
      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * cfg.particleSpeed * 2,
          vy: (Math.random() - 0.5) * cfg.particleSpeed * 2,
          radius: 2.5 + Math.random() * 3,
          color: pick(PALETTE),
          opacity: 0.55 + Math.random() * 0.35,
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 0.005 + Math.random() * 0.01,
        });
      }
      return particles;
    },
    [cfg.particleCountDesktop, cfg.particleCountTablet, cfg.particleCountMobile, cfg.particleSpeed],
  );

  /* ── main effect ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    /* reduced-motion */
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mql.matches;
    const handleMotionPref = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mql.addEventListener('change', handleMotionPref);

    /* sizing */
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
      particlesRef.current = createParticles(w, h);
      signalsRef.current = [];
    };
    resize();

    window.addEventListener('resize', resize);

    /* mouse tracking (page-level coordinates) */
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.pageX, y: e.pageY, active: true };
    };
    const onLeave = () => {
      mouseRef.current = { ...mouseRef.current, active: false };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    /* ── animation loop ── */
    let tick = 0;
    const animate = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = cfg.opacity;

      const particles = particlesRef.current;
      const signals = signalsRef.current;
      const reduced = prefersReducedMotion.current;
      const isMobile = w < 768;
      const connDist = cfg.connectionDistance;
      const connDistSq = connDist * connDist;
      const interRadius = cfg.interactionRadius;
      const mouse = mouseRef.current;
      tick++;

      /* --- update particles --- */
      if (!reduced) {
        /* inter-particle repulsion – prevents merging */
        const repelDist = 30;
        const repelDistSq = repelDist * repelDist;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dSq = dx * dx + dy * dy;
            if (dSq < repelDistSq && dSq > 0.1) {
              const d = Math.sqrt(dSq);
              const push = (1 - d / repelDist) * 0.3;
              const nx = dx / d;
              const ny = dy / d;
              a.vx += nx * push;
              a.vy += ny * push;
              b.vx -= nx * push;
              b.vy -= ny * push;
            }
          }
        }

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          let isCaptured = false;

          if (!isMobile && mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < interRadius) {
              if (d < 25) {
                /* very close – settle near cursor with slight offset so they don't stack */
                const angle = (i / particles.length) * Math.PI * 2;
                const offsetX = Math.cos(angle) * 14;
                const offsetY = Math.sin(angle) * 14;
                p.x = lerp(p.x, mouse.x + offsetX, 0.06);
                p.y = lerp(p.y, mouse.y + offsetY, 0.06);
                p.vx *= 0.8;
                p.vy *= 0.8;
                isCaptured = true;
              } else {
                /* mid-range – gentle attraction */
                const strength = (1 - d / interRadius);
                const force = strength * 0.15;
                p.vx += (dx / d) * force;
                p.vy += (dy / d) * force;
                p.vx *= 0.92;
                p.vy *= 0.92;
              }
            }
          }

          if (!isCaptured) {
            /* Ambient organic movement: maintain slow, calm, continuous floating motion */
            /* Very subtle random steering noise */
            p.vx += (Math.random() - 0.5) * 0.008;
            p.vy += (Math.random() - 0.5) * 0.008;

            const speed = Math.hypot(p.vx, p.vy);
            const targetSpeed = 0.10 + (i % 5) * 0.03; // slow float speeds between 0.10 and 0.22 px/frame

            if (speed < 0.05) {
              const angle = Math.random() * Math.PI * 2;
              p.vx = Math.cos(angle) * targetSpeed;
              p.vy = Math.sin(angle) * targetSpeed;
            } else if (speed > 0.5) {
              p.vx = (p.vx / speed) * 0.5;
              p.vy = (p.vy / speed) * 0.5;
            } else {
              /* Smoothly normalize towards slow target floating speed */
              const factor = lerp(1, targetSpeed / speed, 0.03);
              p.vx *= factor;
              p.vy *= factor;
            }
          }

          /* free-floating drift */
          p.x += p.vx;
          p.y += p.vy;

          /* wrap around edges */
          if (p.x < -20) { p.x = w + 20; }
          if (p.x > w + 20) { p.x = -20; }
          if (p.y < -20) { p.y = h + 20; }
          if (p.y > h + 20) { p.y = -20; }
        }
      }

      /* --- draw connections --- */
      const connectionCounts = new Uint8Array(particles.length);

      for (let i = 0; i < particles.length; i++) {
        if (connectionCounts[i] >= cfg.maxConnectionsPerParticle) continue;
        const a = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          if (connectionCounts[j] >= cfg.maxConnectionsPerParticle) continue;
          const b = particles[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;

          if (dSq < connDistSq) {
            const d = Math.sqrt(dSq);
            const alpha = (1 - d / connDist) * 0.18;
            const c = a.color;
            ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            connectionCounts[i]++;
            connectionCounts[j]++;
          }
        }
      }

      /* --- cursor connection lines --- */
      if (!isMobile && mouse.active && !reduced) {
        const nearbyIdx: number[] = [];
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const d = dist(mouse.x, mouse.y, p.x, p.y);
          if (d < interRadius) nearbyIdx.push(i);
        }
        nearbyIdx.sort(
          (a, b) =>
            dist(mouse.x, mouse.y, particles[a].x, particles[a].y) -
            dist(mouse.x, mouse.y, particles[b].x, particles[b].y),
        );
        const toConnect = nearbyIdx.slice(0, 5);
        for (const idx of toConnect) {
          const p = particles[idx];
          const d = dist(mouse.x, mouse.y, p.x, p.y);
          const alpha = (1 - d / interRadius) * 0.18;
          const c = p.color;
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      /* --- draw particles --- */
      for (const p of particles) {
        const pulse = reduced
          ? 0
          : Math.sin(tick * p.pulseSpeed + p.pulseOffset) * 0.1;
        const alpha = Math.min(1, p.opacity + pulse);

        /* glow boost near cursor */
        let glowExtra = 0;
        if (!isMobile && mouse.active && !reduced) {
          const d = dist(mouse.x, mouse.y, p.x, p.y);
          if (d < interRadius) {
            glowExtra = (1 - d / interRadius) * 0.35;
          }
        }

        const finalAlpha = Math.min(1, alpha + glowExtra);
        const c = p.color;

        /* soft glow halo */
        if (p.radius > 1.5 || glowExtra > 0.1) {
          const glowRadius = p.radius * (3 + glowExtra * 3);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
          grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${finalAlpha * 0.22})`);
          grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        /* core dot */
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${finalAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      /* --- travelling signals --- */
      if (!reduced) {
        /* spawn */
        if (Math.random() < cfg.signalSpawnChance && particles.length > 1) {
          const fromIdx = Math.floor(Math.random() * particles.length);
          /* find a nearby partner */
          for (let j = 0; j < particles.length; j++) {
            if (j === fromIdx) continue;
            const d = dist(
              particles[fromIdx].x,
              particles[fromIdx].y,
              particles[j].x,
              particles[j].y,
            );
            if (d < connDist) {
              signals.push({
                fromIdx,
                toIdx: j,
                progress: 0,
                speed: 0.008 + Math.random() * 0.01,
                color: pick(PALETTE),
              });
              break;
            }
          }
        }

        /* draw + advance */
        for (let s = signals.length - 1; s >= 0; s--) {
          const sig = signals[s];
          sig.progress += sig.speed;
          if (sig.progress >= 1) {
            signals.splice(s, 1);
            continue;
          }
          const a = particles[sig.fromIdx];
          const b = particles[sig.toIdx];
          const sx = lerp(a.x, b.x, sig.progress);
          const sy = lerp(a.y, b.y, sig.progress);
          const sa = (1 - Math.abs(sig.progress - 0.5) * 2) * 0.6;
          const c = sig.color;
          ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${sa})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    /* cleanup */
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      mql.removeEventListener('change', handleMotionPref);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="skin-intelligence-canvas"
    />
  );
};
