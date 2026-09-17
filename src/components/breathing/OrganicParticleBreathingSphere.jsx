import React, { useEffect, useRef } from 'react';

/**
 * OrganicParticleBreathingSphere
 * 
 * High-performance, tactile 3D particle sphere guided by 4–7–8 breathing rhythm:
 * - INHALE (4s): Expands outward smoothly with soft cyan/blue illumination (#8FB8C5)
 * - HOLD (7s): Suspended at maximum expansion with muted lavender settling (#B7AFC9)
 * - EXHALE (8s): Contracts inward gently with soft coral/rose tone (#E8A38F)
 * - PREVIEW: Gentle idle breathing loop demonstrating interaction
 * - GENTLE mode: Softer visual expansion amplitude
 */
export default function OrganicParticleBreathingSphere({
  phase = 'rest', // 'rest' | 'inhale' | 'hold' | 'exhale' | 'preview'
  phaseProgress = 0, // 0 to 1 progress within current phase
  guidance = 'standard', // 'standard' | 'gentle'
  isInteractive = false,
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);

  // Initialize 3D particles on a spherical shell with natural organic noise
  useEffect(() => {
    const count = 460;
    const particles = [];
    for (let i = 0; i < count; i++) {
      // Golden spiral distribution on sphere
      const y = 1 - (i / (count - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = i * 2.399963229728653; // Golden angle

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Base radius factor & individual particle jitter
      const radiusFactor = 1 + (Math.random() - 0.5) * 0.16;
      const size = 1.8 + Math.random() * 2.4;
      const speed = 0.003 + Math.random() * 0.004;
      const noiseOffset = Math.random() * Math.PI * 2;

      particles.push({
        origX: x,
        origY: y,
        origZ: z,
        radiusFactor,
        size,
        speed,
        noiseOffset
      });
    }
    particlesRef.current = particles;
  }, []);

  // Animation Loop with precise breathing expansion curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angleY = 0;
    let angleX = 0.2;

    let width = 300;
    let height = 300;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width) || 300;
      const h = Math.round(rect.height) || 300;
      width = w;
      height = h;
      const dpr = window.devicePixelRatio || 2;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const render = () => {
      const dpr = window.devicePixelRatio || 2;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Base radius dynamically scaled to fit within canvas at max expansion (58% expansion)
      // Max radius = baseRadius * 1.58 + jitter (approx 4px) <= width * 0.44
      const responsiveBaseRadius = Math.min(width, height) * 0.26;

      // Expansion factor based on guidance mode
      const maxExpansion = guidance === 'gentle' ? 0.32 : 0.48;

      let scale = 0.88;
      let particleColor = { r: 143, g: 184, b: 197 }; // Default soft blue

      if (phase === 'inhale') {
        const ease = 1 - Math.pow(1 - phaseProgress, 3);
        scale = 0.88 + ease * maxExpansion;
        particleColor = {
          r: 95 + Math.floor(ease * 30),
          g: 160 + Math.floor(ease * 40),
          b: 215 + Math.floor(ease * 20)
        };
      } else if (phase === 'hold') {
        const hover = Math.sin(phaseProgress * Math.PI) * 0.025;
        scale = 0.88 + maxExpansion + hover;
        particleColor = { r: 183, g: 175, b: 201 }; // Muted lavender
      } else if (phase === 'exhale') {
        const ease = phaseProgress < 0.5
          ? 2 * phaseProgress * phaseProgress
          : 1 - Math.pow(-2 * phaseProgress + 2, 2) / 2;
        scale = (0.88 + maxExpansion) - ease * maxExpansion;
        particleColor = {
          r: 232 - Math.floor(ease * 30),
          g: 163 + Math.floor(ease * 20),
          b: 143 + Math.floor(ease * 30)
        }; // Soft coral
      } else {
        // Preview idle breathing loop (slow, subtle preview)
        const time = Date.now() * 0.0014;
        const previewPulse = Math.sin(time) * 0.08;
        scale = 0.90 + previewPulse;
        particleColor = {
          r: 130 + Math.floor(previewPulse * 40),
          g: 175 + Math.floor(previewPulse * 20),
          b: 205 + Math.floor(previewPulse * 20)
        };
      }

      angleY += 0.0035;
      const particles = particlesRef.current;

      // Sort particles by depth for correct 3D overlap
      const projected = [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const r = responsiveBaseRadius * (p.radiusFactor || 1) * scale;

        // Apply noise
        const time = Date.now() * 0.001;
        const jitter = Math.sin(time + p.noiseOffset) * 3.2;
        const finalR = r + jitter;

        let px = p.origX * finalR;
        let py = p.origY * finalR;
        let pz = p.origZ * finalR;

        // Rotate around Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;

        // Rotate around X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        // Perspective projection
        const fov = 340;
        const depth = fov / (fov + z2);
        const screenX = centerX + x1 * depth;
        const screenY = centerY + y2 * depth;
        const alpha = Math.max(0.18, Math.min(0.95, (z2 + 150) / 300));

        projected.push({
          x: screenX,
          y: screenY,
          size: p.size * depth * (scale > 1.2 ? 1.15 : 1),
          alpha,
          z: z2
        });
      }

      // Sort back-to-front
      projected.sort((a, b) => a.z - b.z);

      // Draw all particles with soft organic halo
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, ${p.alpha})`;
        ctx.fill();
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, phaseProgress, guidance]);

  return (
    <div className="breathing-canvas-container">
      <canvas ref={canvasRef} className="breathing-canvas" />
    </div>
  );
}
