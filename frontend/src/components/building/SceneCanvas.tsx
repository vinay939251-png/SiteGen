import { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text, PerspectiveCamera } from '@react-three/drei';
import { useSiteStore } from '../../store/siteStore';
import { BuildingMass } from './BuildingMass';
import { PlotBoundary } from './PlotBoundary';
import { SetbackBoundary } from './SetbackBoundary';
import { SunLight } from './SunLight';
import { NorthIndicator } from './NorthIndicator';
import { SurroundingBuildings } from './SurroundingBuildings';
import { SiteMap } from '../map/SiteMap';
import { resolveMicroMarket } from '../../engine/neighborhoodContext';
import type { ViewMode, UrbanArchetype } from '../../types';
import * as THREE from 'three';

type CanvasMode = '3D' | 'MAP' | 'SPLIT';

export function SceneCanvas() {
  const site = useSiteStore((s) => s.site);
  const viewMode = useSiteStore((s) => s.viewMode);
  const setViewMode = useSiteStore((s) => s.setViewMode);
  const showSurroundings = useSiteStore((s) => s.showSurroundings);
  const setShowSurroundings = useSiteStore((s) => s.setShowSurroundings);
  const showSetbacks = useSiteStore((s) => s.showSetbacks);
  const setShowSetbacks = useSiteStore((s) => s.setShowSetbacks);
  const showFloorPlates = useSiteStore((s) => s.showFloorPlates);
  const setShowFloorPlates = useSiteStore((s) => s.setShowFloorPlates);
  const buildingRenderStyle = useSiteStore((s) => s.buildingRenderStyle);
  const setBuildingRenderStyle = useSiteStore((s) => s.setBuildingRenderStyle);
  const surroundingArchetype = useSiteStore((s) => s.surroundingArchetype);
  const setSurroundingArchetype = useSiteStore((s) => s.setSurroundingArchetype);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('SPLIT');

  const marketInfo = useMemo(() => {
    return resolveMicroMarket(site.coordinates, site.address, surroundingArchetype);
  }, [site.coordinates, site.address, surroundingArchetype]);

  return (
    <div className="canvas-container" id="canvas-container">
      {/* Canvas mode toggle */}
      <div className="canvas-mode-toggle">
        <button
          className={`canvas-mode-btn ${canvasMode === '3D' ? 'active' : ''}`}
          onClick={() => setCanvasMode('3D')}
          id="btn-mode-3d"
        >
          3D Model
        </button>
        <button
          className={`canvas-mode-btn ${canvasMode === 'SPLIT' ? 'active' : ''}`}
          onClick={() => setCanvasMode('SPLIT')}
          id="btn-mode-split"
        >
          Split View
        </button>
        <button
          className={`canvas-mode-btn ${canvasMode === 'MAP' ? 'active' : ''}`}
          onClick={() => setCanvasMode('MAP')}
          id="btn-mode-map"
        >
          Site Map
        </button>
      </div>

      {/* 3D Context HUD Banner */}
      {canvasMode !== 'MAP' && showSurroundings && (
        <div
          style={{
            position: 'absolute',
            top: 54,
            left: 14,
            zIndex: 350,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(10, 14, 20, 0.92)',
            backdropFilter: 'blur(12px)',
            padding: '5px 12px',
            borderRadius: 20,
            border: '1px solid rgba(61, 214, 140, 0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            fontSize: 11,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 13 }}>📍</span>
          <div>
            <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{marketInfo.name}</span>
              <span
                style={{
                  fontSize: 9,
                  padding: '1px 6px',
                  borderRadius: 8,
                  background: 'rgba(61, 214, 140, 0.2)',
                  color: '#3DD68C',
                  fontWeight: 600,
                }}
              >
                {marketInfo.typicalFloorsMin}–{marketInfo.typicalFloorsMax}F • FAR {marketInfo.typicalFAR}
              </span>
            </div>
            <div style={{ color: '#94A3B8', fontSize: 9.5 }}>
              {marketInfo.description}
            </div>
          </div>
        </div>
      )}

      {/* 3D Display & Architectural Style Controls Bar */}
      {canvasMode !== 'MAP' && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 350,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(10, 14, 20, 0.88)',
            backdropFilter: 'blur(12px)',
            padding: '4px 8px',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {/* Style Selector */}
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 2 }}>
            <button
              type="button"
              className={`btn btn-sm ${buildingRenderStyle === 'GLASS' ? 'btn-primary' : ''}`}
              style={{ fontSize: 10, padding: '2px 8px', borderRadius: 14 }}
              onClick={() => setBuildingRenderStyle('GLASS')}
              title="Translucent Architectural Glass"
            >
              💎 Glass
            </button>
            <button
              type="button"
              className={`btn btn-sm ${buildingRenderStyle === 'SOLID' ? 'btn-primary' : ''}`}
              style={{ fontSize: 10, padding: '2px 8px', borderRadius: 14 }}
              onClick={() => setBuildingRenderStyle('SOLID')}
              title="Modern Architectural Solid Clay"
            >
              🏛️ Clay
            </button>
            <button
              type="button"
              className={`btn btn-sm ${buildingRenderStyle === 'WIREFRAME' ? 'btn-primary' : ''}`}
              style={{ fontSize: 10, padding: '2px 8px', borderRadius: 14 }}
              onClick={() => setBuildingRenderStyle('WIREFRAME')}
              title="Wireframe X-Ray"
            >
              📐 Wire
            </button>
          </div>

          {/* Context Archetype Selector */}
          <select
            className="select-field"
            style={{
              fontSize: 10,
              padding: '2px 6px',
              height: 24,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#E2E8F0',
            }}
            value={surroundingArchetype}
            onChange={(e) => setSurroundingArchetype(e.target.value as UrbanArchetype)}
            title="Urban context skyline profile"
            id="select-skyline-archetype"
          >
            <option value="AUTO">⚡ Auto (from GPS)</option>
            <option value="SKYSCRAPERS">🏙️ Kokapet High-Rise (32-54F)</option>
            <option value="TECH_CAMPUS">🏢 HITEC Tech Park (16-28F)</option>
            <option value="LOW_RISE_VILLAS">🏡 Jubilee Villas (G+2 to G+4)</option>
            <option value="TOWNSHIP_CLUSTERS">🏘️ Tellapur Township (18-32F)</option>
            <option value="COMMERCIAL">🏬 Central Commercial (8-16F)</option>
          </select>

          {/* Context Buildings Toggle */}
          <button
            type="button"
            className={`btn btn-sm ${showSurroundings ? 'btn-primary' : ''}`}
            style={{ fontSize: 10, padding: '3px 8px', borderRadius: 14 }}
            onClick={() => setShowSurroundings(!showSurroundings)}
            title="Toggle surrounding buildings on/off"
          >
            🏙️ {showSurroundings ? 'City: ON' : 'City: OFF'}
          </button>

          {/* Setbacks Toggle */}
          <button
            type="button"
            className={`btn btn-sm ${showSetbacks ? 'btn-primary' : ''}`}
            style={{ fontSize: 10, padding: '3px 8px', borderRadius: 14 }}
            onClick={() => setShowSetbacks(!showSetbacks)}
            title="Toggle regulatory setback envelope"
          >
            📏 {showSetbacks ? 'Setbacks: ON' : 'Setbacks: OFF'}
          </button>
        </div>
      )}

      {/* Split view */}
      {canvasMode === 'SPLIT' && (
        <div className="canvas-split">
          <div className="canvas-split-3d">
            <Canvas
              shadows
              gl={{
                antialias: true,
                preserveDrawingBuffer: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.2,
              }}
              style={{ background: '#08090B' }}
            >
              <SceneContent viewMode={viewMode} />
            </Canvas>
          </div>
          <div className="canvas-split-map">
            <SiteMap />
          </div>
        </div>
      )}

      {/* Full 3D view */}
      {canvasMode === '3D' && (
        <Canvas
          shadows
          gl={{
            antialias: true,
            preserveDrawingBuffer: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
          style={{ background: '#08090B', width: '100%', height: '100%' }}
        >
          <SceneContent viewMode={viewMode} />
        </Canvas>
      )}

      {/* Full map view */}
      {canvasMode === 'MAP' && (
        <SiteMap />
      )}

      {/* Camera controls (only show for 3D modes) */}
      {canvasMode !== 'MAP' && (
        <div className={`canvas-controls ${canvasMode === 'SPLIT' ? 'split-mode' : ''}`}>
          <button
            className={`btn btn-sm ${viewMode === '3D' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('3D')}
            id="btn-view-3d"
          >
            3D
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'TOP' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('TOP')}
            id="btn-view-top"
          >
            TOP
          </button>
          <button
            className="btn btn-sm"
            onClick={() => setViewMode('RESET')}
            id="btn-view-reset"
          >
            RESET
          </button>
        </div>
      )}
    </div>
  );
}

function SceneContent({ viewMode }: { viewMode: ViewMode }) {
  const site = useSiteStore((s) => s.site);
  const feasibility = useSiteStore((s) => s.feasibility);
  const building = useSiteStore((s) => s.building);
  const sunData = useSiteStore((s) => s.sunData);
  const zoning = useSiteStore((s) => s.zoning);
  const showSurroundings = useSiteStore((s) => s.showSurroundings);
  const showSetbacks = useSiteStore((s) => s.showSetbacks);

  // Scale: 1 unit = 1 foot, then scale down for viewing
  const scale = 0.1;
  const plotW = site.dimensions.width * scale;
  const plotD = site.dimensions.depth * scale;

  const cameraPosition = useMemo((): [number, number, number] => {
    switch (viewMode) {
      case 'TOP': return [0, 25, 0.01];
      case '3D': return [plotW * 1.5, plotD * 0.8, plotW * 1.5];
      case 'RESET': return [plotW * 1.5, plotD * 0.8, plotW * 1.5];
      default: return [plotW * 1.5, plotD * 0.8, plotW * 1.5];
    }
  }, [viewMode, plotW, plotD]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={cameraPosition}
        fov={45}
        near={0.1}
        far={1000}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={80}
        maxPolarAngle={viewMode === 'TOP' ? 0.01 : Math.PI / 2.1}
        target={[0, feasibility ? (feasibility.buildingHeightM * scale * 0.3) : 0, 0]}
      />

      {/* Ambient & Fill lights */}
      <ambientLight intensity={0.5} color="#cbd5e1" />
      <hemisphereLight intensity={0.4} color="#e2e8f0" groundColor="#0b0f19" />

      {/* Key light */}
      <directionalLight
        position={[20, 25, 15]}
        intensity={0.75}
        color="#ffffff"
      />

      {/* Opposite soft fill light */}
      <directionalLight
        position={[-15, 12, -15]}
        intensity={0.35}
        color="#64748b"
      />

      {/* Sun simulation light */}
      <SunLight sunData={sunData} buildingHeight={feasibility?.buildingHeightM ?? 0} scale={scale} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0D0F12" roughness={0.95} />
      </mesh>

      {/* Grid */}
      <Grid
        position={[0, -0.01, 0]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#1a1d22"
        sectionSize={5}
        sectionThickness={0.5}
        sectionColor="#1f2228"
        fadeDistance={40}
        fadeStrength={2}
        infiniteGrid
      />

      {/* Road indication (in front of plot) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, plotD / 2 + (site.roadWidth * scale) / 2 + 0.1]}
      >
        <planeGeometry args={[plotW + 4, site.roadWidth * scale]} />
        <meshStandardMaterial color="#16191d" roughness={0.9} />
      </mesh>
      {/* Road center line */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.003, plotD / 2 + (site.roadWidth * scale) / 2 + 0.1]}
      >
        <planeGeometry args={[plotW + 2, 0.05]} />
        <meshStandardMaterial color="#2a2e35" />
      </mesh>

      {/* Road label */}
      <Text
        position={[plotW / 2 + 1.5, 0.02, plotD / 2 + (site.roadWidth * scale) / 2 + 0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.25}
        color="#3E4550"
        anchorX="left"
        anchorY="middle"
        font={undefined}
      >
        {`${site.roadWidth}ft ROAD`}
      </Text>

      {/* Plot boundary */}
      <PlotBoundary width={plotW} depth={plotD} />

      {/* Setback boundary */}
      {showSetbacks && (
        <SetbackBoundary
          plotWidth={plotW}
          plotDepth={plotD}
          frontSetback={zoning.frontSetback * scale}
          rearSetback={zoning.rearSetback * scale}
          sideSetbackLeft={zoning.sideSetbackLeft * scale}
          sideSetbackRight={zoning.sideSetbackRight * scale}
        />
      )}

      {/* Building mass */}
      {feasibility && feasibility.buildableAreaSqft > 0 && (
        <BuildingMass
          buildableWidth={(site.dimensions.width - zoning.sideSetbackLeft - zoning.sideSetbackRight) * scale}
          buildableDepth={(site.dimensions.depth - zoning.frontSetback - zoning.rearSetback) * scale}
          floors={building.floors}
          floorHeight={building.floorHeight * scale}
          setbackOffsetX={(zoning.sideSetbackLeft - zoning.sideSetbackRight) * scale / 2}
          setbackOffsetZ={(zoning.frontSetback - zoning.rearSetback) * scale / 2 * -1}
        />
      )}

      {/* Dimension labels */}
      <Text
        position={[0, 0.03, plotD / 2 + 0.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="#3DD68C"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {`${site.dimensions.width} ft`}
      </Text>
      <Text
        position={[plotW / 2 + 0.4, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.2}
        color="#3DD68C"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {`${site.dimensions.depth} ft`}
      </Text>

      {/* Setback dimension labels */}
      <Text
        position={[0, 0.03, -plotD / 2 + zoning.rearSetback * scale / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="#E8A838"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {`${zoning.rearSetback}ft setback`}
      </Text>

      {/* Surrounding urban context — dynamic, location-aware architectural buildings & landscaping */}
      {showSurroundings && (
        <SurroundingBuildings
          plotW={plotW}
          plotD={plotD}
          roadWidth={site.roadWidth * scale}
          coordinates={site.coordinates}
          address={site.address}
        />
      )}
    </>
  );
}

