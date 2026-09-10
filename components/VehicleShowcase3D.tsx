'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './VehicleShowcase3D.module.css';

interface ColorFinish {
  id: string;
  name: string;
  hex: string;
  filterStyle: string;
  accentColor: string;
}

const COLOR_FINISHES: ColorFinish[] = [
  {
    id: 'obsidian-black',
    name: 'Obsidian Black Metallic',
    hex: '#111114',
    filterStyle: 'brightness(1) contrast(1.05)',
    accentColor: '#ffffff',
  },
  {
    id: 'glacier-white',
    name: 'Glacier White Pearl',
    hex: '#e8eaf0',
    filterStyle: 'brightness(1.55) contrast(0.95) saturate(0.2)',
    accentColor: '#e0e4f0',
  },
  {
    id: 'cyber-silver',
    name: 'Cyber Silver Liquid Metal',
    hex: '#8a8e96',
    filterStyle: 'brightness(1.3) contrast(1.1) saturate(0.3)',
    accentColor: '#a0a8b8',
  },
  {
    id: 'midnight-electric',
    name: 'Midnight Electric Blue',
    hex: '#162238',
    filterStyle: 'brightness(1.02) contrast(1.15) hue-rotate(195deg) saturate(1.4)',
    accentColor: '#388bfd',
  },
];

interface SpecHotspot {
  id: string;
  title: string;
  tag: string;
  desc: string;
  top: string;
  left: string;
  stat: string;
}

const HOTSPOTS: SpecHotspot[] = [
  {
    id: 'grille',
    title: 'Crystalline LED Matrix',
    tag: 'AERODYNAMIC FRONT FASCIA',
    desc: 'Parametric geometric illuminated chevron grille with razor-sharp swept-back LED daytime running light wings.',
    top: '64%',
    left: '82%',
    stat: '0.24 Cd AERODYNAMIC EFFICIENCY',
  },
  {
    id: 'battery',
    title: '54 kWh LFP Battery Pack',
    tag: 'STRUCTURAL SKATEBOARD CHASSIS',
    desc: 'High-density Lithium Iron Phosphate cells integrated into the underfloor platform. Zero thermal runaway risk.',
    top: '68%',
    left: '36%',
    stat: '350 KM WLTP RANGE // 35 MIN CHARGE',
  },
  {
    id: 'wheels',
    title: 'Two-Tone Turbine Blades',
    tag: 'AERO-OPTIMIZED ALLOY RIMS',
    desc: '19-inch directional turbine blades engineered to minimize turbulence and extend high-speed highway range.',
    top: '76%',
    left: '52%',
    stat: '19" FORGED ALLOY // LOW-ROLLING RESISTANCE',
  },
  {
    id: 'cockpit',
    title: 'Smart Fleet Cockpit',
    tag: 'CONNECTED AUTONOMOUS TELEMETRY',
    desc: 'Integrated GPS tracking, automated Shuga Ride fare metering, and live battery health monitoring.',
    top: '32%',
    left: '56%',
    stat: 'REAL-TIME TELEMETRY // OVER-THE-AIR UPDATES',
  },
];

export default function VehicleShowcase3D() {
  const [selectedFinish, setSelectedFinish] = useState<ColorFinish>(COLOR_FINISHES[0]);
  const [headlightsOn, setHeadlightsOn] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<SpecHotspot | null>(null);

  // Drag rotation angle (0 to 360)
  const [rotationAngle, setRotationAngle] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startAngle = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto rotation loop
  useEffect(() => {
    if (!autoRotate || isDragging.current) return;

    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.35) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Pointer drag events
  const handlePointerDown = (clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
    startAngle.current = rotationAngle;
  };

  const handlePointerMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const deltaX = clientX - startX.current;
    // Map pixels to rotation degrees
    const newAngle = (startAngle.current + deltaX * 0.35 + 3600) % 360;
    setRotationAngle(newAngle);
  }, []);

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX);
    const onMouseUp = () => handlePointerUp();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handlePointerMove]);

  // Derive subtle turntable perspective tilt based on rotation angle
  const turnPerspective = Math.sin((rotationAngle * Math.PI) / 180) * 8;
  const turnScale = 1 + Math.cos((rotationAngle * Math.PI) / 180) * 0.02;

  return (
    <div
      ref={containerRef}
      className={styles.studioWrapper}
      data-cursor-text="360° DRAG ORBIT"
      onMouseDown={(e) => handlePointerDown(e.clientX)}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
      onTouchEnd={handlePointerUp}
    >
      {/* ── Top Telemetry Bar ── */}
      <div className={styles.hudTop}>
        <div className={styles.hudBadge}>
          <span className={styles.pulseDot} />
          <span>SHUGA EV-1 // 360° DIGITAL TWIN</span>
        </div>

        <div className={styles.hudControls}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAutoRotate(!autoRotate);
            }}
            className={`${styles.hudBtn} ${autoRotate ? styles.hudBtnActive : ''}`}
          >
            <span>{autoRotate ? '⏸ PAUSE ROTATE' : '▶ AUTO-ROTATE'}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHeadlightsOn(!headlightsOn);
            }}
            className={`${styles.hudBtn} ${headlightsOn ? styles.hudBtnActive : ''}`}
          >
            <span>{headlightsOn ? '💡 LED LIGHTS ON' : '🌑 LIGHTS OFF'}</span>
          </button>
        </div>
      </div>

      {/* ── Showroom Turntable Stage ── */}
      <div className={styles.stageArea}>
        {/* Turntable Floor Platform Rings */}
        <div className={styles.turntableBase}>
          <div className={styles.turntableOuterRing} />
          <div className={styles.turntableInnerRing} />
          <div className={styles.turntableCoreGlow} />
        </div>

        {/* Photorealistic Vehicle Presentation Container */}
        <div
          className={styles.carPresentation}
          style={{
            transform: `perspective(1200px) rotateY(${turnPerspective}deg) scale(${turnScale})`,
          }}
        >
          {/* Photorealistic Vehicle Image with custom SHUGA FLEET branding */}
          <div
            className={styles.carImageLayer}
            style={{
              filter: selectedFinish.filterStyle,
            }}
          >
            <Image
              src="/shuga-ev-crossover.jpg"
              alt="SHUGA FLEET luxury electric crossover with custom SHUGA FLEET license plate and body branding"
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1400px"
              className={styles.carImage}
            />
          </div>

          {/* Illuminated Headlight & Crystalline Grille Glow Overlay */}
          {headlightsOn && (
            <div className={styles.headlightBeamGlow} aria-hidden="true" />
          )}

          {/* Interactive Inspection Hotspots */}
          {HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(activeHotspot?.id === spot.id ? null : spot);
              }}
              className={`${styles.hotspotPin} ${activeHotspot?.id === spot.id ? styles.hotspotPinActive : ''}`}
              style={{ top: spot.top, left: spot.left }}
              title={spot.title}
            >
              <span className={styles.hotspotPulse} />
              <span className={styles.hotspotCenter} />
              <span className={styles.hotspotLabel}>{spot.title}</span>
            </button>
          ))}
        </div>

        {/* Active Hotspot Telemetry Card Popup */}
        {activeHotspot && (
          <div className={styles.hotspotModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTag}>{activeHotspot.tag}</span>
              <button
                type="button"
                onClick={() => setActiveHotspot(null)}
                className={styles.modalClose}
              >
                ✕
              </button>
            </div>
            <h4 className={styles.modalTitle}>{activeHotspot.title}</h4>
            <p className={styles.modalDesc}>{activeHotspot.desc}</p>
            <div className={styles.modalStat}>
              <span className={styles.statIcon}>⚡</span>
              <span>{activeHotspot.stat}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Controls Bar ── */}
      <div className={styles.hudBottom}>
        {/* Color Switcher Palette */}
        <div className={styles.paletteContainer} onClick={(e) => e.stopPropagation()}>
          <span className={styles.paletteTitle}>FACTORY FINISH // {selectedFinish.name.toUpperCase()}</span>
          <div className={styles.palettePills}>
            {COLOR_FINISHES.map((finish) => (
              <button
                key={finish.id}
                type="button"
                onClick={() => setSelectedFinish(finish)}
                className={`${styles.finishButton} ${selectedFinish.id === finish.id ? styles.finishButtonActive : ''}`}
                style={{ backgroundColor: finish.hex }}
                title={finish.name}
              >
                <span className={styles.srOnly}>{finish.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Specs Grid */}
        <div className={styles.specsBar}>
          <div className={styles.specBox}>
            <span className={styles.specValue}>350 <small>KM</small></span>
            <span className={styles.specLabel}>WLTP RANGE</span>
          </div>
          <div className={styles.specBox}>
            <span className={styles.specValue}>54 <small>KWH</small></span>
            <span className={styles.specLabel}>LFP BATTERY</span>
          </div>
          <div className={styles.specBox}>
            <span className={styles.specValue}>35 <small>MIN</small></span>
            <span className={styles.specLabel}>20–80% FAST CHARGE</span>
          </div>
          <div className={styles.specBox}>
            <span className={styles.specValue}>6.5 <small>S</small></span>
            <span className={styles.specLabel}>0–100 KM/H</span>
          </div>
        </div>

        {/* CTA Application Link */}
        <div className={styles.ctaGroup} onClick={(e) => e.stopPropagation()}>
          <Link href="/contact" className="btn btn--white" data-cursor>
            Apply for this Shuga Car
          </Link>
        </div>
      </div>

      {/* Interactive Helper Hint */}
      <div className={styles.bottomHint}>
        <span>DRAG HORIZONTALLY TO ROTATE 360° • CLICK HOTSPOT PINS TO INSPECT POWERTRAIN</span>
      </div>
    </div>
  );
}
