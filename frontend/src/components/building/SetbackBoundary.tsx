import * as THREE from 'three';
import { useMemo } from 'react';

interface SetbackBoundaryProps {
  plotWidth: number;
  plotDepth: number;
  frontSetback: number;
  rearSetback: number;
  sideSetbackLeft: number;
  sideSetbackRight: number;
}

export function SetbackBoundary({
  plotWidth,
  plotDepth,
  frontSetback,
  rearSetback,
  sideSetbackLeft,
  sideSetbackRight,
}: SetbackBoundaryProps) {
  const buildableW = plotWidth - sideSetbackLeft - sideSetbackRight;
  const buildableD = plotDepth - frontSetback - rearSetback;

  const offsetX = (sideSetbackLeft - sideSetbackRight) / 2;
  const offsetZ = (frontSetback - rearSetback) / 2 * -1;

  if (buildableW <= 0 || buildableD <= 0) return null;

  const points = useMemo(() => {
    const hw = buildableW / 2;
    const hd = buildableD / 2;
    return [
      new THREE.Vector3(-hw + offsetX, 0.015, -hd + offsetZ),
      new THREE.Vector3(hw + offsetX, 0.015, -hd + offsetZ),
      new THREE.Vector3(hw + offsetX, 0.015, hd + offsetZ),
      new THREE.Vector3(-hw + offsetX, 0.015, hd + offsetZ),
      new THREE.Vector3(-hw + offsetX, 0.015, -hd + offsetZ),
    ];
  }, [buildableW, buildableD, offsetX, offsetZ]);

  const lineMesh = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: '#E8A838', transparent: true, opacity: 0.5, linewidth: 1 });
    return new THREE.Line(geometry, material);
  }, [points]);

  return (
    <group>
      {/* Setback boundary fill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.008, offsetZ]}>
        <planeGeometry args={[buildableW, buildableD]} />
        <meshStandardMaterial
          color="#E8A838"
          transparent
          opacity={0.04}
          roughness={0.9}
        />
      </mesh>

      {/* Setback boundary line — dashed appearance */}
      <primitive object={lineMesh} />
    </group>
  );
}
