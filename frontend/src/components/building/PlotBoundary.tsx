import * as THREE from 'three';
import { useMemo } from 'react';

interface PlotBoundaryProps {
  width: number;
  depth: number;
}

export function PlotBoundary({ width, depth }: PlotBoundaryProps) {
  const points = useMemo(() => {
    const hw = width / 2;
    const hd = depth / 2;
    return [
      new THREE.Vector3(-hw, 0.01, -hd),
      new THREE.Vector3(hw, 0.01, -hd),
      new THREE.Vector3(hw, 0.01, hd),
      new THREE.Vector3(-hw, 0.01, hd),
      new THREE.Vector3(-hw, 0.01, -hd), // close loop
    ];
  }, [width, depth]);

  const lineMesh = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: '#3DD68C', transparent: true, opacity: 0.6, linewidth: 1 });
    return new THREE.Line(geometry, material);
  }, [points]);

  return (
    <group>
      {/* Plot fill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#3DD68C"
          transparent
          opacity={0.06}
          roughness={0.9}
        />
      </mesh>

      {/* Plot boundary line */}
      <primitive object={lineMesh} />

      {/* Corner markers */}
      {[
        [-width / 2, -depth / 2],
        [width / 2, -depth / 2],
        [width / 2, depth / 2],
        [-width / 2, depth / 2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#3DD68C" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}
