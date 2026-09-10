'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import styles from './EnergyHubScene3D.module.css';

interface BayTelemetry {
  bayNumber: string;
  status: 'CHARGING' | 'AVAILABLE';
  vehicle: string;
  soc: number;
  kwPower: string;
  voltage: string;
  timeLeft: string;
  kwhDelivered: string;
  source: string;
}

const BAYS_DATA: BayTelemetry[] = [
  {
    bayNumber: 'BAY 01',
    status: 'CHARGING',
    vehicle: 'Shuga EV Crossover #108 (Adebayo O.)',
    soc: 84,
    kwPower: '120 kW DC Fast Charge',
    voltage: '420 V // 285 A',
    timeLeft: '6 mins to 90%',
    kwhDelivered: '38.2 kWh',
    source: '100% Direct Rooftop Solar PV',
  },
  {
    bayNumber: 'BAY 02',
    status: 'CHARGING',
    vehicle: 'Shuga EV Crossover #242 (Chinedu E.)',
    soc: 62,
    kwPower: '90 kW Ultra Charge',
    voltage: '395 V // 228 A',
    timeLeft: '14 mins to 80%',
    kwhDelivered: '24.6 kWh',
    source: 'Hybrid Solar + BESS Storage',
  },
  {
    bayNumber: 'BAY 03',
    status: 'AVAILABLE',
    vehicle: 'Open for Shuga Fleet / Public EV',
    soc: 100,
    kwPower: '150 kW Max Ready',
    voltage: 'Standby 400V Ready',
    timeLeft: 'Ready for Plug-in',
    kwhDelivered: '0.0 kWh',
    source: 'Microgrid Inverter Ready',
  },
  {
    bayNumber: 'BAY 04',
    status: 'CHARGING',
    vehicle: 'Shuga EV Crossover #319 (Fatima B.)',
    soc: 91,
    kwPower: '50 kW Balancing Charge',
    voltage: '410 V // 122 A',
    timeLeft: '3 mins to 100%',
    kwhDelivered: '44.8 kWh',
    source: '100% Direct Rooftop Solar PV',
  },
  {
    bayNumber: 'BAY 05',
    status: 'CHARGING',
    vehicle: 'Commercial Delivery EV #089',
    soc: 45,
    kwPower: '120 kW DC Fast Charge',
    voltage: '390 V // 308 A',
    timeLeft: '18 mins to 80%',
    kwhDelivered: '19.4 kWh',
    source: 'Hybrid Solar + BESS Storage',
  },
  {
    bayNumber: 'BAY 06',
    status: 'AVAILABLE',
    vehicle: 'Open for Shuga Fleet / Public EV',
    soc: 100,
    kwPower: '150 kW Max Ready',
    voltage: 'Standby 400V Ready',
    timeLeft: 'Ready for Plug-in',
    kwhDelivered: '0.0 kWh',
    source: 'Microgrid Inverter Ready',
  },
];

export default function EnergyHubScene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDayMode, setIsDayMode] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedBay, setSelectedBay] = useState<BayTelemetry | null>(BAYS_DATA[0]);

  // Orbit camera state
  const cameraAngleRef = useRef({ theta: Math.PI / 4.2, phi: Math.PI / 3.4, radius: 46 });
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const isDayModeRef = useRef(true);

  useEffect(() => {
    isDayModeRef.current = isDayMode;
  }, [isDayMode]);

  useEffect(() => {
    let animId = 0;
    let isDisposed = false;

    function init() {
      if (isDisposed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x020408, 1);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020408, 0.018);

      const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 250);

      const updateSize = () => {
        if (!containerRef.current || isDisposed) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight || 740;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      updateSize();
      window.addEventListener('resize', updateSize);

      // ── Lighting Rig ──
      const ambientLight = new THREE.AmbientLight(0x0a1626, 2.0);
      scene.add(ambientLight);

      // Sun light (Golden in day, Moonlit cyan at night)
      const sunLight = new THREE.DirectionalLight(0xfff3d6, 2.8);
      sunLight.position.set(30, 45, 25);
      scene.add(sunLight);

      // Cyan fill light
      const stationGlowLight = new THREE.PointLight(0x00e5ff, 2.5, 60);
      stationGlowLight.position.set(0, 12, 0);
      scene.add(stationGlowLight);

      // ── Ground Platform (Dark Asphalt with Bay Lines) ──
      const groundGeo = new THREE.PlaneGeometry(60, 40);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x070b12,
        roughness: 0.7,
        metalness: 0.2,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      scene.add(ground);

      // Grid helper on pavement
      const groundGrid = new THREE.GridHelper(60, 30, 0x00e5ff, 0x0c1626);
      groundGrid.position.y = 0.02;
      scene.add(groundGrid);

      // ── Station Structure Root Group ──
      const hubGroup = new THREE.Group();
      scene.add(hubGroup);

      // ── Solar Canopy Structure ──
      // Cantilevered Steel Columns
      const columnGeo = new THREE.BoxGeometry(0.6, 7, 0.6);
      const steelMat = new THREE.MeshStandardMaterial({
        color: 0x1a2232,
        metalness: 0.85,
        roughness: 0.25,
      });

      const columnPositions = [
        [-14, 3.5, -4],
        [0, 3.5, -4],
        [14, 3.5, -4],
      ];
      columnPositions.forEach(([cx, cy, cz]) => {
        const col = new THREE.Mesh(columnGeo, steelMat);
        col.position.set(cx, cy, cz);
        hubGroup.add(col);
      });

      // Photovoltaic Solar Glass Canopy Roof
      const canopyGeo = new THREE.BoxGeometry(36, 0.4, 16);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x031024,
        metalness: 0.95,
        roughness: 0.1,
        transparent: true,
        opacity: 0.92,
      });
      const canopyRoof = new THREE.Mesh(canopyGeo, canopyMat);
      canopyRoof.position.set(0, 7.2, 1);
      canopyRoof.rotation.x = -0.05; // Gentle slant towards sun
      hubGroup.add(canopyRoof);

      // Solar Cell Grid Lines on top of Canopy
      const solarLines = new THREE.GridHelper(34, 16, 0x00e5ff, 0x003366);
      solarLines.position.set(0, 7.42, 1);
      solarLines.rotation.x = -0.05;
      hubGroup.add(solarLines);

      // Canopy LED Edge Glow
      const edgeGeo = new THREE.EdgesGeometry(canopyRoof.geometry);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 });
      const canopyEdge = new THREE.LineSegments(edgeGeo, edgeMat);
      canopyEdge.position.copy(canopyRoof.position);
      canopyEdge.rotation.copy(canopyRoof.rotation);
      hubGroup.add(canopyEdge);

      // Overhead Downlight LED strips casting light over bays
      const canopyStripGeo = new THREE.BoxGeometry(32, 0.1, 0.2);
      const canopyStripMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const downlightStrip = new THREE.Mesh(canopyStripGeo, canopyStripMat);
      downlightStrip.position.set(0, 7.0, 0);
      hubGroup.add(downlightStrip);

      // ── BESS (Battery Energy Storage System Container) ──
      const bessGroup = new THREE.Group();
      bessGroup.position.set(-22, 2.5, 0);

      const bessBoxGeo = new THREE.BoxGeometry(6, 5, 12);
      const bessBoxMat = new THREE.MeshStandardMaterial({
        color: 0x0d1522,
        metalness: 0.8,
        roughness: 0.3,
      });
      const bessContainer = new THREE.Mesh(bessBoxGeo, bessBoxMat);
      bessGroup.add(bessContainer);

      // BESS container edges
      const bessEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(bessBoxGeo),
        new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6 })
      );
      bessGroup.add(bessEdges);

      // BESS LED Status Bars (Vertical battery level LEDs)
      for (let i = 0; i < 4; i++) {
        const barGeo = new THREE.BoxGeometry(0.15, 3.2, 0.8);
        const barMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
        const ledBar = new THREE.Mesh(barGeo, barMat);
        ledBar.position.set(3.02, 0, -3 + i * 2);
        bessGroup.add(ledBar);
      }
      hubGroup.add(bessGroup);

      // ── 6 Charging Bays & Vehicles Setup ──
      const baySpacing = 5.6;
      const bayStartX = -14;

      // Arrays to hold animated elements
      const cableBeads: {
        curve: THREE.CatmullRomCurve3;
        mesh: THREE.Mesh;
        progress: number;
        speed: number;
      }[] = [];

      const underbodyGlows: THREE.Mesh[] = [];

      BAYS_DATA.forEach((bayData, idx) => {
        const bayX = bayStartX + idx * baySpacing;
        const bayZ = 2;

        const bayGroup = new THREE.Group();
        bayGroup.position.set(bayX, 0, bayZ);
        bayGroup.userData = { bayData };

        // 1. Bay Pavement Markings (Cyan Stall Lines)
        const lineMat = new THREE.LineBasicMaterial({
          color: bayData.status === 'CHARGING' ? 0x00e5ff : 0x388bfd,
        });
        const stallPts = [
          new THREE.Vector3(-2.4, 0.04, -5),
          new THREE.Vector3(-2.4, 0.04, 5),
          new THREE.Vector3(2.4, 0.04, 5),
          new THREE.Vector3(2.4, 0.04, -5),
        ];
        const stallGeo = new THREE.BufferGeometry().setFromPoints(stallPts);
        const stallLine = new THREE.Line(stallGeo, lineMat);
        bayGroup.add(stallLine);

        // 2. High-Power DC Charging Dispenser Pedestal
        const dispenserGroup = new THREE.Group();
        dispenserGroup.position.set(bayX, 0, -3.8);

        // Pedestal Body
        const dispGeo = new THREE.BoxGeometry(1.0, 3.2, 0.8);
        const dispMat = new THREE.MeshStandardMaterial({
          color: 0x09101d,
          metalness: 0.8,
          roughness: 0.2,
        });
        const dispMesh = new THREE.Mesh(dispGeo, dispMat);
        dispMesh.position.y = 1.6;
        dispenserGroup.add(dispMesh);

        // Digital Telemetry Screen on Dispenser
        const screenGeo = new THREE.PlaneGeometry(0.65, 0.9);
        const screenMat = new THREE.MeshBasicMaterial({
          color: bayData.status === 'CHARGING' ? 0x00e5ff : 0x00ff88,
        });
        const screenMesh = new THREE.Mesh(screenGeo, screenMat);
        screenMesh.position.set(0, 2.0, 0.41);
        dispenserGroup.add(screenMesh);

        // Dispenser Halo Top Light
        const topLightGeo = new THREE.BoxGeometry(1.02, 0.12, 0.82);
        const topLightMat = new THREE.MeshBasicMaterial({
          color: bayData.status === 'CHARGING' ? 0x00e5ff : 0x00ff88,
        });
        const topLight = new THREE.Mesh(topLightGeo, topLightMat);
        topLight.position.y = 3.25;
        dispenserGroup.add(topLight);

        hubGroup.add(dispenserGroup);

        // 3. Shuga EV Crossover Vehicle (Placed in active bays)
        if (bayData.status === 'CHARGING') {
          const carGroup = new THREE.Group();
          carGroup.position.set(bayX, 0.35, 1.2);
          carGroup.userData = { bayData };

          // Aerodynamic Crossover Body
          const carBodyGeo = new THREE.BoxGeometry(2.1, 1.1, 4.4);
          const carBodyMat = new THREE.MeshStandardMaterial({
            color: 0x060910,
            metalness: 0.9,
            roughness: 0.15,
          });
          const carBody = new THREE.Mesh(carBodyGeo, carBodyMat);
          carBody.position.y = 0.55;
          carGroup.add(carBody);

          // Sleek Glass Greenhouse / Cabin
          const cabinGeo = new THREE.BoxGeometry(1.7, 0.75, 2.4);
          const cabinMat = new THREE.MeshStandardMaterial({
            color: 0x02050b,
            metalness: 0.95,
            roughness: 0.1,
            transparent: true,
            opacity: 0.88,
          });
          const cabin = new THREE.Mesh(cabinGeo, cabinMat);
          cabin.position.set(0, 1.45, -0.2);
          carGroup.add(cabin);

          // Front Razor LED Light Strip
          const frontLedGeo = new THREE.BoxGeometry(1.9, 0.08, 0.1);
          const frontLedMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const frontLed = new THREE.Mesh(frontLedGeo, frontLedMat);
          frontLed.position.set(0, 0.65, 2.22);
          carGroup.add(frontLed);

          // Rear Red LED Light Strip
          const rearLedGeo = new THREE.BoxGeometry(1.9, 0.08, 0.1);
          const rearLedMat = new THREE.MeshBasicMaterial({ color: 0xff1e38 });
          const rearLed = new THREE.Mesh(rearLedGeo, rearLedMat);
          rearLed.position.set(0, 0.75, -2.22);
          carGroup.add(rearLed);

          // 4 Alloy Wheels
          const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
          const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111622, metalness: 0.8 });
          const wheelPositions = [
            [-1.1, 0.22, 1.4],
            [1.1, 0.22, 1.4],
            [-1.1, 0.22, -1.4],
            [1.1, 0.22, -1.4],
          ];
          wheelPositions.forEach(([wx, wy, wz]) => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(wx, wy, wz);
            carGroup.add(wheel);
          });

          // 4. Glowing Skateboard Battery Pack Underbody Glow
          const underGlowGeo = new THREE.PlaneGeometry(2.4, 4.0);
          const underGlowMat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide,
          });
          const underGlow = new THREE.Mesh(underGlowGeo, underGlowMat);
          underGlow.rotation.x = -Math.PI / 2;
          underGlow.position.y = -0.28;
          carGroup.add(underGlow);
          underbodyGlows.push(underGlow);

          hubGroup.add(carGroup);

          // 5. Realistic Luminous Charging Cable from Dispenser to Car Port
          const dispenserPort = new THREE.Vector3(bayX + 0.4, 1.6, -3.4);
          const carPort = new THREE.Vector3(bayX + 1.1, 0.85, -0.6);
          const midHang = new THREE.Vector3(bayX + 0.8, 0.35, -2.0); // Natural cable sag

          const cableCurve = new THREE.CatmullRomCurve3([
            dispenserPort,
            midHang,
            carPort,
          ]);

          const cableTubeGeo = new THREE.TubeGeometry(cableCurve, 24, 0.055, 8, false);
          const cableTubeMat = new THREE.MeshStandardMaterial({
            color: 0x00e5ff,
            emissive: 0x0077aa,
            emissiveIntensity: 0.7,
            roughness: 0.3,
          });
          const cableTube = new THREE.Mesh(cableTubeGeo, cableTubeMat);
          hubGroup.add(cableTube);

          // Glowing Charging Inlet Plug at Car Port
          const plugGeo = new THREE.BoxGeometry(0.2, 0.2, 0.3);
          const plugMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
          const plugMesh = new THREE.Mesh(plugGeo, plugMat);
          plugMesh.position.copy(carPort);
          hubGroup.add(plugMesh);

          // Energy Particle Pulses flowing through cable into battery
          for (let p = 0; p < 3; p++) {
            const beadGeo = new THREE.SphereGeometry(0.12, 8, 8);
            const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const beadMesh = new THREE.Mesh(beadGeo, beadMat);
            hubGroup.add(beadMesh);

            cableBeads.push({
              curve: cableCurve,
              mesh: beadMesh,
              progress: (p * 0.33) % 1,
              speed: 0.012 + (idx % 2) * 0.003,
            });
          }
        }
      });

      // ── Raycasting for Bay Selection ──
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onCanvasClick = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hubGroup.children, true);

        if (intersects.length > 0) {
          let cur: THREE.Object3D | null = intersects[0].object;
          while (cur && cur !== hubGroup) {
            if (cur.userData && cur.userData.bayData) {
              setSelectedBay(cur.userData.bayData);
              return;
            }
            cur = cur.parent;
          }
          // Cycle to next bay on empty click
          setSelectedBay((prev) => {
            const nextIdx = (BAYS_DATA.findIndex((b) => b.bayNumber === prev?.bayNumber) + 1) % BAYS_DATA.length;
            return BAYS_DATA[nextIdx];
          });
        }
      };

      canvas.addEventListener('click', onCanvasClick);

      // ── Animation Loop ──
      let clock = 0;

      const animate = () => {
        if (isDisposed) return;
        clock += 0.016;

        // Auto rotate camera orbit
        if (autoRotate && !isDraggingRef.current) {
          cameraAngleRef.current.theta += 0.0015;
        }

        // Camera position calculation
        const { theta, phi, radius } = cameraAngleRef.current;
        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, 2.5, 0);

        // Day / Night lighting transitions
        if (isDayModeRef.current) {
          sunLight.color.setHex(0xfff3d6);
          sunLight.intensity = 2.8;
          ambientLight.intensity = 1.8;
        } else {
          sunLight.color.setHex(0x388bfd);
          sunLight.intensity = 0.8;
          ambientLight.intensity = 0.9;
        }

        // Animate energy particle pulses flowing along charging cables into batteries
        cableBeads.forEach((item) => {
          item.progress = (item.progress + item.speed) % 1;
          const pos = item.curve.getPoint(item.progress);
          item.mesh.position.copy(pos);
        });

        // Animate underbody skateboard battery pulse
        underbodyGlows.forEach((glow, idx) => {
          const pulse = 0.35 + Math.sin(clock * 3.5 + idx) * 0.18;
          (glow.material as THREE.MeshBasicMaterial).opacity = pulse;
        });

        renderer.render(scene, camera);
        animId = requestAnimationFrame(animate);
      };

      animId = requestAnimationFrame(animate);

      // Cleanup
      return () => {
        window.removeEventListener('resize', updateSize);
        canvas.removeEventListener('click', onCanvasClick);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    }

    const cleanup = init();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      if (typeof cleanup === 'function') cleanup();
    };
  }, [autoRotate]);

  // Pointer drag orbit handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    prevPointerRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - prevPointerRef.current.x;
    const deltaY = clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: clientX, y: clientY };

    cameraAngleRef.current.theta -= deltaX * 0.007;
    cameraAngleRef.current.phi = Math.max(
      0.2,
      Math.min(Math.PI / 2.2, cameraAngleRef.current.phi - deltaY * 0.007)
    );
  }, []);

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    cameraAngleRef.current.radius = Math.max(25, Math.min(75, cameraAngleRef.current.radius + delta));
  };

  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: Math.PI / 4.2, phi: Math.PI / 3.4, radius: 46 };
  };

  return (
    <div
      ref={containerRef}
      className={styles.stationWrap}
      onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseUp={handlePointerUp}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handlePointerUp}
    >
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* ── Top HUD ── */}
      <div className={styles.hudTop}>
        <div className={styles.hudBrand}>
          <span className={styles.pulseDot} />
          <span className={styles.hudBrandText}>
            SHUGA ENERGY // 3D SOLAR MICROGRID &amp; SUPERHUB
          </span>
        </div>

        {/* Day / Night Mode & View Controls */}
        <div className={styles.hudControlsGroup}>
          <button
            type="button"
            onClick={() => setIsDayMode(!isDayMode)}
            className={`${styles.modeToggleBtn} ${isDayMode ? styles.modeToggleActive : ''}`}
            title="Toggle Day Solar Harvest vs Night BESS Discharge"
          >
            {isDayMode ? '☀️ PEAK SOLAR INFLUX' : '🌙 BESS DISCHARGE MODE'}
          </button>
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`${styles.ctrlBtn} ${autoRotate ? styles.ctrlBtnActive : ''}`}
            title="Toggle camera auto-orbit"
          >
            {autoRotate ? '⏸ PAUSE' : '▶ ORBIT'}
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-8)}
            className={styles.ctrlBtn}
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleZoom(8)}
            className={styles.ctrlBtn}
            title="Zoom Out"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            className={styles.ctrlBtn}
            title="Reset Perspective"
          >
            ↺ RESET
          </button>
        </div>
      </div>

      {/* ── Charging Bay Inspection Telemetry Card ── */}
      {selectedBay && (
        <div className={styles.bayModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHead}>
            <span className={styles.modalTag}>
              {selectedBay.bayNumber} // {selectedBay.status}
            </span>
            <button
              type="button"
              onClick={() => setSelectedBay(null)}
              className={styles.modalClose}
            >
              ✕
            </button>
          </div>
          <div className={styles.modalTitle}>{selectedBay.kwPower}</div>
          <div className={styles.modalVehicle}>{selectedBay.vehicle}</div>

          {/* State of Charge Progress Bar */}
          {selectedBay.status === 'CHARGING' && (
            <div className={styles.chargeProgressWrap}>
              <div className={styles.progressLabels}>
                <span>BATTERY STATE OF CHARGE</span>
                <span style={{ color: '#00e5ff', fontWeight: 700 }}>{selectedBay.soc}%</span>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${selectedBay.soc}%` }}
                />
              </div>
            </div>
          )}

          <div className={styles.modalGrid}>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>VOLTAGE / CURRENT</span>
              <span className={styles.gridVal}>{selectedBay.voltage}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>TIME REMAINING</span>
              <span className={styles.gridVal}>{selectedBay.timeLeft}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>ENERGY DELIVERED</span>
              <span className={styles.gridVal}>{selectedBay.kwhDelivered}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>POWER SOURCE</span>
              <span className={styles.gridVal}>{selectedBay.source}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom HUD Telemetry Deck ── */}
      <div className={styles.hudBottom}>
        <div className={styles.telemetryDeck}>
          <div className={styles.telMetric}>
            <span className={styles.telVal}>
              {isDayMode ? '184' : '0'} <small>KW</small>
            </span>
            <span className={styles.telLabel}>ROOFTOP SOLAR INFLUX</span>
          </div>
          <div className={styles.telMetric}>
            <span className={styles.telVal}>
              480 <small>KWH (94%)</small>
            </span>
            <span className={styles.telLabel}>BESS LFP STORAGE</span>
          </div>
          <div className={styles.telMetric}>
            <span className={styles.telVal}>
              4 / 6 <small>BAYS</small>
            </span>
            <span className={styles.telLabel}>ACTIVE FAST CHARGERS</span>
          </div>
          <div className={styles.telMetric}>
            <span className={styles.telVal}>
              3,420 <small>LITRES</small>
            </span>
            <span className={styles.telLabel}>DIESEL DISPLACED TODAY</span>
          </div>
        </div>

        <div className={styles.hudActions}>
          <Link href="/contact" className="btn btn--white" data-cursor>
            Find Charging Hub
          </Link>
          <Link href="/shuga-cars" className="btn btn--outline" data-cursor>
            Get an EV
          </Link>
        </div>
      </div>

      {/* ── Interactive Hint ── */}
      <div className={styles.hintBanner}>
        <span>
          DRAG TO ORBIT 3D CHARGING HUB • CLICK ANY STALL OR VEHICLE TO INSPECT LIVE CHARGING TELEMETRY • TOGGLE SOLAR / BESS
        </span>
      </div>
    </div>
  );
}
