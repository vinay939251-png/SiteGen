/* ─── Map Component — Interactive GIS, Drag-to-Select & Boundary Editor ─── */
import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Rectangle,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSiteStore } from '../../store/siteStore';
import { calculateArea, calculatePerimeter, calculateDimensions, sqftToSqm } from '../../engine/geometry';
import { resolveMicroMarket } from '../../engine/neighborhoodContext';
import { api } from '../../services/api';

// Fix Leaflet default icon URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom styled corner vertex icon
const cornerVertexIcon = L.divIcon({
  className: 'custom-corner-vertex',
  html: `<div style="
    width: 16px;
    height: 16px;
    background: #3DD68C;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(61,214,140,0.8);
    cursor: nwse-resize;
    margin-left: -8px;
    margin-top: -8px;
    display: flex;
    align-items: center;
    justify-content: center;
  "><div style="width: 4px; height: 4px; background: #08090B; border-radius: 50%;"></div></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Custom styled center anchor icon
const centerAnchorIcon = L.divIcon({
  className: 'custom-center-anchor',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: #4C9EEB;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(76,158,235,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    font-size: 12px;
    color: #fff;
    margin-left: -12px;
    margin-top: -12px;
  ">📍</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom intermediate drawing vertex icon (sleek 12px glowing cyan dot)
const drawVertexIcon = L.divIcon({
  className: 'custom-draw-vertex',
  html: `<div style="
    width: 12px;
    height: 12px;
    background: #4C9EEB;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(76,158,235,0.9);
    margin-left: -6px;
    margin-top: -6px;
    pointer-events: none;
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Custom start vertex icon for closing polygon loop
const firstVertexIcon = L.divIcon({
  className: 'custom-first-vertex',
  html: `<div style="
    width: 22px;
    height: 22px;
    background: #E8A838;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 14px rgba(232,168,56,1);
    cursor: pointer;
    margin-left: -11px;
    margin-top: -11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #000;
    font-weight: 800;
  ">1</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

/** Famous Hyderabad Development Hotspots */
export const HYDERABAD_HOTSPOTS = [
  {
    name: 'Gachibowli Financial District',
    address: 'Financial District, Gachibowli, Hyderabad, Telangana',
    lat: 17.4401,
    lng: 78.3489,
    width: 80,
    depth: 100,
    roadWidth: 30,
    landPrice: 20000000,
  },
  {
    name: 'HITEC City Cyber Gateway',
    address: 'Madhapur, HITEC City, Hyderabad, Telangana',
    lat: 17.4485,
    lng: 78.3772,
    width: 120,
    depth: 150,
    roadWidth: 60,
    landPrice: 45000000,
  },
  {
    name: 'Kokapet Neopolis Golden Mile',
    address: 'Neopolis SEZ, Kokapet, Hyderabad, Telangana',
    lat: 17.4125,
    lng: 78.3312,
    width: 150,
    depth: 200,
    roadWidth: 80,
    landPrice: 85000000,
  },
  {
    name: 'Kondapur Residential Sector',
    address: 'Kondapur Main Road, Hyderabad, Telangana',
    lat: 17.4642,
    lng: 78.3582,
    width: 60,
    depth: 80,
    roadWidth: 30,
    landPrice: 15000000,
  },
  {
    name: 'Tellapur Township Corridor',
    address: 'Tellapur ORR Exit, Hyderabad, Telangana',
    lat: 17.4721,
    lng: 78.2985,
    width: 200,
    depth: 250,
    roadWidth: 80,
    landPrice: 110000000,
  },
  {
    name: 'Jubilee Hills Road 36',
    address: 'Road No 36, Jubilee Hills, Hyderabad, Telangana',
    lat: 17.4328,
    lng: 78.4072,
    width: 70,
    depth: 90,
    roadWidth: 40,
    landPrice: 38000000,
  },
];

/** Convert plot boundary (local ft coords) to geo coords around centroid */
function localToGeo(
  boundary: { x: number; y: number }[],
  center: { lat: number; lng: number }
): [number, number][] {
  const ftToLat = 1 / 364000;
  const ftToLng = ftToLat / Math.cos((center.lat * Math.PI) / 180);

  return boundary.map((p) => [
    center.lat + p.y * ftToLat,
    center.lng + p.x * ftToLng,
  ]);
}

/** Calculate setback polygon in geo coords */
function getSetbackGeo(
  width: number,
  depth: number,
  front: number,
  rear: number,
  sideL: number,
  sideR: number,
  center: { lat: number; lng: number }
): [number, number][] {
  const bw = width - sideL - sideR;
  const bd = depth - front - rear;
  if (bw <= 0 || bd <= 0) return [];

  const left = -width / 2 + sideL;
  const right = width / 2 - sideR;
  const bottom = -depth / 2 + front;
  const top = depth / 2 - rear;

  return localToGeo(
    [
      { x: left, y: bottom },
      { x: right, y: bottom },
      { x: right, y: top },
      { x: left, y: top },
    ],
    center
  );
}

/** Recenter map when coordinates change */
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.6 });
  }, [center, zoom, map]);

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    const timer = setTimeout(handleResize, 150);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
}

/**
 * Bulletproof Drag-to-Select Box Component
 * Uses native pointer/mouse event listeners to ensure dragging is never swallowed by Leaflet
 */
function BoxDragSelector({
  isSelecting,
  onComplete,
}: {
  isSelecting: boolean;
  onComplete: (bounds: L.LatLngBounds) => void;
}) {
  const map = useMap();
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);
  const [currentPoint, setCurrentPoint] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (!map || !isSelecting) return;

    map.dragging.disable();
    map.boxZoom.disable();
    map.doubleClickZoom.disable();
    const container = map.getContainer();
    container.style.cursor = 'crosshair';

    let isMouseDown = false;
    let startLatLng: L.LatLng | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Left click only
      const target = e.target as HTMLElement;
      // Ignore clicks on control overlays or buttons
      if (target.closest('.map-overlay-controls') || target.closest('.map-floating-confirm') || target.closest('button')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
      startLatLng = map.containerPointToLatLng(point);
      isMouseDown = true;
      setStartPoint(startLatLng);
      setCurrentPoint(startLatLng);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !startLatLng) return;
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
      const curLatLng = map.containerPointToLatLng(point);
      setCurrentPoint(curLatLng);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown || !startLatLng) return;
      e.preventDefault();
      isMouseDown = false;

      const rect = container.getBoundingClientRect();
      const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
      const endLatLng = map.containerPointToLatLng(point);

      if (
        Math.abs(startLatLng.lat - endLatLng.lat) > 0.00004 &&
        Math.abs(startLatLng.lng - endLatLng.lng) > 0.00004
      ) {
        const bounds = L.latLngBounds(startLatLng, endLatLng);
        onComplete(bounds);
      }

      setStartPoint(null);
      setCurrentPoint(null);
    };

    container.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('mouseup', handleMouseUp, true);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
      map.dragging.enable();
      map.boxZoom.enable();
      map.doubleClickZoom.enable();
      container.style.cursor = '';
    };
  }, [map, isSelecting, onComplete]);

  if (isSelecting && startPoint && currentPoint) {
    const bounds = L.latLngBounds(startPoint, currentPoint);
    return (
      <Rectangle
        bounds={bounds}
        pathOptions={{
          color: '#4C9EEB',
          weight: 2,
          fillColor: '#4C9EEB',
          fillOpacity: 0.25,
          dashArray: '6 4',
        }}
      />
    );
  }

  return null;
}

/** Point-by-point polygon drawing & double-click to finish handler */
function PolygonDrawHandler({
  isDrawing,
  drawnPoints,
  onAddPoint,
  onComplete,
}: {
  isDrawing: boolean;
  drawnPoints: [number, number][];
  onAddPoint: (latlng: L.LatLng) => void;
  onComplete: () => void;
}) {
  const map = useMap();
  const [mousePos, setMousePos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!map || !isDrawing) {
      setMousePos(null);
      return;
    }
    map.doubleClickZoom.disable();
    const container = map.getContainer();
    const prevCursor = container.style.cursor;
    container.style.cursor = 'crosshair';

    return () => {
      map.doubleClickZoom.enable();
      container.style.cursor = prevCursor;
    };
  }, [map, isDrawing]);

  useMapEvents({
    mousemove(e) {
      if (isDrawing && drawnPoints.length > 0) {
        setMousePos([e.latlng.lat, e.latlng.lng]);
      }
    },
    click(e) {
      if (!isDrawing) return;
      const original = e.originalEvent as MouseEvent;
      const target = original?.target as HTMLElement;
      if (
        target?.closest?.('.map-overlay-controls') ||
        target?.closest?.('.map-floating-confirm') ||
        target?.closest?.('button')
      ) {
        return;
      }

      // Check if clicking near first vertex to close loop
      if (drawnPoints.length >= 3) {
        const first = drawnPoints[0];
        const dist = Math.hypot(e.latlng.lat - first[0], e.latlng.lng - first[1]);
        if (dist < 0.00015) {
          onComplete();
          return;
        }
      }

      // Avoid duplicate click at same spot
      if (drawnPoints.length > 0) {
        const last = drawnPoints[drawnPoints.length - 1];
        const dist = Math.hypot(e.latlng.lat - last[0], e.latlng.lng - last[1]);
        if (dist < 0.00003) {
          return;
        }
      }

      onAddPoint(e.latlng);
    },
    dblclick(e) {
      if (isDrawing && drawnPoints.length >= 3) {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        onComplete();
      }
    },
  });

  if (!isDrawing || drawnPoints.length === 0 || !mousePos) return null;

  const lastPoint = drawnPoints[drawnPoints.length - 1];
  return (
    <Polyline
      positions={[lastPoint, mousePos]}
      pathOptions={{
        color: '#E8A838',
        weight: 2,
        dashArray: '4 4',
        opacity: 0.85,
      }}
    />
  );
}

/** Click on map to place plot handler */
function ClickToPlaceHandler({
  isActive,
  onPlace,
}: {
  isActive: boolean;
  onPlace: (latlng: L.LatLng) => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.getContainer().style.cursor = isActive ? 'pointer' : '';
  }, [isActive, map]);

  useMapEvents({
    click(e) {
      if (isActive) {
        onPlace(e.latlng);
      }
    },
  });
  return null;
}

export function SiteMap() {
  const site = useSiteStore((s) => s.site);
  const setSite = useSiteStore((s) => s.setSite);
  const setDimensions = useSiteStore((s) => s.setDimensions);
  const setLocation = useSiteStore((s) => s.setLocation);
  const setRoadWidth = useSiteStore((s) => s.setRoadWidth);
  const setFinance = useSiteStore((s) => s.setFinance);
  const zoning = useSiteStore((s) => s.zoning);

  // Map interaction modes
  const [mode, setMode] = useState<'READY' | 'BOX_SELECT' | 'POLYGON_DRAW' | 'CLICK_PLACE'>('READY');
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isSelected, setIsSelected] = useState(true);

  const center: [number, number] = [site.coordinates.lat, site.coordinates.lng];

  // Convert plot boundary to geo coordinates
  const plotGeo = useMemo(
    () => localToGeo(site.boundary, site.coordinates),
    [site.boundary, site.coordinates]
  );

  // Setback boundary in geo coords
  const setbackGeo = useMemo(
    () =>
      getSetbackGeo(
        site.dimensions.width,
        site.dimensions.depth,
        zoning.frontSetback,
        zoning.rearSetback,
        zoning.sideSetbackLeft,
        zoning.sideSetbackRight,
        site.coordinates
      ),
    [site.dimensions, zoning, site.coordinates]
  );

  // ─── Drag-to-Select Box Completed ───
  const handleBoxSelectComplete = useCallback(
    (bounds: L.LatLngBounds) => {
      const centerLat = bounds.getCenter().lat;
      const centerLng = bounds.getCenter().lng;

      const ftToLat = 1 / 364000;
      const ftToLng = ftToLat / Math.cos((centerLat * Math.PI) / 180);

      const latDiff = Math.abs(bounds.getNorth() - bounds.getSouth());
      const lngDiff = Math.abs(bounds.getEast() - bounds.getWest());

      const widthFt = Math.max(20, Math.round(lngDiff / ftToLng));
      const depthFt = Math.max(20, Math.round(latDiff / ftToLat));

      const market = resolveMicroMarket({ lat: centerLat, lng: centerLng });
      const plotAddress = `${market.name} (${widthFt} × ${depthFt} ft)`;
      setLocation(plotAddress, centerLat, centerLng);
      setDimensions(widthFt, depthFt);
      setSite({ name: market.name, address: plotAddress });
      setIsSelected(true);
      setMode('READY');
    },
    [setLocation, setDimensions, setSite]
  );

  // ─── Point-by-Point Polygon Draw Handlers ───
  const handleAddPolygonPoint = useCallback((latlng: L.LatLng) => {
    setDrawnPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
  }, []);

  const handleConfirmPolygon = useCallback(() => {
    if (drawnPoints.length >= 3) {
      // 1. Calculate true centroid of the drawn vertices
      let sumLat = 0;
      let sumLng = 0;
      drawnPoints.forEach(([lat, lng]) => {
        sumLat += lat;
        sumLng += lng;
      });
      const centerLat = sumLat / drawnPoints.length;
      const centerLng = sumLng / drawnPoints.length;

      const ftToLat = 1 / 364000;
      const ftToLng = ftToLat / Math.cos((centerLat * Math.PI) / 180);

      // 2. Convert points to local boundary in feet relative to the NEW centroid
      const localBoundary = drawnPoints.map(([lat, lng]) => ({
        x: (lng - centerLng) / ftToLng,
        y: (lat - centerLat) / ftToLat,
      }));

      const rawArea = calculateArea(localBoundary);
      const rawPerimeter = calculatePerimeter(localBoundary);
      const dims = calculateDimensions(localBoundary);

      const areaSqft = Math.max(100, Math.round(rawArea));
      const areaSqm = Math.max(10, Math.round(sqftToSqm(areaSqft)));
      const width = Math.max(10, Math.round(dims.width));
      const depth = Math.max(10, Math.round(dims.depth));
      const perimeter = Math.max(20, Math.round(rawPerimeter));

      const market = resolveMicroMarket({ lat: centerLat, lng: centerLng });
      const plotAddress = `${market.name} — Polygon Site (${width} × ${depth} ft)`;

      const newSiteData = {
        boundary: localBoundary,
        coordinates: { lat: centerLat, lng: centerLng },
        address: plotAddress,
        name: market.name,
        areaSqft,
        areaSqm,
        perimeter,
        dimensions: { width, depth },
      };

      // 3. Update both site coordinates AND boundary
      setSite(newSiteData);
      setIsSelected(true);

      // Async save to backend database
      api.saveSite({
        ...newSiteData,
        roadWidth: site.roadWidth,
        landPriceTotal: site.landPriceTotal,
      } as any).catch(() => {});
    }
    setDrawnPoints([]);
    setMode('READY');
  }, [drawnPoints, setSite]);

  const handleUndoPolygonPoint = () => {
    setDrawnPoints((prev) => prev.slice(0, -1));
  };

  const handleCancelPolygon = () => {
    setDrawnPoints([]);
    setMode('READY');
  };

  // ─── Click to Place Plot ───
  const handlePlacePlotAtLocation = (latlng: L.LatLng) => {
    const market = resolveMicroMarket({ lat: latlng.lat, lng: latlng.lng });
    const plotAddress = `${market.name} (${latlng.lat.toFixed(4)}°N, ${latlng.lng.toFixed(4)}°E)`;
    setLocation(plotAddress, latlng.lat, latlng.lng);
    setSite({ name: market.name, address: plotAddress });
    setIsSelected(true);
    setMode('READY');
  };

  // ─── Handle Corner Vertex Drag (Live Resizing) ───
  const handleCornerDrag = (cornerIndex: number, e: L.LeafletEvent) => {
    const newPos = (e.target as L.Marker).getLatLng();
    const ftToLat = 1 / 364000;
    const ftToLng = ftToLat / Math.cos((center[0] * Math.PI) / 180);

    const deltaXFt = (newPos.lng - center[1]) / ftToLng;
    const deltaYFt = (newPos.lat - center[0]) / ftToLat;

    const newHalfW = Math.abs(deltaXFt);
    const newHalfD = Math.abs(deltaYFt);

    const newW = Math.max(20, Math.round(newHalfW * 2));
    const newD = Math.max(20, Math.round(newHalfD * 2));

    setDimensions(newW, newD);
    setIsSelected(true);
  };

  // ─── Handle Center Pin Drag (Live Relocation) ───
  const handleCenterDrag = (e: L.LeafletEvent) => {
    const newPos = (e.target as L.Marker).getLatLng();
    const market = resolveMicroMarket({ lat: newPos.lat, lng: newPos.lng });
    const plotAddress = `${market.name} (${newPos.lat.toFixed(4)}°N, ${newPos.lng.toFixed(4)}°E)`;
    setLocation(plotAddress, newPos.lat, newPos.lng);
    setSite({ name: market.name, address: plotAddress });
    setIsSelected(true);
  };

  // ─── Select Preset Hotspot ───
  const handleSelectHotspot = (presetName: string) => {
    const spot = HYDERABAD_HOTSPOTS.find((h) => h.name === presetName);
    if (!spot) return;

    setLocation(spot.address, spot.lat, spot.lng);
    setDimensions(spot.width, spot.depth);
    setRoadWidth(spot.roadWidth);
    setFinance({ landCost: spot.landPrice });
    setSite({ landPriceTotal: spot.landPrice, name: spot.name });
    setIsSelected(true);
  };

  // ─── Location Search (Geocoding / LatLng) ───
  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if user entered Lat, Lng directly
    const coordsMatch = searchQuery.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[3]);
      setLocation(`Plot at ${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng);
      setIsSelected(true);
      setShowSearch(false);
      return;
    }

    // Check preset names
    const matchPreset = HYDERABAD_HOTSPOTS.find(
      (h) =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matchPreset) {
      handleSelectHotspot(matchPreset.name);
      setShowSearch(false);
      return;
    }

    // Fallback Geocoding with OpenStreetMap Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery + (searchQuery.toLowerCase().includes('hyderabad') ? '' : ' Hyderabad')
      )}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'SiteGen-App' } });
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        setLocation(first.display_name.split(',').slice(0, 3).join(','), lat, lng);
        setIsSelected(true);
        setShowSearch(false);
      } else {
        alert('Location not found. Try searching a major Hyderabad area (e.g., Gachibowli, Kokapet, HITEC City).');
      }
    } catch {
      alert('Search failed. You can also drag the center pin to any location on the map.');
    }
  };

  return (
    <div className="map-wrapper map-dark-tiles">
      <MapContainer
        center={center}
        zoom={17}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapUpdater center={center} zoom={17} />

        {/* Drag-to-Select Box Handler */}
        <BoxDragSelector
          isSelecting={mode === 'BOX_SELECT'}
          onComplete={handleBoxSelectComplete}
        />

        {/* Point-by-point Polygon Draw Handler */}
        <PolygonDrawHandler
          isDrawing={mode === 'POLYGON_DRAW'}
          drawnPoints={drawnPoints}
          onAddPoint={handleAddPolygonPoint}
          onComplete={handleConfirmPolygon}
        />

        {/* Click to Place Plot Handler */}
        <ClickToPlaceHandler
          isActive={mode === 'CLICK_PLACE'}
          onPlace={handlePlacePlotAtLocation}
        />

        {/* Confirmed Plot boundary polygon (Interactive & Clickable) */}
        {mode !== 'POLYGON_DRAW' && plotGeo.length > 0 && (
          <Polygon
            positions={plotGeo}
            pathOptions={{
              color: isSelected ? '#3DD68C' : '#4C9EEB',
              weight: isSelected ? 3 : 2,
              fillColor: isSelected ? '#3DD68C' : '#4C9EEB',
              fillOpacity: isSelected ? 0.18 : 0.08,
              dashArray: isSelected ? undefined : '4 4',
            }}
            eventHandlers={{
              click: () => setIsSelected(true),
            }}
          />
        )}

        {/* Setback boundary polygon */}
        {mode !== 'POLYGON_DRAW' && setbackGeo.length > 0 && (
          <Polygon
            positions={setbackGeo}
            pathOptions={{
              color: '#E8A838',
              weight: 1.5,
              fillColor: '#E8A838',
              fillOpacity: 0.06,
              dashArray: '6 3',
            }}
          />
        )}

        {/* Draggable Corner Handles for plot resizing */}
        {mode === 'READY' &&
          plotGeo.map((pos, idx) => (
            <Marker
              key={`vertex-${idx}`}
              position={pos}
              icon={cornerVertexIcon}
              draggable={true}
              eventHandlers={{
                drag: (e) => handleCornerDrag(idx, e),
              }}
            />
          ))}

        {/* Draggable Center Pin to relocate the plot */}
        {mode === 'READY' && (
          <Marker
            position={center}
            icon={centerAnchorIcon}
            draggable={true}
            eventHandlers={{
              dragend: handleCenterDrag,
            }}
          />
        )}

        {/* Live points & polygon preview during Polygon Draw mode */}
        {mode === 'POLYGON_DRAW' && drawnPoints.length > 0 && (
          <>
            {drawnPoints.length >= 3 ? (
              <Polygon
                positions={drawnPoints}
                pathOptions={{
                  color: '#4C9EEB',
                  weight: 2.5,
                  fillColor: '#4C9EEB',
                  fillOpacity: 0.22,
                  dashArray: '4 4',
                }}
              />
            ) : drawnPoints.length === 2 ? (
              <Polyline
                positions={drawnPoints}
                pathOptions={{
                  color: '#4C9EEB',
                  weight: 2.5,
                  dashArray: '4 4',
                }}
              />
            ) : null}

            {drawnPoints.map((pos, i) => (
              <Marker
                key={`draw-pt-${i}`}
                position={pos}
                icon={i === 0 ? firstVertexIcon : drawVertexIcon}
                interactive={i === 0}
                eventHandlers={
                  i === 0 && drawnPoints.length >= 3
                    ? {
                        click: (e) => {
                          L.DomEvent.stopPropagation(e);
                          handleConfirmPolygon();
                        },
                      }
                    : undefined
                }
              />
            ))}
          </>
        )}
      </MapContainer>

      {/* Map Control Bar */}
      <div className="map-overlay-controls">
        {/* Primary Action Buttons */}
        <div className="map-control-group">
          <button
            className={`btn btn-sm ${mode === 'BOX_SELECT' ? 'btn-primary' : ''}`}
            onClick={() => setMode(mode === 'BOX_SELECT' ? 'READY' : 'BOX_SELECT')}
            title="Click and drag on the map to select any plot area"
            id="btn-drag-box"
          >
            {mode === 'BOX_SELECT' ? '✕ Cancel Drag' : '⬚ Drag-to-Select Area'}
          </button>

          <button
            className={`btn btn-sm ${mode === 'POLYGON_DRAW' ? 'btn-primary' : ''}`}
            onClick={() => {
              if (mode === 'POLYGON_DRAW') {
                handleCancelPolygon();
              } else {
                setDrawnPoints([]);
                setMode('POLYGON_DRAW');
              }
            }}
            id="btn-draw-poly"
          >
            {mode === 'POLYGON_DRAW' ? '✕ Cancel Draw' : '✎ Draw Polygon'}
          </button>

          <button
            className={`btn btn-sm ${mode === 'CLICK_PLACE' ? 'btn-primary' : ''}`}
            onClick={() => setMode(mode === 'CLICK_PLACE' ? 'READY' : 'CLICK_PLACE')}
            title="Click anywhere on map to position the plot"
            id="btn-click-place"
          >
            {mode === 'CLICK_PLACE' ? '✕ Cancel Place' : '🎯 Place Here'}
          </button>

          <button
            className={`btn btn-sm ${showSearch ? 'btn-primary' : ''}`}
            onClick={() => setShowSearch(!showSearch)}
            title="Search address or coordinates"
            id="btn-toggle-search"
          >
            🔍 Search
          </button>
        </div>

        {/* Search Bar Flyout */}
        {showSearch && (
          <form
            onSubmit={handleSearchLocation}
            className="map-control-group"
            style={{ padding: '6px 8px', display: 'flex', gap: 6 }}
          >
            <input
              type="text"
              placeholder="E.g. Kokapet, Gachibowli, or Lat,Lng"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ padding: '4px 8px', fontSize: 11, width: 220, height: 26 }}
              autoFocus
            />
            <button type="submit" className="btn btn-sm btn-primary" style={{ padding: '3px 8px', height: 26 }}>
              Go
            </button>
          </form>
        )}

        {/* Quick Hotspot Selector */}
        <div className="map-control-group">
          <select
            className="select-field"
            style={{ padding: '3px 8px', fontSize: 11, height: 28, background: 'rgba(15, 18, 24, 0.95)' }}
            onChange={(e) => {
              if (e.target.value) handleSelectHotspot(e.target.value);
            }}
            defaultValue=""
            id="select-hotspot"
          >
            <option value="" disabled>
              ⚡ Jump to Hyderabad Plot...
            </option>
            {HYDERABAD_HOTSPOTS.map((h) => (
              <option key={h.name} value={h.name}>
                {h.name} ({h.width}×{h.depth} ft)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prominent Floating Confirmation Bar when Drawing */}
      {mode === 'POLYGON_DRAW' && (
        <div
          className="map-floating-confirm"
          style={{
            position: 'absolute',
            bottom: 50,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 450,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(10, 14, 20, 0.96)',
            padding: '8px 18px',
            borderRadius: 30,
            border: '1px solid rgba(76, 158, 235, 0.5)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          }}
        >
          <span style={{ fontSize: 12, color: '#f0f2f5', fontWeight: 500 }}>
            {drawnPoints.length === 0
              ? 'Click map to place 1st vertex'
              : drawnPoints.length < 3
              ? `Point ${drawnPoints.length} placed — click map to add more points (min 3)`
              : `${drawnPoints.length} points placed — click Point 1 or double-click to finish`}
          </span>

          {drawnPoints.length > 0 && (
            <button
              type="button"
              className="btn btn-sm"
              style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11 }}
              onClick={handleUndoPolygonPoint}
              title="Remove the last placed vertex"
            >
              ↶ Undo
            </button>
          )}

          <button
            type="button"
            className="btn btn-sm btn-primary"
            style={{ padding: '4px 14px', borderRadius: 20, fontWeight: 700 }}
            onClick={handleConfirmPolygon}
            disabled={drawnPoints.length < 3}
          >
            ✓ Complete Polygon ({drawnPoints.length})
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ padding: '4px 10px', borderRadius: 20 }}
            onClick={handleCancelPolygon}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Real-time Instructions / Selected Site Status Overlay */}
      <div className="map-info-overlay">
        <span
          className="map-info-label"
          style={{
            background: isSelected ? 'rgba(61, 214, 140, 0.15)' : 'rgba(76, 158, 235, 0.15)',
            color: isSelected ? '#3DD68C' : '#4C9EEB',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          {isSelected ? '✓ SITE SELECTED' : 'SITE'}
        </span>

        {mode === 'BOX_SELECT' && (
          <span className="map-info-drawing" style={{ color: '#4C9EEB' }}>
            🖱️ <strong>Click & Drag</strong> across the map to select your plot area
          </span>
        )}
        {mode === 'POLYGON_DRAW' && (
          <span className="map-info-drawing">
            Click map to add boundary points ({drawnPoints.length} added). Double-click or click first point to complete.
          </span>
        )}
        {mode === 'CLICK_PLACE' && (
          <span className="map-info-drawing" style={{ color: '#E8A838' }}>
            🎯 Click anywhere on the map to reposition the plot here
          </span>
        )}
        {mode === 'READY' && (
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong>{site.dimensions.width} × {site.dimensions.depth} ft</strong> ({site.areaSqft.toLocaleString('en-IN')} sq.ft)
            {'  •  '}
            <span style={{ color: '#3DD68C' }}>Drag green corners to resize</span>
            {'  •  '}
            <span style={{ color: '#4C9EEB' }}>Drag 📍 pin to move</span>
          </span>
        )}
      </div>
    </div>
  );
}
