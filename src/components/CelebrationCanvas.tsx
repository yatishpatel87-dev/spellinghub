import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Flame } from 'lucide-react';
import { playFirecrackerPop, playFirecrackerString, startFirecrackerShowAudio } from '../utils/sound';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
  type: 'ribbon' | 'sparkle' | 'circle' | 'star' | 'crackler';
  tilt: number;
  tiltSpeed: number;
  flicker?: boolean;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  type?: 'shell' | 'crackle' | 'fountain';
}

interface CelebrationCanvasProps {
  winnerColorHex?: string;
  durationSeconds?: number;
  soundEnabled?: boolean;
  onShowComplete?: () => void;
}

export const CelebrationCanvas: React.FC<CelebrationCanvasProps> = ({
  winnerColorHex = '#f59e0b',
  durationSeconds = 10,
  soundEnabled = true,
  onShowComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);
  const [isActive10sShow, setIsActive10sShow] = useState(true);

  // Trigger firecracker audio for 10 seconds
  useEffect(() => {
    const stopAudio = startFirecrackerShowAudio(durationSeconds * 1000, soundEnabled);
    return () => {
      stopAudio();
    };
  }, [durationSeconds, soundEnabled]);

  // 10-second countdown timer for active show
  useEffect(() => {
    setSecondsRemaining(durationSeconds);
    setIsActive10sShow(true);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive10sShow(false);
          if (onShowComplete) onShowComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [durationSeconds, onShowComplete]);

  // Main Canvas Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    // Festive celebratory palette
    const palette = [
      winnerColorHex,
      '#f59e0b', // Amber / Gold
      '#fbbf24', // Yellow Gold
      '#f43f5e', // Rose
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#a855f7', // Purple
      '#ffffff', // Sparkle white
      '#ffedd5', // Warm glow
    ];

    const createExplosion = (x: number, y: number, baseColor?: string, isCrackle = false) => {
      const particleCount = isCrackle ? 65 : 45 + Math.floor(Math.random() * 35);
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isCrackle ? 3.5 + Math.random() * 9.5 : 2.5 + Math.random() * 8.5;
        const color = baseColor || palette[Math.floor(Math.random() * palette.length)];
        const types: Particle['type'][] = isCrackle
          ? ['crackler', 'sparkle', 'star']
          : ['ribbon', 'sparkle', 'circle', 'star'];
        const type = types[Math.floor(Math.random() * types.length)];

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: type === 'ribbon' ? 6 + Math.random() * 6 : 3 + Math.random() * 4,
          color,
          alpha: 1,
          decay: isCrackle ? 0.012 + Math.random() * 0.018 : 0.007 + Math.random() * 0.012,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          type,
          tilt: Math.random() * Math.PI,
          tiltSpeed: 0.05 + Math.random() * 0.08,
          flicker: isCrackle || Math.random() > 0.6,
        });
      }
    };

    // Ground fountain (Anar) emitting sparkling shower
    const spawnFountainSparks = (x: number) => {
      for (let i = 0; i < 4; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        const speed = 7 + Math.random() * 8;
        particles.push({
          x,
          y: height - 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.5 + Math.random() * 3,
          color: Math.random() > 0.3 ? '#fbbf24' : '#f59e0b',
          alpha: 1,
          decay: 0.02 + Math.random() * 0.02,
          rotation: 0,
          rotationSpeed: 0,
          type: 'sparkle',
          tilt: 0,
          tiltSpeed: 0,
          flicker: true,
        });
      }
    };

    const launchRocket = (startX?: number, type: 'shell' | 'crackle' | 'fountain' = 'shell') => {
      const x = startX !== undefined ? startX : width * 0.12 + Math.random() * width * 0.76;
      const targetY = height * 0.12 + Math.random() * height * 0.45;
      rockets.push({
        x,
        y: height,
        targetY,
        vy: -(13 + Math.random() * 7),
        color: palette[Math.floor(Math.random() * palette.length)],
        exploded: false,
        type,
      });
    };

    // Initial big blast of celebratory fireworks & cracklers
    createExplosion(width * 0.25, height * 0.35, winnerColorHex, true);
    createExplosion(width * 0.75, height * 0.35, '#fbbf24', true);
    createExplosion(width * 0.5, height * 0.25, '#10b981', false);

    const startTime = Date.now();
    let lastRocketTime = Date.now();
    let lastFountainTime = Date.now();

    // Continuous ambient falling confetti ribbons
    const spawnAmbientConfetti = () => {
      if (particles.length < 240) {
        for (let i = 0; i < 3; i++) {
          particles.push({
            x: Math.random() * width,
            y: -10,
            vx: (Math.random() - 0.5) * 2,
            vy: 2 + Math.random() * 3.5,
            size: 5 + Math.random() * 6,
            color: palette[Math.floor(Math.random() * palette.length)],
            alpha: 1,
            decay: 0.003 + Math.random() * 0.004,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            type: 'ribbon',
            tilt: Math.random() * Math.PI,
            tiltSpeed: 0.04 + Math.random() * 0.06,
          });
        }
      }
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      const elapsedMs = now - startTime;
      const isDuring10s = elapsedMs < durationSeconds * 1000;

      // Launch rockets more frequently during the active 10s show
      const rocketInterval = isDuring10s ? 380 : 950;
      if (now - lastRocketTime > rocketInterval) {
        const type = Math.random() > 0.4 ? 'crackle' : 'shell';
        launchRocket(undefined, type);
        lastRocketTime = now;
      }

      // Ground fountains on bottom left & right during 10s
      if (isDuring10s && now - lastFountainTime > 60) {
        spawnFountainSparks(width * 0.15);
        spawnFountainSparks(width * 0.85);
        lastFountainTime = now;
      }

      spawnAmbientConfetti();

      // 1. Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;

        // Draw rocket glowing head
        ctx.beginPath();
        ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        // Spark trail
        for (let t = 0; t < 2; t++) {
          particles.push({
            x: r.x + (Math.random() - 0.5) * 4,
            y: r.y + Math.random() * 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 1 + Math.random() * 2,
            size: 2,
            color: '#fbbf24',
            alpha: 0.8,
            decay: 0.04,
            rotation: 0,
            rotationSpeed: 0,
            type: 'circle',
            tilt: 0,
            tiltSpeed: 0,
          });
        }

        if (r.y <= r.targetY || r.vy >= 0) {
          createExplosion(r.x, r.y, r.color, r.type === 'crackle');
          rockets.splice(i, 1);
        }
      }

      ctx.shadowBlur = 0;

      // 2. Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14; // Gravity
        p.vx *= 0.985; // Air drag
        p.rotation += p.rotationSpeed;
        p.tilt += p.tiltSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > height + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        const drawAlpha = p.flicker ? Math.max(0, p.alpha * (0.6 + Math.random() * 0.4)) : Math.max(0, p.alpha);
        ctx.globalAlpha = drawAlpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'ribbon') {
          // 3D fluttering ribbon
          const xTilt = Math.sin(p.tilt);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size * xTilt, p.size, p.size * 1.6 * Math.abs(xTilt));
        } else if (p.type === 'star') {
          // 4-point glowing star
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const r = p.size;
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.fill();
        } else if (p.type === 'sparkle' || p.type === 'crackler') {
          // Diamond sparkle / bright crackler spark
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.5, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.5, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Circle spark
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [winnerColorHex, durationSeconds]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-40 pointer-events-none w-full h-full"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Floating 10-Second Firecracker Celebration Status Indicator */}
      {isActive10sShow && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-amber-950/90 border border-amber-500/50 shadow-xl shadow-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-md animate-bounce-subtle">
          <Flame className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
          <span>૧૦ સેકન્ડ ફાયરક્રેકર્સ શો • Firecrackers Active:</span>
          <span className="font-mono text-sm px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-200">
            {secondsRemaining}s
          </span>
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>
      )}
    </>
  );
};
