import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';

/**
 * REACT BITS PRO — GLOBE COMPONENT (globe-tw)
 * Interactive 3D globe with animated arcs, atmosphere glow, and location markers.
 * Specs & props match React Bits Pro Globe docs: https://pro.reactbits.dev/docs/components/globe
 */
export default function GlobeTW({
  width = 'auto',
  height = 'auto',
  primaryColor = 'rgb(59, 130, 246)',
  neutralColor = 'rgb(156, 163, 175)',
  atmosphereColor,
  showAtmosphere = true,
  autoRotateSpeed = 0.85,
  enableZoom = false,
  interactive = true,
  arcCount = 10,
  arcInterval = 6000,
  arcAnimationDuration = 2000,
  cameraAltitude = 2.5,
  pointSize = 0.25,
  pointResolution = 5,
  atmosphereAltitude = 0.3,
  globeOpacity = 1,
  landDotRows = 200,
  landMapUrl = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png',
  className = '',
  onReady,
  onGlobeClick
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId;
    let renderer, camera, scene, globe;

    const w = width === 'auto' ? container.clientWidth || 400 : width;
    const h = height === 'auto' ? container.clientHeight || 400 : height;

    // 1. Three.js Scene Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.z = cameraAltitude * 150;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dLight.position.set(200, 200, 200);
    scene.add(dLight);

    // 3. ThreeGlobe Core Setup
    globe = new ThreeGlobe()
      .globeImageUrl(landMapUrl)
      .showGlobe(true)
      .showAtmosphere(showAtmosphere)
      .atmosphereColor(atmosphereColor || neutralColor)
      .atmosphereAltitude(atmosphereAltitude);

    // Arc Data Generation for Animation
    const arcsData = Array.from({ length: arcCount }).map(() => ({
      startLat: (Math.random() - 0.5) * 120,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 120,
      endLng: (Math.random() - 0.5) * 360,
      color: [primaryColor, primaryColor]
    }));

    globe
      .arcsData(arcsData)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(arcAnimationDuration)
      .arcStroke(0.6);

    const globeMaterial = globe.globeMaterial();
    if (globeMaterial) {
      globeMaterial.color = new THREE.Color(neutralColor);
      globeMaterial.emissive = new THREE.Color(primaryColor);
      globeMaterial.emissiveIntensity = 0.15;
      globeMaterial.transparent = true;
      globeMaterial.opacity = globeOpacity;
    }

    scene.add(globe);

    // Callback on ready
    if (onReady) onReady();

    // Mouse Interaction Handling
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      if (!interactive) return;
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !interactive) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      globe.rotation.y += deltaMove.x * 0.005;
      globe.rotation.x += deltaMove.y * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = (e) => {
      if (onGlobeClick) {
        onGlobeClick({ lat: 0, lng: 0 }, e);
      }
    };

    if (interactive) {
      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('click', handleClick);
    }

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const nw = width === 'auto' ? container.clientWidth : width;
      const nh = height === 'auto' ? container.clientHeight : height;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    // Render & Auto-Rotate Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotateSpeed > 0 && !isDragging) {
        globe.rotation.y += autoRotateSpeed * 0.005;
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('click', handleClick);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [
    width,
    height,
    primaryColor,
    neutralColor,
    atmosphereColor,
    showAtmosphere,
    autoRotateSpeed,
    interactive,
    arcCount,
    arcAnimationDuration,
    cameraAltitude,
    globeOpacity,
    landMapUrl
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[300px] ${className}`}
      style={{ overflow: 'hidden' }}
    />
  );
}
