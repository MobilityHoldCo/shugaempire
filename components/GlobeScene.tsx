'use client';
import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import styles from './GlobeScene.module.css';

// ── NIGERIA ACCURATE GEOGRAPHIC BORDER POLYGON (LON, LAT) ──
const NIGERIA_BORDER_GEO: [number, number][] = [
  // Badagry & Lagos Coast (SW)
  [2.7, 6.42],
  [3.4, 6.45],
  [4.3, 6.3],
  // Delta / Bayelsa Coast (South)
  [5.2, 5.6],
  [5.9, 5.0],
  [6.0, 4.35], // Brass / Akassa southernmost tip
  [6.8, 4.45],
  // Port Harcourt & Calabar (SE Coast)
  [7.15, 4.5],
  [8.0, 4.55],
  [8.5, 4.8],
  [8.65, 5.1],
  // Eastern Border with Cameroon
  [8.9, 5.85],
  [9.3, 6.5],
  [10.1, 6.9],
  [11.2, 6.9],
  [11.6, 7.2],
  [12.0, 8.0],
  [12.6, 9.0],
  [13.4, 10.1],
  [13.7, 10.9],
  [14.2, 11.6],
  [14.65, 12.4],
  [14.4, 13.0], // Lake Chad basin (NE)
  [13.8, 13.5],
  // Northern Border with Niger Republic
  [13.0, 13.3],
  [12.2, 13.25],
  [11.0, 13.1],
  [9.8, 13.0],
  [8.6, 13.05],
  [7.5, 13.1],
  [6.2, 13.5],
  [5.25, 13.85], // Sokoto NW apex
  [4.6, 13.5],
  [3.8, 12.2],
  [3.65, 11.7],
  // Western Border with Benin Republic
  [3.7, 10.6],
  [3.6, 9.8],
  [3.1, 8.8],
  [2.7, 8.0],
  [2.7, 7.2],
  [2.7, 6.42], // Close polygon
];

// River Niger & Benue Confluence paths (The iconic "Y" shape of Nigeria)
const RIVER_NIGER: [number, number][] = [
  [3.7, 11.2],
  [4.5, 10.1],
  [5.0, 9.2],
  [5.8, 8.4],
  [6.74, 7.8], // Lokoja Confluence
  [6.8, 6.15], // Onitsha
  [6.4, 5.2],  // Delta
];

const RIVER_BENUE: [number, number][] = [
  [12.8, 9.3], // Yola
  [11.0, 8.9],
  [9.8, 8.4],
  [8.5, 7.7],  // Makurdi
  [6.74, 7.8], // Lokoja Confluence
];

// Coordinate Normalization constants
const MIN_LON = 2.6;
const MAX_LON = 14.8;
const MIN_LAT = 4.2;
const MAX_LAT = 14.0;
const MAP_WIDTH = 4.6;
const MAP_HEIGHT = 3.6;

function geoTo3D(lon: number, lat: number, zElevation = 0): [number, number, number] {
  const normX = (lon - MIN_LON) / (MAX_LON - MIN_LON);
  const normY = (lat - MIN_LAT) / (MAX_LAT - MIN_LAT);
  const x = (normX - 0.5) * MAP_WIDTH;
  const y = (normY - 0.5) * MAP_HEIGHT;
  return [x, y, zElevation];
}

interface CityInfo {
  id: string;
  name: string;
  lat: number;
  lon: number;
  size: number;
  color: string;
  tag: string;
  corridors: string[];
  chargingHubs: number;
  activeEVs: number;
  peakEfficiency: string;
  desc: string;
  routes: { name: string; status: string }[];
}

const CITIES: CityInfo[] = [
  {
    id: 'lagos',
    name: 'Lagos',
    lat: 6.5244,
    lon: 3.3792,
    size: 1.8,
    color: '#ffffff',
    tag: 'COMMERCIAL HUB // SOUTH-WEST',
    corridors: ['Lekki-Epe Expressway', 'Third Mainland Bridge', 'Ikeja Commercial Corridor'],
    chargingHubs: 14,
    activeEVs: 348,
    peakEfficiency: '97.4%',
    desc: "Nigeria's economic powerhouse and densest EV fleet corridor. Continuous high-throughput charging hubs along Lekki, VI, and the Mainland arterial bridges.",
    routes: [
      { name: 'Victoria Island ⇄ Lekki Phase 1', status: 'Optimal' },
      { name: 'Ikeja GRA ⇄ MM2 Airport', status: 'High Traffic' },
      { name: 'Yaba Tech Corridor ⇄ Marina CBD', status: 'Optimal' },
    ],
  },
  {
    id: 'abuja',
    name: 'Abuja',
    lat: 9.0765,
    lon: 7.3986,
    size: 1.7,
    color: '#ffffff',
    tag: 'FEDERAL CAPITAL // CENTRAL FCT',
    corridors: ['Nnamdi Azikiwe Airport Road', 'Shehu Shagari Way', 'Maitama Express Corridor'],
    chargingHubs: 9,
    activeEVs: 194,
    peakEfficiency: '99.1%',
    desc: 'The federal capital nexus. Designed with wide multi-lane boulevards and high solar radiation, making it prime territory for rapid solar-powered transit operations.',
    routes: [
      { name: 'Central Business District ⇄ Maitama', status: 'Optimal' },
      { name: 'Airport Road Express ⇄ City Gate', status: 'Optimal' },
      { name: 'Garki 2 ⇄ Wuse Commercial District', status: 'Optimal' },
    ],
  },
  {
    id: 'kano',
    name: 'Kano',
    lat: 12.0022,
    lon: 8.592,
    size: 0.9,
    color: '#888888',
    tag: 'NORTHERN GATEWAY // EXPANSION',
    corridors: ['Zaria Road Transit Route', 'Commercial Trade Hub'],
    chargingHubs: 3,
    activeEVs: 42,
    peakEfficiency: '94.8%',
    desc: 'Northern commercial epicentre connecting Sahel trade arteries.',
    routes: [],
  },
  {
    id: 'portharcourt',
    name: 'Port Harcourt',
    lat: 4.8156,
    lon: 7.0498,
    size: 0.9,
    color: '#888888',
    tag: 'NIGER DELTA // EXPANSION',
    corridors: ['Aba Road Corridor', 'Trans-Amadi Industrial Zone'],
    chargingHubs: 4,
    activeEVs: 58,
    peakEfficiency: '95.2%',
    desc: 'Energy hub with heavy industrial transit electrification demand.',
    routes: [],
  },
  {
    id: 'ibadan',
    name: 'Ibadan',
    lat: 7.3775,
    lon: 3.947,
    size: 0.8,
    color: '#777777',
    tag: 'SOUTH-WEST JUNCTION // EXPANSION',
    corridors: ['Lagos-Ibadan Expressway Interlink'],
    chargingHubs: 2,
    activeEVs: 30,
    peakEfficiency: '93.5%',
    desc: 'Major distribution node connecting Lagos to the hinterland.',
    routes: [],
  },
];

// Point in polygon test for filling Nigeria with matrix dots
function isPointInNigeria(lon: number, lat: number): boolean {
  let inside = false;
  const vs = NIGERIA_BORDER_GEO;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function GlobeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.32, y: 0 }); // Isometric perspective tilt
  const OVERVIEW_CAM = { x: 0, y: -0.15, z: 6.8 }; // Comfortable zoomed-out overview showing all edges
  const targetCamPos = useRef<{ x: number; y: number; z: number }>({ ...OVERVIEW_CAM });
  const currentCamPos = useRef<{ x: number; y: number; z: number }>({ ...OVERVIEW_CAM });
  const targetLookAt = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const currentLookAt = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null);

  // Zoom to a city on the 3D Nigeria Map
  const zoomToCity = (cityId: string | null) => {
    if (!cityId) {
      setSelectedCity(null);
      targetCamPos.current = { ...OVERVIEW_CAM };
      targetLookAt.current = { x: 0, y: 0, z: 0 };
      rotRef.current = { x: 0.32, y: 0 };
      return;
    }

    const city = CITIES.find((c) => c.id === cityId);
    if (!city) return;

    setSelectedCity(city);
    const [cx, cy] = geoTo3D(city.lon, city.lat, 0);

    // Zoom camera in tight directly above and slightly tilted towards the selected city
    // Offset slightly so the city sits on the left, leaving room for the HUD card on the right
    targetCamPos.current = {
      x: cx + 0.3,
      y: cy - 0.45,
      z: 1.55,
    };
    targetLookAt.current = {
      x: cx - 0.1,
      y: cy,
      z: 0.05,
    };
    rotRef.current = { x: 0.45, y: -0.08 };
  };

  useEffect(() => {
    let THREE: typeof import('three');

    async function init() {
      THREE = await import('three');

      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      const updateSize = () => {
        if (!canvas.parentElement) return;
        const W = canvas.parentElement.clientWidth;
        const H = canvas.parentElement.clientHeight;
        renderer.setSize(W, H);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
      };

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(currentCamPos.current.x, currentCamPos.current.y, currentCamPos.current.z);
      camera.lookAt(0, 0, 0);

      updateSize();

      // ── 3D MAP ROOT GROUP (for interactive drag tilt) ──
      const mapRoot = new THREE.Group();
      scene.add(mapRoot);

      // ── 01. NIGERIA EXTRUDED / WIREFRAME PERIMETER BORDER ──
      const borderPoints: THREE.Vector3[] = [];
      const borderExtrudedPoints: THREE.Vector3[] = [];
      const borderSegments: number[] = [];

      NIGERIA_BORDER_GEO.forEach(([lon, lat]) => {
        const [x, y] = geoTo3D(lon, lat, 0.04);
        borderPoints.push(new THREE.Vector3(x, y, 0.04));
        borderExtrudedPoints.push(new THREE.Vector3(x, y, -0.15)); // 3D depth base
      });

      // Top glowing border
      const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
      const borderMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        linewidth: 2,
      });
      const borderLine = new THREE.LineLoop(borderGeo, borderMat);
      mapRoot.add(borderLine);

      // Bottom border line for 3D slab effect
      const baseBorderGeo = new THREE.BufferGeometry().setFromPoints(borderExtrudedPoints);
      const baseBorderMat = new THREE.LineBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.4,
      });
      const baseBorderLine = new THREE.LineLoop(baseBorderGeo, baseBorderMat);
      mapRoot.add(baseBorderLine);

      // Vertical 3D boundary struts (slab edges)
      for (let i = 0; i < borderPoints.length; i += 2) {
        borderSegments.push(
          borderPoints[i].x, borderPoints[i].y, borderPoints[i].z,
          borderExtrudedPoints[i].x, borderExtrudedPoints[i].y, borderExtrudedPoints[i].z
        );
      }
      const strutGeo = new THREE.BufferGeometry();
      strutGeo.setAttribute('position', new THREE.Float32BufferAttribute(borderSegments, 3));
      const strutMat = new THREE.LineSegments(strutGeo, new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.35,
      }));
      mapRoot.add(strutMat);

      // ── 02. DENSE INTERNAL MATRIX PARTICLES (FILLED NIGERIA MAP) ──
      const dotPositions: number[] = [];
      const dotColors: number[] = [];
      const step = 0.16; // Grid resolution

      for (let lon = MIN_LON; lon <= MAX_LON; lon += step) {
        for (let lat = MIN_LAT; lat <= MAX_LAT; lat += step) {
          if (isPointInNigeria(lon, lat)) {
            const [x, y] = geoTo3D(lon, lat, 0.02);

            // Subtle elevation near central plateau (Jos) and eastern highlands
            const elev = Math.sin((lon - 7) * 0.4) * Math.sin((lat - 8) * 0.4) * 0.05;
            dotPositions.push(x, y, 0.02 + Math.max(0, elev));

            // Proximity to Lagos or Abuja gives brighter glow
            const dLagos = Math.hypot(lon - 3.38, lat - 6.52);
            const dAbuja = Math.hypot(lon - 7.4, lat - 9.08);
            const brightness = Math.min(1.0, 0.22 + 0.55 / (1 + dLagos * 0.8) + 0.45 / (1 + dAbuja * 0.8));

            dotColors.push(brightness, brightness, brightness);
          }
        }
      }

      const dotGeo = new THREE.BufferGeometry();
      dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
      dotGeo.setAttribute('color', new THREE.Float32BufferAttribute(dotColors, 3));

      const dotMat = new THREE.PointsMaterial({
        size: 0.028,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });
      const dots = new THREE.Points(dotGeo, dotMat);
      mapRoot.add(dots);

      // ── 03. NIGER & BENUE RIVER NETWORK (THE CONFLUENCE "Y") ──
      const buildRiver = (coords: [number, number][], color = 0x555555) => {
        const pts = coords.map(([lon, lat]) => {
          const [x, y] = geoTo3D(lon, lat, 0.03);
          return new THREE.Vector3(x, y, 0.03);
        });
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 });
        return new THREE.Line(geo, mat);
      };

      const riverNigerLine = buildRiver(RIVER_NIGER, 0x666666);
      const riverBenueLine = buildRiver(RIVER_BENUE, 0x666666);
      mapRoot.add(riverNigerLine);
      mapRoot.add(riverBenueLine);

      // ── 04. 3D ARTERIAL HIGHWAY CORRIDORS (ELECTRIC HIGHWAYS) ──
      function buildHighwayArc(c1: CityInfo, c2: CityInfo, height = 0.28) {
        const [x1, y1] = geoTo3D(c1.lon, c1.lat, 0.05);
        const [x2, y2] = geoTo3D(c2.lon, c2.lat, 0.05);

        const v1 = new THREE.Vector3(x1, y1, 0.05);
        const v2 = new THREE.Vector3(x2, y2, 0.05);
        const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
        mid.z += height; // Arc rises into 3D space above the map

        const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
        const pts = curve.getPoints(50);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.55,
        });
        return { line: new THREE.Line(geo, mat), curve };
      }

      const lagosCity = CITIES.find((c) => c.id === 'lagos')!;
      const abujaCity = CITIES.find((c) => c.id === 'abuja')!;
      const kanoCity = CITIES.find((c) => c.id === 'kano')!;
      const ibadanCity = CITIES.find((c) => c.id === 'ibadan')!;
      const phCity = CITIES.find((c) => c.id === 'portharcourt')!;

      const arcLagosAbuja = buildHighwayArc(lagosCity, abujaCity, 0.32);
      const arcAbujaKano = buildHighwayArc(abujaCity, kanoCity, 0.24);
      const arcLagosIbadan = buildHighwayArc(lagosCity, ibadanCity, 0.12);
      const arcAbujaPH = buildHighwayArc(abujaCity, phCity, 0.25);

      mapRoot.add(arcLagosAbuja.line);
      mapRoot.add(arcAbujaKano.line);
      mapRoot.add(arcLagosIbadan.line);
      mapRoot.add(arcAbujaPH.line);

      // Energy pulse traveling along Lagos ⇄ Abuja highway
      const pulseGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      mapRoot.add(pulseMesh);

      // ── 05. CITY MARKERS & HITBOXES ──
      const cityGroup = new THREE.Group();
      const clickablePins: { mesh: THREE.Mesh; city: CityInfo }[] = [];

      for (const city of CITIES) {
        const [cx, cy] = geoTo3D(city.lon, city.lat, 0.05);

        // Core Pin Dot
        const pinG = new THREE.CylinderGeometry(0.02 * city.size, 0.005, 0.14, 16);
        pinG.rotateX(Math.PI / 2);
        const pinM = new THREE.MeshBasicMaterial({ color: new THREE.Color(city.color) });
        const pin = new THREE.Mesh(pinG, pinM);
        pin.position.set(cx, cy, 0.1);
        cityGroup.add(pin);

        // Invisible larger sphere for raycast click
        const hitG = new THREE.SphereGeometry(0.22 * city.size, 8, 8);
        const hitM = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitG, hitM);
        hitMesh.position.set(cx, cy, 0.1);
        cityGroup.add(hitMesh);
        clickablePins.push({ mesh: hitMesh, city });

        // Pulse concentric rings (Lagos and Abuja)
        if (city.size > 1) {
          const ringG = new THREE.RingGeometry(0.06 * city.size, 0.075 * city.size, 32);
          const ringM = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
          });
          const ring = new THREE.Mesh(ringG, ringM);
          ring.position.set(cx, cy, 0.06);
          cityGroup.add(ring);

          const ring2G = new THREE.RingGeometry(0.1 * city.size, 0.112 * city.size, 32);
          const ring2M = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
          });
          const ring2 = new THREE.Mesh(ring2G, ring2M);
          ring2.position.set(cx, cy, 0.06);
          cityGroup.add(ring2);
        }
      }
      mapRoot.add(cityGroup);

      // ── 06. UNDER-MAP TECH GROUND PLANE ──
      const groundGrid = new THREE.GridHelper(9, 36, 0x222222, 0x111111);
      groundGrid.rotation.x = Math.PI / 2;
      groundGrid.position.z = -0.16;
      mapRoot.add(groundGrid);

      // ── 07. RAYCASTING ON CLICK ──
      const raycaster = new THREE.Raycaster();
      const mouseVec = new THREE.Vector2();

      const onCanvasClick = (e: MouseEvent) => {
        const distMoved = Math.hypot(e.clientX - lastMouse.current.x, e.clientY - lastMouse.current.y);
        if (distMoved > 8) return;

        const rect = canvas.getBoundingClientRect();
        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        raycaster.setFromCamera(mouseVec, camera);
        const hits = raycaster.intersectObjects(clickablePins.map((p) => p.mesh));

        if (hits.length > 0) {
          const found = clickablePins.find((p) => p.mesh === hits[0].object);
          if (found) {
            zoomToCity(found.city.id);
          }
        }
      };

      // ── Event Handlers ──
      let downPos = { x: 0, y: 0 };
      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) {
          mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 0.25;
          mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 0.25;
        } else {
          const dx = e.clientX - lastMouse.current.x;
          const dy = e.clientY - lastMouse.current.y;
          rotRef.current.y += dx * 0.005;
          rotRef.current.x += dy * 0.005;
          lastMouse.current = { x: e.clientX, y: e.clientY };
        }
      };

      const onMouseDown = (e: MouseEvent) => {
        isDragging.current = true;
        downPos = { x: e.clientX, y: e.clientY };
        lastMouse.current = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = (e: MouseEvent) => {
        isDragging.current = false;
        const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
        if (dist < 6) {
          onCanvasClick(e);
        }
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * 0.0035;
        targetCamPos.current.z = Math.max(1.3, Math.min(8.5, targetCamPos.current.z + delta));
      };

      window.addEventListener('resize', updateSize);
      canvas.addEventListener('wheel', onWheel, { passive: false });
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);

      // ── Animation Loop ──
      let t = 0;

      function animate() {
        animRef.current = requestAnimationFrame(animate);
        t += 0.015;

        // Camera Smooth Position Lerp
        currentCamPos.current.x += (targetCamPos.current.x - currentCamPos.current.x) * 0.07;
        currentCamPos.current.y += (targetCamPos.current.y - currentCamPos.current.y) * 0.07;
        currentCamPos.current.z += (targetCamPos.current.z - currentCamPos.current.z) * 0.07;
        camera.position.set(currentCamPos.current.x, currentCamPos.current.y, currentCamPos.current.z);

        // Camera Smooth LookAt Lerp
        currentLookAt.current.x += (targetLookAt.current.x - currentLookAt.current.x) * 0.07;
        currentLookAt.current.y += (targetLookAt.current.y - currentLookAt.current.y) * 0.07;
        currentLookAt.current.z += (targetLookAt.current.z - currentLookAt.current.z) * 0.07;
        camera.lookAt(currentLookAt.current.x, currentLookAt.current.y, currentLookAt.current.z);

        // Map Rotation / Perspective Tilt
        const tiltX = rotRef.current.x + mouseRef.current.y * 0.4;
        const tiltY = rotRef.current.y + mouseRef.current.x * 0.4;
        mapRoot.rotation.x = -tiltX;
        mapRoot.rotation.z = tiltY;

        // Pulse travel along Lagos ⇄ Abuja highway
        const progress = (Math.sin(t * 1.5) + 1) / 2;
        const pulsePos = arcLagosAbuja.curve.getPoint(progress);
        pulseMesh.position.copy(pulsePos);

        // Pulse city marker rings
        cityGroup.children.forEach((child, i) => {
          const mesh = child as THREE.Mesh;
          if (mesh.material instanceof THREE.MeshBasicMaterial && mesh.geometry instanceof THREE.RingGeometry) {
            mesh.material.opacity = 0.2 + Math.abs(Math.sin(t * 1.8 + i * 0.5)) * 0.6;
            const s = 1 + Math.abs(Math.sin(t * 1.4 + i)) * 0.18;
            mesh.scale.setScalar(s);
          }
        });

        renderer.render(scene, camera);
      }

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
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mousedown', onMouseDown);
        renderer.dispose();
      };
    }

    const cleanup = init();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, []);

  return (
    <div className={styles.wrap}>
      {/* ── Top Controls Bar: City Selector Pills ── */}
      <div className={styles.controllerBar}>
        <button
          type="button"
          onClick={() => zoomToCity(null)}
          className={`${styles.pillBtn} ${!selectedCity ? styles.pillBtnActive : ''}`}
        >
          <span className={styles.pillIcon}>🗺️</span>
          <span>Nigeria Map (Full Overview)</span>
        </button>
        <button
          type="button"
          onClick={() => zoomToCity('lagos')}
          className={`${styles.pillBtn} ${selectedCity?.id === 'lagos' ? styles.pillBtnActive : ''}`}
        >
          <span className={styles.pulseDot} />
          <span>Zoom: Lagos Commercial Hub</span>
        </button>
        <button
          type="button"
          onClick={() => zoomToCity('abuja')}
          className={`${styles.pillBtn} ${selectedCity?.id === 'abuja' ? styles.pillBtnActive : ''}`}
        >
          <span className={styles.pulseDot} />
          <span>Zoom: Abuja Federal Hub</span>
        </button>
      </div>

      {/* ── Three.js WebGL Canvas ── */}
      <canvas ref={canvasRef} className={styles.canvas} data-cursor-text="🗺️ TILT / ZOOM" />

      {/* ── Interactive City Telemetry & Vector Map Card (Zoomed View) ── */}
      {selectedCity && (
        <div className={styles.cityDetailModal}>
          <div className={styles.cityHeader}>
            <div className={styles.cityBadge}>
              <span className={styles.pulseDotGreen} />
              <span>{selectedCity.tag}</span>
            </div>
            <button
              type="button"
              onClick={() => zoomToCity(null)}
              className={styles.closeBtn}
              title="Reset view to full Nigeria map"
            >
              ✕ RESET VIEW
            </button>
          </div>

          <div className={styles.cityBody}>
            <div className={styles.cityTitleRow}>
              <h3 className={styles.cityName}>{selectedCity.name}</h3>
              <span className={styles.latLon}>
                LAT {selectedCity.lat.toFixed(4)}° N // LON {selectedCity.lon.toFixed(4)}° E
              </span>
            </div>

            <p className={styles.cityDesc}>{selectedCity.desc}</p>

            {/* Futuristic Vector Road Network Schematic */}
            <div className={styles.schematicBox}>
              <div className={styles.schematicHead}>
                <span>RADIAL MOBILITY CORRIDORS // SCHEMATIC</span>
                <span>STATUS: LIVE</span>
              </div>

              <svg className={styles.schematicSvg} viewBox="0 0 320 120">
                <defs>
                  <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="10" y1="30" x2="310" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="10" y1="60" x2="310" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="10" y1="90" x2="310" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

                {selectedCity.id === 'lagos' ? (
                  <>
                    {/* Lekki - VI - Mainland Arteries */}
                    <path d="M 20 90 Q 90 40, 160 55 T 300 25" fill="none" stroke="url(#corridorGlow)" strokeWidth="2.5" />
                    <path d="M 30 105 Q 120 75, 200 80 T 290 60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                    <circle cx="160" cy="55" r="4" fill="#fff" />
                    <circle cx="160" cy="55" r="8" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
                    <text x="170" y="58" fill="#fff" fontSize="8" fontFamily="var(--font-techno)" letterSpacing="1">
                      VI / LEKKI HUB (01)
                    </text>

                    <circle cx="90" cy="40" r="3.5" fill="#fff" />
                    <text x="70" y="30" fill="#aaa" fontSize="7" fontFamily="var(--font-techno)">
                      3RD MAINLAND
                    </text>

                    <circle cx="270" cy="30" r="3.5" fill="#fff" />
                    <text x="235" y="20" fill="#aaa" fontSize="7" fontFamily="var(--font-techno)">
                      IKEJA AIRPORT
                    </text>
                  </>
                ) : (
                  <>
                    {/* Abuja CBD - Airport - Maitama Rings */}
                    <circle cx="160" cy="60" r="38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
                    <circle cx="160" cy="60" r="22" fill="none" stroke="url(#corridorGlow)" strokeWidth="2" />
                    <line x1="20" y1="60" x2="300" y2="60" stroke="url(#corridorGlow)" strokeWidth="2" />
                    <line x1="160" y1="10" x2="160" y2="110" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

                    <circle cx="160" cy="60" r="4.5" fill="#fff" />
                    <circle cx="160" cy="60" r="9" fill="none" stroke="#fff" strokeWidth="1" opacity="0.7" />
                    <text x="172" y="63" fill="#fff" fontSize="8" fontFamily="var(--font-techno)" letterSpacing="1">
                      CBD CENTRAL (01)
                    </text>

                    <circle cx="60" cy="60" r="3.5" fill="#fff" />
                    <text x="35" y="50" fill="#aaa" fontSize="7" fontFamily="var(--font-techno)">
                      AIRPORT RD
                    </text>

                    <circle cx="160" cy="20" r="3.5" fill="#fff" />
                    <text x="170" y="23" fill="#aaa" fontSize="7" fontFamily="var(--font-techno)">
                      MAITAMA
                    </text>
                  </>
                )}
              </svg>
            </div>

            {/* Live Metrics Grid */}
            <div className={styles.telemetryGrid}>
              <div className={styles.telBox}>
                <span className={styles.telBoxLabel}>ACTIVE SHUGA EVS</span>
                <span className={styles.telBoxNum}>{selectedCity.activeEVs}</span>
              </div>
              <div className={styles.telBox}>
                <span className={styles.telBoxLabel}>CHARGING HUBS</span>
                <span className={styles.telBoxNum}>{selectedCity.chargingHubs}</span>
              </div>
              <div className={styles.telBox}>
                <span className={styles.telBoxLabel}>GRID EFFICIENCY</span>
                <span className={styles.telBoxNum}>{selectedCity.peakEfficiency}</span>
              </div>
            </div>

            {/* Active Corridors list */}
            <div className={styles.corridorsList}>
              <span className={styles.corridorHead}>PRIMARY ELECTRIFIED ARTERIES:</span>
              <ul>
                {selectedCity.corridors.map((c, i) => (
                  <li key={i}>
                    <span className={styles.corridorIcon}>⚡</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Default Hint (when no city is selected) ── */}
      {!selectedCity && (
        <div className={styles.globeHint}>
          <span className={styles.pulseDot} />
          <span>3D NIGERIA MAP // DRAG TO TILT • CLICK LAGOS OR ABUJA TO ZOOM IN</span>
        </div>
      )}
    </div>
  );
}
