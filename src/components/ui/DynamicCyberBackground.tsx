'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  color: string;
  pulsePhase: number;
  pulseSpeed: number;
}

interface Packet {
  sourceIndex: number;
  targetIndex: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

const CYBER_PALETTE = [
  '#06b6d4', // Cyan
  '#3b82f6', // Electric Blue
  '#6366f1', // Indigo
  '#0284c7', // Sky Blue
  '#8b5cf6', // Violet
];

export function DynamicCyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [fpsBudget, setFpsBudget] = useState<number>(60);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive particle count
    const getParticleCount = (w: number) => {
      if (w < 640) return 24; // Mobile: super lightweight
      if (w < 1024) return 42; // Tablet
      return 68; // Desktop: rich cyber mesh
    };

    let particleCount = getParticleCount(width);
    const connectionDistance = width < 640 ? 90 : 130;
    const mouseRadius = width < 640 ? 110 : 160;

    // Mouse coordinates
    const mouse = {
      x: -9999,
      y: -9999,
      isActive: false,
    };

    // Particles array
    const particles: Particle[] = [];
    // Data packets travelling between nodes
    const packets: Packet[] = [];

    const initParticles = () => {
      particles.length = 0;
      particleCount = getParticleCount(width);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2 + 1.2,
          baseAlpha: Math.random() * 0.45 + 0.35,
          color: CYBER_PALETTE[Math.floor(Math.random() * CYBER_PALETTE.length)],
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        });
      }
    };

    const spawnPacket = (srcIdx: number, tgtIdx: number) => {
      if (packets.length > 8) return; // Limit concurrent packets
      packets.push({
        sourceIndex: srcIdx,
        targetIndex: tgtIdx,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        color: Math.random() > 0.5 ? '#38bdf8' : '#22d3ee',
      });
    };

    // Handle Resize with high DPI scaling
    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      initParticles();
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;
    };

    const handleMouseLeave = () => {
      mouse.isActive = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.isActive = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.isActive = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Periodic packet dispatcher (every ~1.2s)
    let packetTimer = 0;

    // Render loop
    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Boundary bounce with padding
          if (p.x <= 0 || p.x >= width) p.vx = -p.vx;
          if (p.y <= 0 || p.y >= height) p.vy = -p.vy;

          // Gentle mouse interaction (magnetic deflection / pull)
          if (mouse.isActive) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouseRadius && dist > 1) {
              const force = (1 - dist / mouseRadius) * 0.8;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          p.pulsePhase += p.pulseSpeed;
        }

        // Pulse radius & opacity
        const pulse = Math.sin(p.pulsePhase);
        const currentRadius = p.radius + pulse * 0.4;
        const currentAlpha = Math.max(0.1, Math.min(1, p.baseAlpha + pulse * 0.15));

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Draw dynamic connecting cyber lines
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.32;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#38bdf8';
            ctx.globalAlpha = alpha;
            ctx.stroke();

            // Chance to spawn packet between connected nodes
            if (!prefersReducedMotion && packetTimer > 70 && Math.random() < 0.003) {
              spawnPacket(i, j);
            }
          }
        }

        // Draw interactive connection line to mouse
        if (mouse.isActive) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouseRadius) {
            const mAlpha = (1 - mdist / mouseRadius) * 0.55;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = '#06b6d4';
            ctx.globalAlpha = mAlpha;
            ctx.lineWidth = 0.9;
            ctx.stroke();
            ctx.lineWidth = 0.6;
          }
        }
      }

      // 3. Draw active data packets traversing connections
      if (!prefersReducedMotion) {
        packetTimer++;
        if (packetTimer > 80) packetTimer = 0;

        for (let k = packets.length - 1; k >= 0; k--) {
          const pkt = packets[k];
          pkt.progress += pkt.speed;

          if (pkt.progress >= 1) {
            packets.splice(k, 1);
            continue;
          }

          const s = particles[pkt.sourceIndex];
          const t = particles[pkt.targetIndex];
          if (!s || !t) {
            packets.splice(k, 1);
            continue;
          }

          const curX = s.x + (t.x - s.x) * pkt.progress;
          const curY = s.y + (t.y - s.y) * pkt.progress;

          ctx.beginPath();
          ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = pkt.color;
          ctx.globalAlpha = 0.85;
          ctx.shadowBlur = 6;
          ctx.shadowColor = pkt.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isClient]);

  if (!isClient) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Dynamic Cyber Aurora Orbs (Atmospheric Depth) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse duration-[8000ms]" />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-3xl animate-pulse duration-[10000ms]" />
      <div className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] rounded-full bg-indigo-500/8 blur-3xl animate-pulse duration-[12000ms]" />

      {/* Cyber Network Mesh Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full opacity-65 dark:opacity-80 transition-opacity duration-700"
      />

      {/* Cyber Grid Scanlines Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0284c7 1px, transparent 1px),
            linear-gradient(to bottom, #0284c7 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
