'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import styles from './RideDispatchScene3D.module.css';

interface VehicleTelemetry {
  id: string;
  name: string;
  driver: string;
  rating: string;
  origin: string;
  destination: string;
  battery: string;
  speed: string;
  eta: string;
  co2Saved: string;
}

interface CityConfig {
  id: 'lagos' | 'abuja';
  name: string;
  subtitle: string;
  hotspots: { name: string; x: number; z: number }[];
  tripArcs: { from: [number, number]; to: [number, number]; label: string }[];
  vehicleRoutes: [number, number][][];
}

const CITIES: Record<'lagos' | 'abuja', CityConfig> = {
  lagos: {
    id: 'lagos',
    name: 'Lagos Metropolitan',
    subtitle: 'COASTAL TRANSIT & ISLAND CORRIDOR',
    hotspots: [
      { name: 'Victoria Island Core', x: -15, z: 8 },
      { name: 'Lekki Phase 1', x: 22, z: 12 },
      { name: 'Marina Waterfront', x: -18, z: -14 },
      { name: 'Ikeja Tech Hub', x: 12, z: -22 },
    ],
    tripArcs: [
      { from: [-18, -14], to: [-15, 8], label: 'Marina ➔ VI Financial Core' },
      { from: [22, 12], to: [-15, 8], label: 'Lekki Tollgate ➔ Victoria Island' },
      { from: [12, -22], to: [-18, -14], label: 'Ikeja Airport Corridor ➔ Marina' },
      { from: [-15, 8], to: [22, 12], label: 'Eko Atlantic ➔ Lekki Phase 1' },
    ],
    vehicleRoutes: [
      [[-28, 8], [-15, 8], [0, 8], [15, 8], [28, 8]],
      [[28, 14], [15, 14], [0, 14], [-15, 14], [-28, 14]],
      [[-18, -25], [-18, -12], [-18, 0], [-18, 12], [-18, 25]],
      [[12, -25], [12, -10], [12, 5], [12, 18], [12, 28]],
      [[-25, -5], [-10, -5], [5, -5], [20, -5]],
      [[-25, 20], [-10, 20], [8, 20], [24, 20]],
    ],
  },
  abuja: {
    id: 'abuja',
    name: 'Abuja Federal Capital',
    subtitle: 'CENTRAL BUSINESS DISTRICT & BOULEVARDS',
    hotspots: [
      { name: 'Three Arms Zone', x: 0, z: -18 },
      { name: 'CBD Financial Hub', x: -12, z: 0 },
      { name: 'Maitama District', x: 14, z: -10 },
      { name: 'Wuse II Commercial', x: -16, z: 14 },
    ],
    tripArcs: [
      { from: [-16, 14], to: [0, -18], label: 'Wuse II ➔ Three Arms Zone' },
      { from: [14, -10], to: [-12, 0], label: 'Maitama ➔ CBD Financial Hub' },
      { from: [0, 26], to: [0, -18], label: 'Airport Expressway ➔ Three Arms' },
      { from: [-12, 0], to: [14, -10], label: 'CBD Central ➔ Maitama High St.' },
    ],
    vehicleRoutes: [
      [[0, 28], [0, 14], [0, 0], [0, -14], [0, -28]],
      [[-26, 0], [-14, 0], [0, 0], [14, 0], [26, 0]],
      [[-20, 16], [-10, 16], [0, 16], [12, 16], [24, 16]],
      [[-20, -16], [-8, -16], [0, -16], [10, -16], [22, -16]],
      [[-16, -24], [-16, -10], [-16, 4], [-16, 18]],
      [[16, -24], [16, -8], [16, 6], [16, 20]],
    ],
  },
};

const SAMPLE_TELEMETRIES: VehicleTelemetry[] = [
  {
    id: 'SR-108',
    name: 'Shuga EV Crossover #108',
    driver: 'Adebayo Oladipo (5.0 ★)',
    rating: 'Top Tier Driver',
    origin: 'Lekki Phase 1 Corridor',
    destination: 'Victoria Island Financial Core',
    battery: '96% LFP (336 km left)',
    speed: '54 km/h',
    eta: '3 mins',
    co2Saved: '3.8 kg CO₂',
  },
  {
    id: 'SR-242',
    name: 'Shuga EV Crossover #242',
    driver: 'Chinedu Eze (4.9 ★)',
    rating: 'Electric Fleet Pioneer',
    origin: 'Marina Waterfront Marina',
    destination: 'Victoria Island Core',
    battery: '91% LFP (318 km left)',
    speed: '48 km/h',
    eta: '2 mins',
    co2Saved: '4.2 kg CO₂',
  },
  {
    id: 'SR-319',
    name: 'Shuga EV Crossover #319',
    driver: 'Fatima Bello (5.0 ★)',
    rating: 'Executive Shield',
    origin: 'Maitama District',
    destination: 'Three Arms Zone',
    battery: '98% LFP (343 km left)',
    speed: '62 km/h',
    eta: '4 mins',
    co2Saved: '5.1 kg CO₂',
  },
];

export default function RideDispatchScene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<'lagos' | 'abuja'>('lagos');
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeTelemetry, setActiveTelemetry] = useState<VehicleTelemetry | null>(SAMPLE_TELEMETRIES[0]);

  // Camera orbit state
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 68 });
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const citySwitchTriggerRef = useRef<'lagos' | 'abuja'>('lagos');

  useEffect(() => {
    citySwitchTriggerRef.current = selectedCity;
  }, [selectedCity]);

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
      scene.fog = new THREE.FogExp2(0x020408, 0.016);

      const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 300);

      const updateSize = () => {
        if (!containerRef.current || isDisposed) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight || 720;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      updateSize();
      window.addEventListener('resize', updateSize);

      // ── Lights ──
      const ambientLight = new THREE.AmbientLight(0x0a1424, 2.5);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
      mainLight.position.set(40, 60, 40);
      scene.add(mainLight);

      const blueRim = new THREE.DirectionalLight(0x1d4ed8, 1.5);
      blueRim.position.set(-40, 30, -30);
      scene.add(blueRim);

      // Root group for city content to allow swapping/updating
      const cityGroup = new THREE.Group();
      scene.add(cityGroup);

      // ── Helper builders ──
      let vehicles: {
        mesh: THREE.Group;
        path: THREE.Vector3[];
        progress: number;
        speed: number;
      }[] = [];

      let tripArcCurves: {
        curve: THREE.QuadraticBezierCurve3;
        bead: THREE.Mesh;
        progress: number;
        speed: number;
      }[] = [];

      let rippleMeshes: {
        mesh: THREE.Mesh;
        baseScale: number;
      }[] = [];

      function buildCityScene(cityKey: 'lagos' | 'abuja') {
        // Clear previous city objects
        while (cityGroup.children.length > 0) {
          const obj = cityGroup.children[0];
          cityGroup.remove(obj);
          if ('geometry' in obj && obj.geometry) (obj.geometry as THREE.BufferGeometry).dispose();
        }
        vehicles = [];
        tripArcCurves = [];
        rippleMeshes = [];

        const city = CITIES[cityKey];

        // 1. Base Grid Plane
        const gridHelper = new THREE.GridHelper(90, 45, 0x00e5ff, 0x0a1828);
        gridHelper.position.y = 0;
        cityGroup.add(gridHelper);

        // 2. City-Specific Feature: Lagos Water / Bridge or Abuja Aso Rock
        if (cityKey === 'lagos') {
          // Water surface (Lagoon) on one side
          const waterGeo = new THREE.PlaneGeometry(36, 90);
          const waterMat = new THREE.MeshBasicMaterial({
            color: 0x021124,
            transparent: true,
            opacity: 0.85,
          });
          const waterPlane = new THREE.Mesh(waterGeo, waterMat);
          waterPlane.rotation.x = -Math.PI / 2;
          waterPlane.position.set(-30, 0.05, 0);
          cityGroup.add(waterPlane);

          // Water ripple lines
          const waterGrid = new THREE.GridHelper(36, 12, 0x005588, 0x002244);
          waterGrid.position.set(-30, 0.1, 0);
          cityGroup.add(waterGrid);

          // Elevated Third Mainland Bridge over the water
          const bridgeCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-30, 2.2, -40),
            new THREE.Vector3(-27, 2.6, -15),
            new THREE.Vector3(-22, 2.8, 10),
            new THREE.Vector3(-16, 1.8, 38),
          ]);
          const bridgePoints = bridgeCurve.getPoints(60);
          const bridgeGeo = new THREE.BufferGeometry().setFromPoints(bridgePoints);
          const bridgeMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 });
          const bridgeLine = new THREE.Line(bridgeGeo, bridgeMat);
          cityGroup.add(bridgeLine);

          // Bridge pillars
          for (let p = 0; p < bridgePoints.length; p += 8) {
            const pt = bridgePoints[p];
            const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, pt.y, 8);
            const pillarMat = new THREE.MeshBasicMaterial({ color: 0x003355 });
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(pt.x, pt.y / 2, pt.z);
            cityGroup.add(pillar);
          }
        } else {
          // Abuja Aso Rock Wireframe Monolith in background
          const rockGeo = new THREE.ConeGeometry(18, 16, 7);
          const rockMat = new THREE.MeshBasicMaterial({
            color: 0x081c30,
            wireframe: true,
            transparent: true,
            opacity: 0.45,
          });
          const rockMesh = new THREE.Mesh(rockGeo, rockMat);
          rockMesh.position.set(0, 8, -42);
          rockMesh.scale.set(1.8, 1.2, 1.2);
          cityGroup.add(rockMesh);

          // Aso Rock beacon light
          const beaconGeo = new THREE.SphereGeometry(0.6, 8, 8);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.set(0, 18, -42);
          cityGroup.add(beacon);
        }

        // 3. Holographic Procedural Buildings
        const buildingBoxGeo = new THREE.BoxGeometry(1, 1, 1);
        const bldgFillMat = new THREE.MeshStandardMaterial({
          color: 0x030a16,
          metalness: 0.9,
          roughness: 0.3,
          transparent: true,
          opacity: 0.85,
        });
        const edgeLineMat = new THREE.LineBasicMaterial({
          color: 0x00e5ff,
          transparent: true,
          opacity: 0.4,
        });

        // Generate blocks of city buildings
        const numBlocksX = 7;
        const numBlocksZ = 7;
        const spacing = 7.5;

        for (let bx = -numBlocksX / 2; bx <= numBlocksX / 2; bx++) {
          for (let bz = -numBlocksZ / 2; bz <= numBlocksZ / 2; bz++) {
            // Leave open corridors for main highways
            if (Math.abs(bx) < 0.8 && cityKey === 'abuja') continue; // Main central boulevard
            if (bx < -1.8 && cityKey === 'lagos') continue; // Water lagoon

            // Random heights based on downtown core proximity
            const distFromCenter = Math.sqrt(bx * bx + bz * bz);
            if (distFromCenter > 3.8) continue;

            const height = Math.max(2.5, (4 - distFromCenter) * 4.5 + (Math.sin(bx * 3 + bz * 2) * 2));
            const width = 2.8 + (Math.sin(bx * 5) * 0.6);
            const depth = 2.8 + (Math.cos(bz * 4) * 0.6);

            const building = new THREE.Mesh(buildingBoxGeo, bldgFillMat);
            building.scale.set(width, height, depth);
            building.position.set(bx * spacing, height / 2, bz * spacing);
            cityGroup.add(building);

            // Glowing edge contours
            const edges = new THREE.EdgesGeometry(building.geometry);
            const edgeLine = new THREE.LineSegments(edges, edgeLineMat);
            edgeLine.scale.copy(building.scale);
            edgeLine.position.copy(building.position);
            cityGroup.add(edgeLine);

            // Rooftop beacon light on taller towers
            if (height > 9) {
              const rBeaconGeo = new THREE.SphereGeometry(0.18, 6, 6);
              const rBeaconMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
              const rBeacon = new THREE.Mesh(rBeaconGeo, rBeaconMat);
              rBeacon.position.set(bx * spacing, height + 0.2, bz * spacing);
              cityGroup.add(rBeacon);
            }
          }
        }

        // 4. Passenger Pickup Radar Ripples at Hotspots
        city.hotspots.forEach((spot) => {
          const ringGeo = new THREE.RingGeometry(0.5, 1.8, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = -Math.PI / 2;
          ringMesh.position.set(spot.x, 0.15, spot.z);
          cityGroup.add(ringMesh);
          rippleMeshes.push({ mesh: ringMesh, baseScale: 1 });

          // Center pin
          const pinGeo = new THREE.CylinderGeometry(0.2, 0.05, 3.5, 8);
          const pinMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
          const pin = new THREE.Mesh(pinGeo, pinMat);
          pin.position.set(spot.x, 1.75, spot.z);
          cityGroup.add(pin);
        });

        // 5. Dynamic Passenger Trip Parabolic Arcs
        city.tripArcs.forEach((trip) => {
          const start = new THREE.Vector3(trip.from[0], 0.2, trip.from[1]);
          const end = new THREE.Vector3(trip.to[0], 0.2, trip.to[1]);
          const midX = (start.x + end.x) / 2;
          const midZ = (start.z + end.z) / 2;
          const arcHeight = start.distanceTo(end) * 0.38 + 6;
          const control = new THREE.Vector3(midX, arcHeight, midZ);

          const curve = new THREE.QuadraticBezierCurve3(start, control, end);
          const points = curve.getPoints(50);
          const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
          const arcMat = new THREE.LineDashedMaterial({
            color: 0x00e5ff,
            dashSize: 1.5,
            gapSize: 0.8,
            transparent: true,
            opacity: 0.55,
          });
          const arcLine = new THREE.Line(arcGeo, arcMat);
          arcLine.computeLineDistances();
          cityGroup.add(arcLine);

          // Luminous traveling bead along arc
          const beadGeo = new THREE.SphereGeometry(0.4, 8, 8);
          const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const bead = new THREE.Mesh(beadGeo, beadMat);
          cityGroup.add(bead);

          tripArcCurves.push({
            curve,
            bead,
            progress: Math.random(),
            speed: 0.005 + Math.random() * 0.004,
          });
        });

        // 6. Dynamic Shuga EV Fleet Cruisers
        city.vehicleRoutes.forEach((routeCoords, idx) => {
          const points = routeCoords.map(([rx, rz]) => new THREE.Vector3(rx, 0.3, rz));
          // Return journey to loop
          const reversePoints = [...points].reverse();
          const fullLoop = [...points, ...reversePoints.slice(1, -1)];

          // Build EV vehicle mesh
          const vehicleGroup = new THREE.Group();

          // Vehicle body (aerodynamic wedge crossover)
          const carBodyGeo = new THREE.BoxGeometry(0.9, 0.45, 1.8);
          const carBodyMat = new THREE.MeshStandardMaterial({
            color: 0x0a121e,
            metalness: 0.8,
            roughness: 0.2,
          });
          const bodyMesh = new THREE.Mesh(carBodyGeo, carBodyMat);
          bodyMesh.position.y = 0.25;
          vehicleGroup.add(bodyMesh);

          // Glowing electric cyan roof rack & rim
          const roofGeo = new THREE.BoxGeometry(0.7, 0.25, 0.9);
          const roofMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
          const roofMesh = new THREE.Mesh(roofGeo, roofMat);
          roofMesh.position.set(0, 0.5, -0.1);
          vehicleGroup.add(roofMesh);

          // Headlights (Twin white spots)
          const headlightGeo = new THREE.SphereGeometry(0.12, 6, 6);
          const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
          hlLeft.position.set(-0.32, 0.25, 0.9);
          const hlRight = new THREE.Mesh(headlightGeo, headlightMat);
          hlRight.position.set(0.32, 0.25, 0.9);
          vehicleGroup.add(hlLeft);
          vehicleGroup.add(hlRight);

          // Forward beam cone projection onto asphalt
          const beamGeo = new THREE.ConeGeometry(0.8, 3.2, 8);
          const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.18,
            side: THREE.DoubleSide,
          });
          const beamMesh = new THREE.Mesh(beamGeo, beamMat);
          beamMesh.rotation.x = Math.PI / 2.3;
          beamMesh.position.set(0, 0.15, 2.2);
          vehicleGroup.add(beamMesh);

          // Taillight (Red LED)
          const tailGeo = new THREE.BoxGeometry(0.75, 0.08, 0.08);
          const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2a48 });
          const tailMesh = new THREE.Mesh(tailGeo, tailMat);
          tailMesh.position.set(0, 0.3, -0.92);
          vehicleGroup.add(tailMesh);

          // Tag with telemetry data
          vehicleGroup.userData = {
            telemetry: SAMPLE_TELEMETRIES[idx % SAMPLE_TELEMETRIES.length],
          };

          cityGroup.add(vehicleGroup);

          vehicles.push({
            mesh: vehicleGroup,
            path: fullLoop,
            progress: (idx * 0.22) % 1,
            speed: 0.003 + (idx % 3) * 0.001,
          });
        });
      }

      // Initial build
      buildCityScene(selectedCity);

      // Track active city to trigger rebuild when state changes
      let currentCity = selectedCity;

      // ── Raycasting for click interaction ──
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onCanvasClick = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cityGroup.children, true);

        if (intersects.length > 0) {
          // Find ancestor vehicle group
          let cur: THREE.Object3D | null = intersects[0].object;
          while (cur && cur !== cityGroup) {
            if (cur.userData && cur.userData.telemetry) {
              setActiveTelemetry(cur.userData.telemetry);
              return;
            }
            cur = cur.parent;
          }
          // If clicked a building or point, cycle telemetry
          const randomTel = SAMPLE_TELEMETRIES[Math.floor(Math.random() * SAMPLE_TELEMETRIES.length)];
          setActiveTelemetry(randomTel);
        }
      };

      canvas.addEventListener('click', onCanvasClick);

      // ── Main Animation Loop ──
      let clock = 0;

      const animate = () => {
        if (isDisposed) return;

        // Check if city switched
        if (citySwitchTriggerRef.current !== currentCity) {
          currentCity = citySwitchTriggerRef.current;
          buildCityScene(currentCity);
        }

        clock += 0.016;

        // Orbit camera positioning
        if (autoRotate && !isDraggingRef.current) {
          cameraAngleRef.current.theta += 0.0018;
        }

        const { theta, phi, radius } = cameraAngleRef.current;
        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, 3, 0);

        // Animate trip arc beads
        tripArcCurves.forEach((item) => {
          item.progress = (item.progress + item.speed) % 1;
          const pos = item.curve.getPoint(item.progress);
          item.bead.position.copy(pos);
        });

        // Animate radar ripples at hotspots
        rippleMeshes.forEach((item, i) => {
          const s = 1 + ((clock * 1.5 + i * 0.8) % 2.5);
          item.mesh.scale.set(s, s, s);
          (item.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - (s - 1) * 0.28);
        });

        // Animate vehicles along routes
        vehicles.forEach((veh) => {
          veh.progress = (veh.progress + veh.speed) % 1;
          const totalPts = veh.path.length;
          const exactIdx = veh.progress * (totalPts - 1);
          const i1 = Math.floor(exactIdx);
          const i2 = Math.min(i1 + 1, totalPts - 1);
          const factor = exactIdx - i1;

          const p1 = veh.path[i1];
          const p2 = veh.path[i2];
          if (p1 && p2) {
            veh.mesh.position.lerpVectors(p1, p2, factor);
            const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
            if (dir.lengthSq() > 0.0001) {
              veh.mesh.lookAt(veh.mesh.position.clone().add(dir));
            }
          }
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
      Math.min(Math.PI / 2.1, cameraAngleRef.current.phi - deltaY * 0.007)
    );
  }, []);

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    cameraAngleRef.current.radius = Math.max(35, Math.min(105, cameraAngleRef.current.radius + delta));
  };

  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 68 };
  };

  return (
    <div
      ref={containerRef}
      className={styles.dispatchWrap}
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
            SHUGA RIDE // 3D FLEET DISPATCH MATRIX
          </span>
        </div>

        {/* City Switcher */}
        <div className={styles.hudCityControls}>
          <button
            type="button"
            onClick={() => setSelectedCity('lagos')}
            className={`${styles.cityBtn} ${selectedCity === 'lagos' ? styles.cityBtnActive : ''}`}
          >
            LAGOS COASTAL
          </button>
          <button
            type="button"
            onClick={() => setSelectedCity('abuja')}
            className={`${styles.cityBtn} ${selectedCity === 'abuja' ? styles.cityBtnActive : ''}`}
          >
            ABUJA CAPITAL
          </button>
        </div>

        {/* View Controls */}
        <div className={styles.hudToggles}>
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`${styles.toggleBtn} ${autoRotate ? styles.toggleBtnActive : ''}`}
            title="Toggle camera auto-orbit"
          >
            {autoRotate ? '⏸ PAUSE' : '▶ ORBIT'}
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-12)}
            className={styles.toggleBtn}
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleZoom(12)}
            className={styles.toggleBtn}
            title="Zoom Out"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            className={styles.toggleBtn}
            title="Reset Perspective"
          >
            ↺ RESET
          </button>
        </div>
      </div>

      {/* ── Interactive Live Telemetry Inspection Card ── */}
      {activeTelemetry && (
        <div className={styles.inspectionCard} onClick={(e) => e.stopPropagation()}>
          <div className={styles.cardHead}>
            <span className={styles.cardTag}>LIVE RIDE DISPATCH</span>
            <button
              type="button"
              onClick={() => setActiveTelemetry(null)}
              className={styles.cardClose}
            >
              ✕
            </button>
          </div>
          <div className={styles.cardVehicleTitle}>{activeTelemetry.name}</div>
          <div className={styles.cardRoute}>
            <span>{activeTelemetry.origin}</span>
            <span className={styles.cardRouteArrow}>➔</span>
            <span>{activeTelemetry.destination}</span>
          </div>

          <div className={styles.cardStatsGrid}>
            <div className={styles.cardStatItem}>
              <span className={styles.cardStatLabel}>DRIVER</span>
              <span className={styles.cardStatVal}>{activeTelemetry.driver}</span>
            </div>
            <div className={styles.cardStatItem}>
              <span className={styles.cardStatLabel}>BATTERY STATE</span>
              <span className={styles.cardStatVal}>{activeTelemetry.battery}</span>
            </div>
            <div className={styles.cardStatItem}>
              <span className={styles.cardStatLabel}>ESTIMATED PICKUP</span>
              <span className={styles.cardStatVal}>{activeTelemetry.eta}</span>
            </div>
            <div className={styles.cardStatItem}>
              <span className={styles.cardStatLabel}>CO₂ SAVED</span>
              <span className={styles.cardStatVal}>{activeTelemetry.co2Saved}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom HUD Telemetry Deck ── */}
      <div className={styles.hudBottom}>
        <div className={styles.telemetryDeck}>
          <div className={styles.telMetric}>
            <span className={styles.telVal}>168 <small>LIVE</small></span>
            <span className={styles.telLabel}>ACTIVE SHUGA EVS</span>
          </div>
          <div className={styles.telMetric}>
            <span className={styles.telVal}>3.2 <small>MIN</small></span>
            <span className={styles.telLabel}>AVG ARRIVAL TIME</span>
          </div>
          <div className={styles.telMetric}>
            <span className={styles.telVal}>0.00 <small>G/KM</small></span>
            <span className={styles.telLabel}>FLEET EMISSIONS</span>
          </div>
          <div className={styles.telMetric}>
            <span className={styles.telVal}>28,450 <small>KM</small></span>
            <span className={styles.telLabel}>CLEAN ELECTRIC KM TODAY</span>
          </div>
        </div>

        <div className={styles.hudActions}>
          <Link href="/contact" className="btn btn--white" data-cursor>
            Book with Shuga Ride
          </Link>
          <Link href="/shuga-cars" className="btn btn--outline" data-cursor>
            Drive with Fleet
          </Link>
        </div>
      </div>

      {/* ── Interactive Hint ── */}
      <div className={styles.hintBanner}>
        <span>
          DRAG TO ORBIT 3D CITY GRID • CLICK VEHICLES OR PINGS TO INSPECT LIVE DISPATCH • TOGGLE LAGOS / ABUJA
        </span>
      </div>
    </div>
  );
}
