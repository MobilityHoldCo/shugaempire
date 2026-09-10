'use client';
import { useEffect, useRef } from 'react';
import type * as THREE from 'three';
import styles from './RoadScene.module.css';

export default function RoadScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    let THREE: typeof import('three');

    async function init() {
      THREE = await import('three');

      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 1);

      const updateSize = () => {
        if (!canvas.parentElement) return;
        const W = canvas.parentElement.clientWidth;
        const H = canvas.parentElement.clientHeight;
        renderer.setSize(W, H);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
      };

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.035);

      const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100);
      camera.position.set(0, 1.4, 4.5);
      camera.rotation.x = -0.12;

      updateSize();

      // ── Road Surface Grid ────────────────────────────
      const ROAD_WIDTH = 5.5;
      const ROAD_LENGTH = 80;
      const SEGMENTS = 80;

      // Ground plane grid on sides
      const gridHelper = new THREE.GridHelper(ROAD_LENGTH, SEGMENTS, 0x444444, 0x181818);
      gridHelper.position.y = -0.01;
      gridHelper.position.z = -ROAD_LENGTH / 4;
      scene.add(gridHelper);

      // Road boundary borders (left and right glowing guard rails)
      const railGeo = new THREE.BufferGeometry();
      const leftRailPos: number[] = [];
      const rightRailPos: number[] = [];
      for (let i = 0; i <= SEGMENTS; i++) {
        const z = - (i / SEGMENTS) * ROAD_LENGTH;
        leftRailPos.push(-ROAD_WIDTH / 2, 0.05, z);
        rightRailPos.push(ROAD_WIDTH / 2, 0.05, z);
      }
      const railMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });

      railGeo.setAttribute('position', new THREE.Float32BufferAttribute(leftRailPos, 3));
      const leftRail = new THREE.Line(railGeo, railMat);
      scene.add(leftRail);

      const rightRailGeo = new THREE.BufferGeometry();
      rightRailGeo.setAttribute('position', new THREE.Float32BufferAttribute(rightRailPos, 3));
      const rightRail = new THREE.Line(rightRailGeo, railMat);
      scene.add(rightRail);

      // Center dashed road markings (moving forward)
      const DASH_COUNT = 30;
      const dashes: THREE.Mesh[] = [];
      const dashGeo = new THREE.PlaneGeometry(0.12, 1.6);
      dashGeo.rotateX(-Math.PI / 2);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });

      for (let i = 0; i < DASH_COUNT; i++) {
        const mesh = new THREE.Mesh(dashGeo, dashMat);
        mesh.position.y = 0.02;
        mesh.position.z = - (i / DASH_COUNT) * ROAD_LENGTH;
        scene.add(mesh);
        dashes.push(mesh);
      }

      // ── Side Speed Light Streaks (Hyper-drive feel) ──
      const STREAK_COUNT = 70;
      const streakGeo = new THREE.BufferGeometry();
      const streakPositions = new Float32Array(STREAK_COUNT * 2 * 3);
      const streakSpeeds: number[] = [];
      const streakOffsets: { x: number; y: number; z: number; len: number }[] = [];

      for (let i = 0; i < STREAK_COUNT; i++) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const x = side * (ROAD_WIDTH / 2 + 0.4 + Math.random() * 4);
        const y = 0.1 + Math.random() * 2.8;
        const z = -Math.random() * ROAD_LENGTH;
        const len = 1.2 + Math.random() * 3.5;
        streakOffsets.push({ x, y, z, len });
        streakSpeeds.push(0.4 + Math.random() * 0.7);
      }

      const streakMat = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.5,
      });
      const streakLines = new THREE.LineSegments(streakGeo, streakMat);
      scene.add(streakLines);

      // ── Distant Horizon Glow ────────────────────────
      const horizonGeo = new THREE.RingGeometry(0.1, 4, 32);
      const horizonMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
      });
      const horizon = new THREE.Mesh(horizonGeo, horizonMat);
      horizon.position.set(0, 1, -ROAD_LENGTH * 0.7);
      scene.add(horizon);

      // ── Event Handlers ─────────────────────────────
      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        mouseRef.current.targetX = nx * 0.6;
        mouseRef.current.targetY = ny * 0.2;
      };

      const onResize = () => updateSize();
      window.addEventListener('resize', onResize);
      window.addEventListener('mousemove', onMouseMove);

      // ── Animation Loop ─────────────────────────────
      const SPEED = 0.42;
      let gridOffset = 0;

      const animate = () => {
        animRef.current = requestAnimationFrame(animate);

        // Smooth camera tilt follow mouse
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

        camera.position.x = mouseRef.current.x * 0.8;
        camera.rotation.y = -mouseRef.current.x * 0.15;
        camera.rotation.z = -mouseRef.current.x * 0.06;

        // Move dashes forward
        for (let i = 0; i < DASH_COUNT; i++) {
          const d = dashes[i];
          d.position.z += SPEED;
          if (d.position.z > 5) {
            d.position.z = -ROAD_LENGTH + 5;
          }
        }

        // Scroll ground grid
        gridOffset = (gridOffset + SPEED) % (ROAD_LENGTH / SEGMENTS);
        gridHelper.position.z = -ROAD_LENGTH / 4 + gridOffset;

        // Animate streaks
        let ptr = 0;
        for (let i = 0; i < STREAK_COUNT; i++) {
          const s = streakOffsets[i];
          s.z += SPEED * (1 + streakSpeeds[i]);
          if (s.z > 6) {
            s.z = -ROAD_LENGTH - Math.random() * 10;
          }

          streakPositions[ptr++] = s.x;
          streakPositions[ptr++] = s.y;
          streakPositions[ptr++] = s.z;

          streakPositions[ptr++] = s.x;
          streakPositions[ptr++] = s.y;
          streakPositions[ptr++] = s.z - s.len;
        }
        streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
        streakGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      };

      let isVisible = false;
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animRef.current);
          animate();
        }
      }, { threshold: 0.05 });

      observer.observe(canvas);

      return () => {
        observer.disconnect();
        cancelAnimationFrame(animRef.current);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onMouseMove);
        renderer.dispose();
      };
    }

    const cleanup = init();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, []);

  return (
    <div className={styles.sectionWrap} data-cursor-text="⚡ STEER">
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Cyber Overlay HUD / Title */}
      <div className={styles.hudOverlay}>
        <div className={styles.hudTop}>
          <div className={styles.hudBadge}>
            <span className={styles.pulseDot} />
            <span>AUTONOMOUS CORRIDOR // REAL-TIME TELEMETRY</span>
          </div>
          <span className={styles.hudSpeed}>SYS: ACTIVE // 120 KM/H</span>
        </div>

        <div className={styles.hudCenter}>
          <p className={styles.eyebrow}>INFINITE INFRASTRUCTURE</p>
          <h2 className={styles.hudTitle}>
            DRIVING NIGERIA&apos;S <span className={styles.glowText}>ELECTRIFIED</span> FUTURE
          </h2>
          <p className={styles.hudSubtitle}>
            A continuous connected grid spanning metropolitan Lagos, the federal capital Abuja, and cross-state corridors.
          </p>
        </div>

        <div className={styles.hudBottom}>
          <div className={styles.telemetryItem}>
            <span className={styles.telLabel}>TRANSMISSION</span>
            <span className={styles.telVal}>DIRECT DRIVE</span>
          </div>
          <div className={styles.telemetryItem}>
            <span className={styles.telLabel}>EMISSION</span>
            <span className={styles.telVal}>0.00 G/KM</span>
          </div>
          <div className={styles.telemetryItem}>
            <span className={styles.telLabel}>LATENCY</span>
            <span className={styles.telVal}>&lt; 4.2 MS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
