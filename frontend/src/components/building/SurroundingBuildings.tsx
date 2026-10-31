import { useMemo } from 'react';
import * as THREE from 'three';
import { Edges, Text } from '@react-three/drei';
import { useSiteStore } from '../../store/siteStore';
import { resolveMicroMarket } from '../../engine/neighborhoodContext';
import type { UrbanArchetype } from '../../types';

interface SurroundingBuildingsProps {
  plotW: number;
  plotD: number;
  roadWidth: number;
  coordinates: { lat: number; lng: number };
  address: string;
}

interface BuildingDef {
  id: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  floors: number;
  type: 'office' | 'residential' | 'commercial' | 'villa' | 'tech';
  baseColor: string;
  edgeColor: string;
  slabColor: string;
  hasPodium?: boolean;
  podiumW?: number;
  podiumD?: number;
  podiumH?: number;
  hasRooftop?: boolean;
  roofW?: number;
  roofD?: number;
  roofH?: number;
  hasHelipad?: boolean;
  hasBeacon?: boolean;
  landmarkLabel?: string;
  rotationY?: number;
}

interface TreeDef {
  x: number;
  z: number;
  scale: number;
  foliageColor: string;
}

interface PoolDef {
  x: number;
  z: number;
  w: number;
  d: number;
}

interface RoadMarkingDef {
  x: number;
  z: number;
  w: number;
  d: number;
}

// Robust deterministic pseudo-random generator
function deterministicRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

export function SurroundingBuildings({
  plotW,
  plotD,
  roadWidth,
  coordinates,
  address,
}: SurroundingBuildingsProps) {
  const forcedArchetype = useSiteStore((s) => s.surroundingArchetype);

  // 1. Resolve micro-market from coordinates and address
  const marketInfo = useMemo(() => {
    return resolveMicroMarket(coordinates, address, forcedArchetype);
  }, [coordinates.lat, coordinates.lng, address, forcedArchetype]);

  const archetype: UrbanArchetype = marketInfo.archetype;

  // 2. Procedurally generate surroundings uniquely seeded by coordinates
  const { buildings, trees, pools, roadMarkings, sideStreets } = useMemo(() => {
    // Unique seed from coordinates: sensitive to even minute coordinate changes
    const coordSeed = Math.abs(
      Math.sin(coordinates.lat * 1234.567 + coordinates.lng * 4321.765) * 100000
    );

    const halfW = plotW / 2;
    const halfD = plotD / 2;
    const streetZ = halfD + roadWidth / 2 + 0.1;

    const bldgs: BuildingDef[] = [];
    const treeItems: TreeDef[] = [];
    const poolItems: PoolDef[] = [];
    const markings: RoadMarkingDef[] = [];
    const sideStreetItems: { x: number; z: number; w: number; d: number }[] = [];

    // Micro-Market Specific Architectural Parameters
    let heightMultiplier = 1.0;
    let minFloors = 12;
    let maxFloors = 24;
    let isVilla = false;
    let isSkyscraper = false;
    let isTech = false;
    let treeDensityMultiplier = 1.0;

    switch (archetype) {
      case 'SKYSCRAPERS':
        heightMultiplier = 1.65;
        minFloors = 28;
        maxFloors = 54;
        isSkyscraper = true;
        treeDensityMultiplier = 0.8;
        break;
      case 'LOW_RISE_VILLAS':
        heightMultiplier = 0.35;
        minFloors = 2;
        maxFloors = 4;
        isVilla = true;
        treeDensityMultiplier = 2.8;
        break;
      case 'TECH_CAMPUS':
        heightMultiplier = 1.25;
        minFloors = 16;
        maxFloors = 28;
        isTech = true;
        treeDensityMultiplier = 1.2;
        break;
      case 'TOWNSHIP_CLUSTERS':
        heightMultiplier = 1.15;
        minFloors = 18;
        maxFloors = 32;
        treeDensityMultiplier = 1.1;
        break;
      case 'COMMERCIAL':
      default:
        heightMultiplier = 0.85;
        minFloors = 8;
        maxFloors = 18;
        treeDensityMultiplier = 0.9;
        break;
    }

    // Palette per archetype
    const getColors = (seed: number, isLandmark = false) => {
      const r = deterministicRandom(seed);
      if (isVilla) {
        // Luxury stone, terracotta, warm clay
        const bases = ['#2C2621', '#3A322C', '#453B34', '#342F2D'];
        const edges = ['#9E7B5C', '#87694E', '#B38D6A', '#6D5B4D'];
        const slabs = ['#5E4F43', '#4E4137', '#736152', '#3D342E'];
        const idx = Math.floor(r * bases.length);
        return { baseColor: bases[idx], edgeColor: edges[idx], slabColor: slabs[idx] };
      }
      if (isSkyscraper) {
        // Sleek cyan-tinted glass curtain wall and reflective deep sapphire
        const bases = ['#111927', '#0F1D2C', '#132130', '#0E1722'];
        const edges = isLandmark ? ['#00F0FF', '#38BDF8', '#60A5FA'] : ['#3B82F6', '#475569', '#38BDF8'];
        const slabs = ['#1E3A5F', '#1E293B', '#2563EB', '#0F2B48'];
        const idx = Math.floor(r * bases.length);
        const eIdx = Math.floor(r * edges.length);
        return { baseColor: bases[idx], edgeColor: edges[eIdx], slabColor: slabs[idx] };
      }
      if (isTech) {
        // Modern charcoal tech park & corporate graphite with bronze accents
        const bases = ['#181F2A', '#1C2433', '#151C26', '#20293A'];
        const edges = ['#526B8A', '#64748B', '#0EA5E9', '#475569'];
        const slabs = ['#334155', '#243247', '#1E293B', '#3E506B'];
        const idx = Math.floor(r * bases.length);
        return { baseColor: bases[idx], edgeColor: edges[idx], slabColor: slabs[idx] };
      }
      // Residential / Commercial default
      const bases = ['#1A202C', '#1E2430', '#212836', '#171B24'];
      const edges = ['#4A5568', '#5A677D', '#64748B', '#3E495A'];
      const slabs = ['#2D3748', '#384357', '#333D4F', '#242C3A'];
      const idx = Math.floor(r * bases.length);
      return { baseColor: bases[idx], edgeColor: edges[idx], slabColor: slabs[idx] };
    };

    // ─── Urban Sectors Generation ───
    // Sector 1: North / Rear of site
    // Sector 2: West / Left flank
    // Sector 3: East / Right flank
    // Sector 4: South / Across front avenue
    // Sector 5: Outer Corner Landmarks

    const landmarkNames = marketInfo.landmarkNames || [];
    let landmarkIndex = 0;

    // Helper to generate a contextual building
    const addBuilding = (
      id: string,
      baseX: number,
      baseZ: number,
      baseW: number,
      baseD: number,
      slotSeed: number,
      isMajor = false
    ) => {
      const r1 = deterministicRandom(slotSeed);
      const r2 = deterministicRandom(slotSeed + 13.37);
      const r3 = deterministicRandom(slotSeed + 29.81);

      // Coordinate-jittered footprint
      const jitterX = (r1 - 0.5) * 1.8;
      const jitterZ = (r2 - 0.5) * 1.8;
      const w = baseW * (0.85 + r1 * 0.35);
      const d = baseD * (0.85 + r2 * 0.35);

      let floors = Math.floor(minFloors + r3 * (maxFloors - minFloors + 1));
      if (isMajor && isSkyscraper) floors = Math.min(54, floors + 8);
      floors = Math.max(2, Math.min(floors, 54));

      const floorHeightM = isVilla ? 0.65 : 0.45;
      const h = floors * floorHeightM * heightMultiplier;

      const colors = getColors(slotSeed, isMajor);

      let landmarkLabel: string | undefined = undefined;
      if (isMajor && landmarkIndex < landmarkNames.length) {
        landmarkLabel = `${landmarkNames[landmarkIndex]} (${floors}F)`;
        landmarkIndex++;
      }

      // Podiums for high-rises and tech parks
      const hasPodium = (isSkyscraper || isTech) && h > 6.0;
      const podiumW = hasPodium ? w * 1.35 : undefined;
      const podiumD = hasPodium ? d * 1.35 : undefined;
      const podiumH = hasPodium ? 0.9 : undefined;

      // Rooftop helipad on tallest skyscraper
      const hasHelipad = isSkyscraper && floors >= 42;
      const hasBeacon = isSkyscraper && floors >= 38;

      bldgs.push({
        id,
        x: baseX + jitterX,
        z: baseZ + jitterZ,
        w,
        d,
        h,
        floors,
        type: isVilla ? 'villa' : isTech ? 'tech' : isSkyscraper ? 'office' : 'residential',
        baseColor: colors.baseColor,
        edgeColor: colors.edgeColor,
        slabColor: colors.slabColor,
        hasPodium,
        podiumW,
        podiumD,
        podiumH,
        hasRooftop: !isVilla && h > 4.0,
        roofW: w * 0.42,
        roofD: d * 0.42,
        roofH: Math.min(1.4, h * 0.1),
        hasHelipad,
        hasBeacon,
        landmarkLabel,
      });

      // If villa, add private pool or courtyard occasionally
      if (isVilla && r1 > 0.45 && poolItems.length < 3) {
        poolItems.push({
          x: baseX + jitterX + (r2 > 0.5 ? w / 2 + 1.2 : -w / 2 - 1.2),
          z: baseZ + jitterZ,
          w: 2.2,
          d: 1.5,
        });
      }
    };

    // ── North Flank (Rear) ──
    const northCount = isVilla ? 4 : 3;
    for (let i = 0; i < northCount; i++) {
      const offsetFactor = (i - (northCount - 1) / 2) * (halfW * 0.9);
      addBuilding(
        `n-${i}`,
        offsetFactor,
        -halfD - 5.5 - (i % 2) * 3.5,
        isVilla ? 4.2 : 5.8,
        isVilla ? 3.8 : 5.2,
        coordSeed + i * 17.1,
        i === 1
      );
    }

    // ── West Flank (Left) ──
    const westCount = isVilla ? 3 : 2;
    for (let i = 0; i < westCount; i++) {
      const zPos = (i - (westCount - 1) / 2) * (halfD * 0.95);
      addBuilding(
        `w-${i}`,
        -halfW - 6.2 - (i % 2) * 3.2,
        zPos,
        isVilla ? 4.0 : 5.4,
        isVilla ? 3.6 : 6.0,
        coordSeed + (i + 10) * 23.3,
        i === 0
      );
    }

    // ── East Flank (Right) ──
    const eastCount = isVilla ? 3 : 2;
    for (let i = 0; i < eastCount; i++) {
      const zPos = (i - (eastCount - 1) / 2) * (halfD * 0.95);
      addBuilding(
        `e-${i}`,
        halfW + 6.2 + (i % 2) * 3.2,
        zPos,
        isVilla ? 4.0 : 5.4,
        isVilla ? 3.6 : 6.0,
        coordSeed + (i + 20) * 31.7,
        i === eastCount - 1
      );
    }

    // ── South Frontage (Across Avenue) ──
    const southCount = isVilla ? 4 : 3;
    for (let i = 0; i < southCount; i++) {
      const offsetFactor = (i - (southCount - 1) / 2) * (halfW * 0.9);
      addBuilding(
        `s-${i}`,
        offsetFactor,
        streetZ + roadWidth / 2 + 5.5 + (i % 2) * 3.0,
        isVilla ? 4.5 : 6.2,
        isVilla ? 4.0 : 5.0,
        coordSeed + (i + 30) * 41.9,
        i === 0 || i === southCount - 1
      );
    }

    // ── Deep Outer Landmarks (City Skyline Backdrop) ──
    if (isSkyscraper || isTech) {
      addBuilding(
        'deep-nw',
        -halfW - 14.0,
        -halfD - 12.0,
        7.5,
        6.5,
        coordSeed + 88.5,
        true
      );
      addBuilding(
        'deep-ne',
        halfW + 14.0,
        -halfD - 13.0,
        8.0,
        7.0,
        coordSeed + 99.2,
        true
      );
      addBuilding(
        'deep-se',
        halfW + 15.0,
        streetZ + roadWidth + 8.0,
        7.2,
        6.8,
        coordSeed + 111.4,
        true
      );
    }

    // ── Side Street Intersections (Creates authentic city block grid) ──
    sideStreetItems.push({
      x: -halfW - 3.2,
      z: 0,
      w: 2.4,
      d: plotD + 26,
    });
    sideStreetItems.push({
      x: halfW + 3.2,
      z: 0,
      w: 2.4,
      d: plotD + 26,
    });

    // ── Road Center Line Markings ──
    const roadLength = plotW + 40;
    const dashCount = Math.floor(roadLength / 3.0);
    for (let i = 0; i < dashCount; i++) {
      markings.push({
        x: -roadLength / 2 + i * 3.0 + 1.0,
        z: streetZ,
        w: 1.6,
        d: 0.12,
      });
    }

    // ── Trees and Greenery Canopy ──
    const treeSpacing = isVilla ? 1.4 : 2.5 / treeDensityMultiplier;
    const treeExtent = halfW + 18;

    for (let x = -treeExtent; x <= treeExtent; x += treeSpacing) {
      // Don't place trees in the plot itself
      if (x > -halfW + 1 && x < halfW - 1) continue;

      const r = deterministicRandom(coordSeed + x * 7.7);
      const foliageColor = isVilla
        ? r > 0.4
          ? '#2E7D32'
          : '#388E3C'
        : r > 0.5
        ? '#1B4D3E'
        : '#235948';

      // North sidewalk tree
      treeItems.push({
        x,
        z: streetZ - roadWidth / 2 - 0.7,
        scale: 0.75 + r * 0.45,
        foliageColor,
      });

      // South sidewalk tree
      treeItems.push({
        x: x + 0.6,
        z: streetZ + roadWidth / 2 + 0.7,
        scale: 0.75 + r * 0.45,
        foliageColor,
      });
    }

    // Additional garden trees in villa zone
    if (isVilla) {
      bldgs.forEach((b, bIdx) => {
        for (let ti = 0; ti < 3; ti++) {
          const tr = deterministicRandom(coordSeed + bIdx * 19.3 + ti * 5.7);
          treeItems.push({
            x: b.x + (tr - 0.5) * (b.w + 2.5),
            z: b.z + (tr - 0.5) * (b.d + 2.5),
            scale: 0.85 + tr * 0.5,
            foliageColor: '#2E7D32',
          });
        }
      });
    }

    return {
      buildings: bldgs,
      trees: treeItems,
      pools: poolItems,
      roadMarkings: markings,
      sideStreets: sideStreetItems,
    };
  }, [
    plotW,
    plotD,
    roadWidth,
    coordinates.lat,
    coordinates.lng,
    address,
    archetype,
    marketInfo,
  ]);

  return (
    <group name="dynamic-location-surroundings">
      {/* ─── Surrounding Buildings ─── */}
      {buildings.map((b) => {
        const floorH = b.h / b.floors;
        const meshKey = `bldg-${coordinates.lat.toFixed(4)}-${coordinates.lng.toFixed(4)}-${b.id}`;

        return (
          <group key={meshKey} position={[b.x, 0, b.z]}>
            {/* Main Building Volume */}
            <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshPhysicalMaterial
                color={b.baseColor}
                roughness={archetype === 'LOW_RISE_VILLAS' ? 0.65 : 0.25}
                metalness={archetype === 'SKYSCRAPERS' ? 0.35 : 0.15}
                clearcoat={archetype === 'SKYSCRAPERS' ? 0.6 : 0.2}
                clearcoatRoughness={0.15}
                transparent
                opacity={archetype === 'LOW_RISE_VILLAS' ? 0.95 : 0.88}
                reflectivity={archetype === 'SKYSCRAPERS' ? 0.65 : 0.35}
              />
            </mesh>

            {/* Architectural Outline Edges */}
            <mesh position={[0, b.h / 2, 0]}>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <Edges threshold={15} color={b.edgeColor} lineWidth={1.3} />
            </mesh>

            {/* Floor Slab Bands */}
            {Array.from({ length: Math.min(b.floors, 22) }, (_, fi) => {
              const slabY = (fi + 1) * floorH;
              if (slabY >= b.h - 0.08) return null;
              return (
                <lineSegments key={`slab-${fi}`} position={[0, slabY, 0]}>
                  <edgesGeometry args={[new THREE.PlaneGeometry(b.w, b.d)]} />
                  <lineBasicMaterial color={b.slabColor} transparent opacity={0.35} />
                </lineSegments>
              );
            })}

            {/* Multi-story Commercial / Tech Podium */}
            {b.hasPodium && b.podiumW && b.podiumD && b.podiumH && (
              <group position={[0, b.podiumH / 2, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[b.podiumW, b.podiumH, b.podiumD]} />
                  <meshStandardMaterial color="#131B26" roughness={0.7} />
                </mesh>
                <mesh>
                  <boxGeometry args={[b.podiumW, b.podiumH, b.podiumD]} />
                  <Edges threshold={15} color="#4A6588" lineWidth={1} />
                </mesh>
              </group>
            )}

            {/* Rooftop Lift Core & Mechanical Equipment */}
            {b.hasRooftop && b.roofW && b.roofD && b.roofH && (
              <group position={[0, b.h + b.roofH / 2, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[b.roofW, b.roofH, b.roofD]} />
                  <meshStandardMaterial color="#161F2C" roughness={0.6} />
                </mesh>
                <mesh>
                  <boxGeometry args={[b.roofW, b.roofH, b.roofD]} />
                  <Edges threshold={15} color="#5A7292" lineWidth={1} />
                </mesh>
              </group>
            )}

            {/* Helipad for Mega Skyscraper */}
            {b.hasHelipad && (
              <group position={[0, b.h + 0.04, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[Math.min(b.w, b.d) * 0.35, 24]} />
                  <meshStandardMaterial color="#2B394E" roughness={0.8} />
                </mesh>
                <Text
                  position={[0, 0.02, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  fontSize={0.8}
                  color="#FACC15"
                  anchorX="center"
                  anchorY="middle"
                >
                  H
                </Text>
              </group>
            )}

            {/* Red Aviation Warning Beacon Light */}
            {b.hasBeacon && (
              <mesh position={[0, b.h + (b.roofH || 0) + 0.35, 0]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial color="#EF4444" />
              </mesh>
            )}

            {/* 3D Floating Landmark Label */}
            {b.landmarkLabel && (
              <group position={[0, b.h + (b.roofH || 0) + 1.2, 0]}>
                <Text
                  fontSize={0.55}
                  color="#E2E8F0"
                  outlineWidth={0.04}
                  outlineColor="#000000"
                  anchorX="center"
                  anchorY="middle"
                >
                  {b.landmarkLabel}
                </Text>
              </group>
            )}
          </group>
        );
      })}

      {/* ─── Private Swimming Pools (Luxury Villa Enclave) ─── */}
      {pools.map((p, idx) => (
        <group key={`pool-${idx}`} position={[p.x, 0.01, p.z]}>
          {/* Water Surface */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[p.w, p.d]} />
            <meshPhysicalMaterial
              color="#0284C7"
              roughness={0.1}
              metalness={0.1}
              transmission={0.4}
              opacity={0.85}
              transparent
            />
          </mesh>
          {/* Pool Deck Border */}
          <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(p.w + 0.2, p.d + 0.2)]} />
            <lineBasicMaterial color="#94A3B8" />
          </lineSegments>
        </group>
      ))}

      {/* ─── Trees & Greenery Canopy ─── */}
      {trees.map((t, idx) => (
        <group key={`tree-${idx}`} position={[t.x, 0, t.z]} scale={t.scale}>
          {/* Trunk */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.5, 6]} />
            <meshStandardMaterial color="#2D2822" roughness={0.9} />
          </mesh>
          {/* Lush Foliage */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshStandardMaterial
              color={t.foliageColor}
              roughness={0.7}
              transparent
              opacity={0.88}
            />
          </mesh>
        </group>
      ))}

      {/* ─── Side Streets (Intersecting City Block Grid) ─── */}
      {sideStreets.map((st, idx) => (
        <mesh
          key={`side-st-${idx}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[st.x, -0.012, st.z]}
          receiveShadow
        >
          <planeGeometry args={[st.w, st.d]} />
          <meshStandardMaterial color="#12151A" roughness={0.95} />
        </mesh>
      ))}

      {/* ─── Main Avenue Pavement & Asphalt ─── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, plotD / 2 + roadWidth / 2 + 0.1]}
        receiveShadow
      >
        <planeGeometry args={[plotW + 42, roadWidth]} />
        <meshStandardMaterial color="#14181F" roughness={0.92} />
      </mesh>

      {/* ─── Avenue Center Line Dashes ─── */}
      {roadMarkings.map((rm, idx) => (
        <mesh
          key={`dash-${idx}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[rm.x, -0.005, rm.z]}
        >
          <planeGeometry args={[rm.w, rm.d]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
