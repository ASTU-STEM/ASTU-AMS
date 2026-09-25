import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeAiVoiceVisualizerProps {
  isSpeaking: boolean;
  isListening: boolean;
  onClick?: () => void;
}

export default function ThreeAiVoiceVisualizer({
  isSpeaking,
  isListening,
  onClick,
}: ThreeAiVoiceVisualizerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00e5ff, 3, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe8a020, 3, 50);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    // 3. 3D Fluid Particle Sphere (Icosahedron / Sphere Geometry)
    const sphereRadius = 1.8;
    const particleGeometry = new THREE.IcosahedronGeometry(sphereRadius, 30);
    
    // Save original position vector array for wave deformation
    const originalPositions = new Float32Array(particleGeometry.attributes.position.array);

    // Create glowing point material
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particleSphere = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSphere);

    // 4. Inner Glowing Wireframe Core
    const coreGeometry = new THREE.IcosahedronGeometry(sphereRadius * 0.75, 12);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x003366,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // 5. Tilted Orbital Halo Ring 1
    const ringGeometry1 = new THREE.TorusGeometry(2.5, 0.015, 16, 100);
    const ringMaterial1 = new THREE.MeshBasicMaterial({
      color: 0xe8a020,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    scene.add(ring1);

    // 6. Tilted Orbital Halo Ring 2 (Counter Rotation)
    const ringGeometry2 = new THREE.TorusGeometry(2.9, 0.012, 16, 100);
    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x008c44,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    scene.add(ring2);

    // 7. Animation Loop with Dynamic 3D Wave Undulation
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const positions = particleGeometry.attributes.position.array as Float32Array;

      // Update particle material color & intensity based on voice state
      if (isSpeaking) {
        particleMaterial.color.setHex(0x00e5ff); // Electric Cyan/Blue
        pointLight1.color.setHex(0x00e5ff);
        pointLight2.color.setHex(0xe8a020);
        particleMaterial.size = 0.055;
      } else if (isListening) {
        particleMaterial.color.setHex(0x10b981); // Emerald Teal
        pointLight1.color.setHex(0x10b981);
        pointLight2.color.setHex(0x3b82f6);
        particleMaterial.size = 0.06;
      } else {
        particleMaterial.color.setHex(0x3b82f6); // Deep Cobalt
        pointLight1.color.setHex(0x003366);
        pointLight2.color.setHex(0xe8a020);
        particleMaterial.size = 0.04;
      }

      // Rotate 3D meshes
      const rotSpeed = isSpeaking ? 0.025 : isListening ? 0.015 : 0.008;
      particleSphere.rotation.y += rotSpeed;
      particleSphere.rotation.x += rotSpeed * 0.5;
      coreMesh.rotation.y -= rotSpeed * 0.8;
      ring1.rotation.z += rotSpeed * 1.2;
      ring2.rotation.z -= rotSpeed * 1.5;

      // Sinusoidal 3D Vertex Wave Deformation (Pulse when speaking/listening)
      const waveFrequency = isSpeaking ? 4.0 : isListening ? 2.5 : 1.5;
      const waveAmplitude = isSpeaking ? 0.25 : isListening ? 0.18 : 0.06;

      for (let i = 0; i < positions.length; i += 3) {
        const vx = originalPositions[i];
        const vy = originalPositions[i + 1];
        const vz = originalPositions[i + 2];

        // Compute 3D distance & displacement offset
        const dist = Math.sqrt(vx * vx + vy * vy + vz * vz);
        const offset = Math.sin(dist * waveFrequency + elapsedTime * (isSpeaking ? 6 : 3)) * waveAmplitude;

        const normalX = vx / dist;
        const normalY = vy / dist;
        const normalZ = vz / dist;

        positions[i] = vx + normalX * offset;
        positions[i + 1] = vy + normalY * offset;
        positions[i + 2] = vz + normalZ * offset;
      }

      particleGeometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      particleGeometry.dispose();
      particleMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      ringGeometry1.dispose();
      ringMaterial1.dispose();
      ringGeometry2.dispose();
      ringMaterial2.dispose();
      renderer.dispose();
    };
  }, [isSpeaking, isListening]);

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      title="Click to speak with ASTU AI"
    >
      {/* Three.js 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-72 h-72 md:w-80 md:h-80 relative z-10" />

      {/* Radial Background Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 -z-10 ${
          isSpeaking
            ? 'bg-gradient-to-tr from-cyan-500/40 via-blue-600/40 to-amber-500/40 scale-125 opacity-100'
            : isListening
            ? 'bg-gradient-to-tr from-emerald-500/40 via-teal-500/40 to-blue-600/40 scale-110 opacity-90'
            : 'bg-gradient-to-tr from-[#003366]/30 via-blue-600/20 to-[#E8A020]/30 scale-100 opacity-60'
        }`}
      />
    </div>
  );
}
