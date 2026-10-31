import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { useSiteStore } from '../../store/siteStore';

interface BuildingMassProps {
  buildableWidth: number;
  buildableDepth: number;
  floors: number;
  floorHeight: number;
  setbackOffsetX?: number;
  setbackOffsetZ?: number;
}

export function BuildingMass({
  buildableWidth,
  buildableDepth,
  floors,
  floorHeight,
  setbackOffsetX = 0,
  setbackOffsetZ = 0,
}: BuildingMassProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetHeight = useRef(floors * floorHeight);
  const totalHeight = floors * floorHeight;

  const buildingRenderStyle = useSiteStore((s) => s.buildingRenderStyle);
  const showFloorPlates = useSiteStore((s) => s.showFloorPlates);

  // Animate building height changes
  useFrame(() => {
    if (groupRef.current) {
      const currentScale = groupRef.current.scale.y;
      const targetScale = totalHeight / (targetHeight.current || 1);
      const newScale = THREE.MathUtils.lerp(currentScale, 1, 0.08);
      groupRef.current.scale.y = newScale;
    }
  });

  // Update target height when it changes
  useMemo(() => {
    targetHeight.current = totalHeight;
  }, [totalHeight]);

  if (buildableWidth <= 0 || buildableDepth <= 0 || floors <= 0) return null;

  const isSolid = buildingRenderStyle === 'SOLID';
  const isWireframe = buildingRenderStyle === 'WIREFRAME';

  const bodyColor = isSolid ? '#E2E8F0' : '#4C9EEB';
  const bodyOpacity = isSolid ? 0.96 : isWireframe ? 0.06 : 0.3;
  const edgeColor = isSolid ? '#2563EB' : isWireframe ? '#00E5FF' : '#4C9EEB';
  const edgeLineWidth = isWireframe ? 1.6 : 1.2;

  return (
    <group
      ref={groupRef}
      position={[setbackOffsetX, 0, setbackOffsetZ]}
    >
      {/* Main building mass */}
      <mesh
        position={[0, totalHeight / 2, 0]}
        castShadow={!isWireframe}
        receiveShadow
      >
        <boxGeometry args={[buildableWidth, totalHeight, buildableDepth]} />
        <meshPhysicalMaterial
          color={bodyColor}
          transparent
          opacity={bodyOpacity}
          roughness={isSolid ? 0.5 : 0.25}
          metalness={isSolid ? 0.05 : 0.15}
          clearcoat={isSolid ? 0.1 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Building edges */}
      <mesh position={[0, totalHeight / 2, 0]}>
        <boxGeometry args={[buildableWidth, totalHeight, buildableDepth]} />
        <Edges
          threshold={15}
          color={edgeColor}
          lineWidth={edgeLineWidth}
        />
      </mesh>

      {/* Floor plates */}
      {showFloorPlates &&
        Array.from({ length: floors }, (_, i) => {
          const y = (i + 1) * floorHeight;
          return (
            <mesh key={i} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[buildableWidth - 0.02, buildableDepth - 0.02]} />
              <meshBasicMaterial
                color={isSolid ? '#94A3B8' : '#4C9EEB'}
                transparent
                opacity={isSolid ? 0.25 : 0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}

      {/* Floor plate edge lines */}
      {showFloorPlates &&
        Array.from({ length: floors }, (_, i) => {
          const y = (i + 1) * floorHeight;
          return (
            <lineSegments key={`edge-${i}`} position={[0, y, 0]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(buildableWidth, buildableDepth)]} />
              <lineBasicMaterial
                color={isSolid ? '#475569' : edgeColor}
                transparent
                opacity={isSolid ? 0.4 : 0.25}
              />
            </lineSegments>
          );
        })}

      {/* Ground floor accent */}
      <mesh position={[0, floorHeight / 2, 0]}>
        <boxGeometry args={[buildableWidth + 0.01, floorHeight, buildableDepth + 0.01]} />
        <meshPhysicalMaterial
          color="#4C9EEB"
          transparent
          opacity={0.12}
          roughness={0.5}
        />
      </mesh>

      {/* Roof accent line */}
      <mesh position={[0, totalHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[buildableWidth + 0.04, buildableDepth + 0.04]} />
        <meshBasicMaterial
          color="#4C9EEB"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
