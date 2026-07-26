import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function BrainVisualizer({ currentScores, memories, onSelectLobe }) {
  const mountRef = useRef(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [screenTags, setScreenTags] = useState([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    // 1. Scene, Camera, Renderer (NeuralMap Deep Space Canvas #06070a)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06070a, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const defaultCamPos = new THREE.Vector3(0, 1.2, 7.5);
    camera.position.copy(defaultCamPos);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x06070a, 1.0);
    container.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0x1a2638, 2.0);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x00f2fe, 1.5);
    mainLight.position.set(10, 15, 10);
    scene.add(mainLight);

    const redLight = new THREE.PointLight(0xff0055, 3.0, 15);
    redLight.position.set(0, 0, 0);
    scene.add(redLight);

    // 3. Scores & Region Configuration
    const scores = currentScores || {
      cognitive_distortion: 8,
      conversational_connection: 8,
      active_listening: 8,
      speech_clarity: 8
    };

    function getHexForScore(score) {
      if (score >= 8) return '#00f2fe'; // Neon Electric Cyan
      if (score >= 6) return '#ffb700'; // Amber Gold
      return '#ff0055'; // Pulsing Cyber Crimson
    }

    const regions = [
      {
        id: 'prefrontal',
        name: 'Prefrontal Cortex',
        tag: 'Speech Economy',
        icon: '🧠',
        score: scores.speech_clarity || 8,
        colorHex: getHexForScore(scores.speech_clarity || 8),
        pos: new THREE.Vector3(0, 0.7, 1.5),
        radius: 0.7,
        desc: 'Controls articulation, fluff-to-substance ratio, and linguistic clarity.'
      },
      {
        id: 'frontal',
        name: 'Frontal Lobe',
        tag: 'CBT Distortions',
        icon: '🛡️',
        score: scores.cognitive_distortion || 8,
        colorHex: getHexForScore(scores.cognitive_distortion || 8),
        pos: new THREE.Vector3(0, 1.1, 0.2),
        radius: 0.85,
        desc: 'Analyzes Aaron Beck cognitive distortions, catastrophizing, and black-and-white reasoning.'
      },
      {
        id: 'limbic',
        name: 'Limbic System / Amygdala',
        tag: 'Gottman Bids',
        icon: '❤️',
        score: scores.conversational_connection || 8,
        colorHex: getHexForScore(scores.conversational_connection || 8),
        pos: new THREE.Vector3(0, -0.2, 0.0),
        radius: 0.65,
        desc: 'Processes Gottman bids for connection, emotional responsiveness, and empathy.'
      },
      {
        id: 'parietal',
        name: 'Parietal Lobe',
        tag: 'Active Listening',
        icon: '👂',
        score: scores.active_listening || 8,
        colorHex: getHexForScore(scores.active_listening || 8),
        pos: new THREE.Vector3(0, 1.0, -1.2),
        radius: 0.75,
        desc: 'Evaluates Carl Rogers active listening, mirroring back blockers, and open-ended questions.'
      },
      {
        id: 'temporal_right',
        name: 'Right Temporal Vault',
        tag: 'Audio Vault',
        icon: '🎙️',
        score: 8.5,
        colorHex: '#0088ff',
        pos: new THREE.Vector3(1.25, -0.3, -0.1),
        radius: 0.65,
        desc: 'Stores raw audio recordings, voice notes, and daily transcript streams.'
      },
      {
        id: 'temporal_left',
        name: 'Left Temporal Vault',
        tag: 'Auditory Memory',
        icon: '💾',
        score: 8.5,
        colorHex: '#0088ff',
        pos: new THREE.Vector3(-1.25, -0.3, -0.1),
        radius: 0.65,
        desc: 'Stores semantic memory context, speech pattern index, and historical logs.'
      }
    ];

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // 4. Ambient Synaptic Particle Dust (Starfield Canvas)
    const particleCount = 250;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 18;
      dustPositions[i + 1] = (Math.random() - 0.5) * 18;
      dustPositions[i + 2] = (Math.random() - 0.5) * 18;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x3d5a80,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // 5. Connectome Fiber Tract Network (~120 Curved Bezier Splines)
    const tractLines = [];
    const tractCurves = [];

    const tractGroup = new THREE.Group();
    brainGroup.add(tractGroup);

    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        // Create 8 curved tract strands between each pair of regions
        const strandCount = 6;
        for (let k = 0; k < strandCount; k++) {
          const start = regions[i].pos;
          const end = regions[j].pos;

          const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
          const offsetAmount = 0.4 + Math.random() * 0.7;
          mid.x += (Math.random() - 0.5) * offsetAmount;
          mid.y += (Math.random() - 0.5) * offsetAmount;
          mid.z += (Math.random() - 0.5) * offsetAmount;

          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          tractCurves.push({ curve, regionA: regions[i].id, regionB: regions[j].id });

          const points = curve.getPoints(25);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

          const defaultColor = new THREE.Color(regions[i].colorHex).lerp(new THREE.Color(regions[j].colorHex), 0.5);

          const lineMat = new THREE.LineBasicMaterial({
            color: defaultColor,
            transparent: true,
            opacity: 0.28,
            blending: THREE.AdditiveBlending
          });

          const line = new THREE.Line(lineGeo, lineMat);
          line.userData = { regionA: regions[i].id, regionB: regions[j].id, defaultColor, lineMat };
          tractGroup.add(line);
          tractLines.push(line);
        }
      }
    }

    // 6. Flowing Signal Photon Particles along Connectome Tracts
    const photonCount = 120;
    const photonGeo = new THREE.BufferGeometry();
    const photonPos = new Float32Array(photonCount * 3);
    const photonColors = new Float32Array(photonCount * 3);
    const photonData = [];

    for (let i = 0; i < photonCount; i++) {
      const curveItem = tractCurves[i % tractCurves.length];
      const progress = Math.random();
      photonData.push({
        curveItem,
        progress,
        speed: 0.004 + Math.random() * 0.008
      });

      const pt = curveItem.curve.getPoint(progress);
      photonPos[i * 3] = pt.x;
      photonPos[i * 3 + 1] = pt.y;
      photonPos[i * 3 + 2] = pt.z;

      photonColors[i * 3] = 0.0;
      photonColors[i * 3 + 1] = 0.95;
      photonColors[i * 3 + 2] = 1.0;
    }

    photonGeo.setAttribute('position', new THREE.BufferAttribute(photonPos, 3));
    photonGeo.setAttribute('color', new THREE.BufferAttribute(photonColors, 3));

    const photonMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    const photonSystem = new THREE.Points(photonGeo, photonMat);
    brainGroup.add(photonSystem);

    // 7. Interactive Region Spheres & Glowing Core Nodes
    const regionMeshes = [];
    regions.forEach(region => {
      const color = new THREE.Color(region.colorHex);

      // Core sphere
      const sphereGeo = new THREE.SphereGeometry(region.radius, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8,
        emissive: color,
        emissiveIntensity: 0.4
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.copy(region.pos);
      mesh.userData = region;
      brainGroup.add(mesh);
      regionMeshes.push(mesh);

      // Synapse halo wireframe
      const haloGeo = new THREE.SphereGeometry(region.radius * 1.2, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.2
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.copy(region.pos);
      brainGroup.add(haloMesh);
    });

    // Outer Translucent Brain Hull Wireframe
    const hullGeo = new THREE.SphereGeometry(2.35, 32, 32);
    const hullMat = new THREE.MeshBasicMaterial({
      color: 0x1a3a5c,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    const hullMesh = new THREE.Mesh(hullGeo, hullMat);
    brainGroup.add(hullMesh);

    // 8. Raycasting & Mouse Interaction Setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    let isMouseDown = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };

    const canvasDom = renderer.domElement;

    const handleMouseDown = (e) => {
      isMouseDown = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      const rect = canvasDom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isMouseDown) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;

        targetRotation.y += deltaX * 0.007;
        targetRotation.x += deltaY * 0.007;

        prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => { isMouseDown = false; };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);
      if (intersects.length > 0) {
        const reg = intersects[0].object.userData;
        setSelectedRegion(reg);
        if (onSelectLobe) onSelectLobe(reg);
      }
    };

    canvasDom.addEventListener('mousedown', handleMouseDown);
    canvasDom.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasDom.addEventListener('click', handleClick);

    // 9. Animation & Render Loop
    let animationId;
    const clock = new THREE.Clock();

    let targetCamPos = defaultCamPos.clone();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Brain rotation physics
      brainGroup.rotation.y += (targetRotation.y - brainGroup.rotation.y) * 0.08;
      brainGroup.rotation.x += (targetRotation.x - brainGroup.rotation.x) * 0.08;

      if (!isMouseDown) {
        brainGroup.rotation.y += 0.0025;
      }

      // Camera lerp when region selected
      if (selectedRegion) {
        const targetOffset = selectedRegion.pos.clone().multiplyScalar(1.2).add(new THREE.Vector3(0, 0.5, 4.5));
        targetCamPos.copy(targetOffset);
      } else {
        targetCamPos.copy(defaultCamPos);
      }
      camera.position.lerp(targetCamPos, 0.04);
      camera.lookAt(0, 0, 0);

      // Animate flowing signal photons
      const posAttr = photonSystem.geometry.attributes.position;
      for (let i = 0; i < photonCount; i++) {
        const pData = photonData[i];
        pData.progress += pData.speed;
        if (pData.progress > 1) pData.progress = 0;

        const pt = pData.curveItem.curve.getPoint(pData.progress);
        posAttr.setXYZ(i, pt.x, pt.y, pt.z);
      }
      posAttr.needsUpdate = true;

      // Animate dust particles slowly floating
      dustParticles.rotation.y = time * 0.02;
      dustParticles.rotation.x = time * 0.01;

      // Hover Raycasting & Pathway Isolation Tracing
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionMeshes);
      const activeReg = intersects.length > 0 ? intersects[0].object.userData : (selectedRegion || null);

      if (intersects.length > 0) {
        setHoveredRegion(intersects[0].object.userData);
        canvasDom.style.cursor = 'pointer';
      } else {
        setHoveredRegion(null);
        canvasDom.style.cursor = 'default';
      }

      // Pathway Tracing: Highlight connected tracts, dim unconnected tracts
      tractLines.forEach(line => {
        const { regionA, regionB, defaultColor, lineMat } = line.userData;
        if (activeReg) {
          if (regionA === activeReg.id || regionB === activeReg.id) {
            lineMat.color.setHex(0x00f2fe);
            lineMat.opacity = 0.85;
          } else {
            lineMat.color.copy(defaultColor);
            lineMat.opacity = 0.06;
          }
        } else {
          lineMat.color.copy(defaultColor);
          lineMat.opacity = 0.28;
        }
      });

      // Update Screen HTML Floating Pin Badges
      const updatedTags = regions.map(reg => {
        const worldPos = reg.pos.clone().applyMatrix4(brainGroup.matrixWorld);
        const proj = worldPos.project(camera);
        const sx = ((proj.x + 1) * width) / 2;
        const sy = ((-proj.y + 1) * height) / 2;
        const isVisible = proj.z < 1;
        return { ...reg, sx, sy, isVisible };
      });
      setScreenTags(updatedTags);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('mousedown', handleMouseDown);
      canvasDom.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasDom.removeEventListener('click', handleClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [currentScores]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '520px',
      background: '#06070a',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid rgba(0, 242, 254, 0.2)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Three.js Neural Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Header Overlay & NeuralMap Controls */}
      <div style={{ position: 'absolute', top: '20px', left: '24px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 10px #00f2fe' }} />
          <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', fontWeight: 800, letterSpacing: '0.5px' }}>NEURAL MAP CONNECTOME</h4>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>3D White-Matter Pathway Tracing & Behavioral State Index</p>
      </div>

      {/* Floating 3D Spatial Tag Pins */}
      {screenTags.map(tag => {
        if (!tag.isVisible) return null;
        const isHovered = hoveredRegion && hoveredRegion.id === tag.id;
        const isSelected = selectedRegion && selectedRegion.id === tag.id;

        return (
          <div
            key={tag.id}
            onClick={() => {
              setSelectedRegion(tag);
              if (onSelectLobe) onSelectLobe(tag);
            }}
            style={{
              position: 'absolute',
              left: `${tag.sx}px`,
              top: `${tag.sy}px`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: isSelected ? 100 : (isHovered ? 90 : 10),
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isSelected
                ? 'rgba(0, 242, 254, 0.25)'
                : (isHovered ? 'rgba(255, 255, 255, 0.18)' : 'rgba(10, 10, 15, 0.75)'),
              backdropFilter: 'blur(8px)',
              border: `1px solid ${tag.colorHex}`,
              boxShadow: `0 0 15px ${tag.colorHex}40`,
              borderRadius: '9999px',
              padding: '4px 12px',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <span>{tag.icon}</span>
            <span>{tag.tag}</span>
            <span style={{ color: tag.colorHex, fontWeight: 800 }}>{tag.score}/10</span>
          </div>
        );
      })}

      {/* Dynamic Region Inspector Overlay (NeuralMap Detail Card) */}
      {(selectedRegion || hoveredRegion) && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          background: 'rgba(10, 12, 18, 0.9)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${(selectedRegion || hoveredRegion).colorHex}`,
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          maxWidth: '380px',
          width: 'calc(100% - 48px)',
          boxShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 20px ${(selectedRegion || hoveredRegion).colorHex}30`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h5 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 700 }}>
              {(selectedRegion || hoveredRegion).icon} {(selectedRegion || hoveredRegion).name}
            </h5>
            {selectedRegion && (
              <button
                onClick={() => setSelectedRegion(null)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                ✕ Close
              </button>
            )}
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4' }}>
            {(selectedRegion || hoveredRegion).desc}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Neural Health Rating</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: (selectedRegion || hoveredRegion).colorHex }}>
              {(selectedRegion || hoveredRegion).score}/10
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
