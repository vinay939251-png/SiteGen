import { useMemo } from 'react';
import type { SunData } from '../../types';

interface SunLightProps {
  sunData: SunData;
  buildingHeight: number;
  scale: number;
}

export function SunLight({ sunData, buildingHeight, scale }: SunLightProps) {
  const lightPosition = useMemo((): [number, number, number] => {
    if (!sunData.sunEnabled) return [15, 30, 10];

    const azimuthRad = (sunData.azimuth * Math.PI) / 180;
    const altitudeRad = Math.max((sunData.altitude * Math.PI) / 180, 0.1);
    const distance = 30;

    const x = distance * Math.cos(altitudeRad) * Math.sin(azimuthRad);
    const y = distance * Math.sin(altitudeRad);
    const z = distance * Math.cos(altitudeRad) * Math.cos(azimuthRad);

    return [x, Math.max(y, 2), z];
  }, [sunData]);

  const shadowMapSize = 2048;

  return (
    <>
      <directionalLight
        position={lightPosition}
        intensity={sunData.sunEnabled ? 1.2 : 0.3}
        color={sunData.sunEnabled ? '#ffe4b5' : '#ffffff'}
        castShadow={sunData.sunEnabled}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.001}
      />

      {/* Sun indicator sphere */}
      {sunData.sunEnabled && (
        <mesh position={lightPosition}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      )}
    </>
  );
}
