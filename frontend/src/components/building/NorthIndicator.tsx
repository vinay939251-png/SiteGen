import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';

interface NorthIndicatorProps {
  position: [number, number, number];
}

export function NorthIndicator({ position }: NorthIndicatorProps) {
  // North arrow pointing in -Z direction (Three.js convention)
  const arrowPoints = useMemo(() => {
    return [
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0, 0.05, -1.5),
    ];
  }, []);

  const lineMesh = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(arrowPoints);
    const material = new THREE.LineBasicMaterial({ color: '#E85454', transparent: true, opacity: 0.7 });
    return new THREE.Line(geometry, material);
  }, [arrowPoints]);

  return (
    <group position={position}>
      {/* Arrow line */}
      <primitive object={lineMesh} />

      {/* Arrow head */}
      <mesh position={[0, 0.05, -1.7]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 4]} />
        <meshBasicMaterial color="#E85454" transparent opacity={0.7} />
      </mesh>

      {/* N label */}
      <Text
        position={[0, 0.05, -2.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#E85454"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        N
      </Text>
    </group>
  );
}
