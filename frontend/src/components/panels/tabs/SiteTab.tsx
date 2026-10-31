import { useState, useEffect } from 'react';
import { useSiteStore } from '../../../store/siteStore';
import { formatNumber } from '../../../engine/finance';
import { HYDERABAD_HOTSPOTS } from '../../map/SiteMap';
import { resolveMicroMarket } from '../../../engine/neighborhoodContext';

export function SiteTab() {
  const site = useSiteStore((s) => s.site);
  const setSite = useSiteStore((s) => s.setSite);
  const setDimensions = useSiteStore((s) => s.setDimensions);
  const setLocation = useSiteStore((s) => s.setLocation);
  const setRoadWidth = useSiteStore((s) => s.setRoadWidth);
  const setFinance = useSiteStore((s) => s.setFinance);

  const [latInput, setLatInput] = useState(site.coordinates.lat.toFixed(4));
  const [lngInput, setLngInput] = useState(site.coordinates.lng.toFixed(4));

  useEffect(() => {
    setLatInput(site.coordinates.lat.toFixed(4));
    setLngInput(site.coordinates.lng.toFixed(4));
  }, [site.coordinates.lat, site.coordinates.lng]);

  const market = resolveMicroMarket(site.coordinates, site.address);

  // ─── Preset Area Options ───
  const PRESET_SIZES = [
    { label: '300 sq.yd', width: 45, depth: 60, sqft: 2700 },
    { label: '500 sq.yd', width: 60, depth: 75, sqft: 4500 },
    { label: '1,000 sq.yd', width: 80, depth: 112, sqft: 8960 },
    { label: 'Half Acre', width: 120, depth: 181, sqft: 21720 },
    { label: '1 Acre', width: 180, depth: 242, sqft: 43560 },
  ];

  // ─── Standard Hyderabad Master Plan Road Widths ───
  const STANDARD_ROADS = [20, 30, 40, 60, 80, 100];

  const handleApplyCoords = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!isNaN(lat) && !isNaN(lng)) {
      const resolved = resolveMicroMarket({ lat, lng });
      const newAddress = `${resolved.name} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
      setLocation(newAddress, lat, lng);
      setSite({ name: resolved.name, address: newAddress });
    }
  };

  const handleSelectHotspot = (name: string) => {
    const spot = HYDERABAD_HOTSPOTS.find((h) => h.name === name);
    if (!spot) return;

    setLocation(spot.address, spot.lat, spot.lng);
    setDimensions(spot.width, spot.depth);
    setRoadWidth(spot.roadWidth);
    setFinance({ landCost: spot.landPrice });
    setSite({ landPriceTotal: spot.landPrice, name: spot.name });
    setLatInput(spot.lat.toFixed(4));
    setLngInput(spot.lng.toFixed(4));
  };

  return (
    <div>
      {/* ─── Active Site Status Card ─── */}
      <div className="panel-section" style={{ background: 'rgba(61, 214, 140, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61, 214, 140, 0.25)', padding: '10px 12px', marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--accent-positive)', fontWeight: 700, letterSpacing: 0.5 }}>ACTIVE SITE BOUNDARY</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 2 }}>{site.name || 'Selected Plot'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{site.dimensions.width} × {site.dimensions.depth} ft • {formatNumber(site.areaSqft)} sq.ft</div>
            <div style={{ fontSize: 10, color: '#38BDF8', marginTop: 3 }}>
              🏙️ {market.name} • {market.typicalFloorsMin}–{market.typicalFloorsMax}F
            </div>
          </div>
          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 12, background: 'rgba(61, 214, 140, 0.2)', color: 'var(--accent-positive)', fontWeight: 700 }}>✓ SELECTED</span>
        </div>
      </div>

      {/* ─── Location & Hotspots ─── */}
      <div className="panel-section">
        <div className="panel-section-title">QUICK HYDERABAD PLOTS</div>
        <div className="input-group">
          <select
            className="select-field"
            onChange={(e) => handleSelectHotspot(e.target.value)}
            defaultValue=""
            id="site-tab-select-hotspot"
          >
            <option value="" disabled>Select a Development Corridor...</option>
            {HYDERABAD_HOTSPOTS.map((h) => (
              <option key={h.name} value={h.name}>
                {h.name} ({h.width}×{h.depth} ft)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">SITE LOCATION</div>
        <div className="input-group">
          <label className="input-label">Address / Landmark</label>
          <input
            className="input-field"
            type="text"
            value={site.address}
            onChange={(e) => setSite({ address: e.target.value })}
            id="input-address"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Coordinates (Latitude, Longitude)</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              className="input-field"
              type="number"
              step="0.0001"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              placeholder="Lat"
              id="input-lat"
            />
            <input
              className="input-field"
              type="number"
              step="0.0001"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              placeholder="Lng"
              id="input-lng"
            />
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleApplyCoords}
              style={{ whiteSpace: 'nowrap' }}
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* ─── Interactive Plot Dimensions ─── */}
      <div className="panel-section">
        <div className="panel-section-title">PLOT DIMENSIONS & SIZING</div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">Plot Width</span>
            <span className="slider-value">
              {site.dimensions.width}<span className="unit"> ft</span>
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={400}
            step={2}
            value={site.dimensions.width}
            onChange={(e) => setDimensions(Number(e.target.value), site.dimensions.depth)}
            id="slider-plot-width"
          />
          <div className="slider-ticks">
            <span>20 ft</span>
            <span>400 ft</span>
          </div>
        </div>

        <div className="slider-group" style={{ marginTop: 'var(--space-sm)' }}>
          <div className="slider-header">
            <span className="slider-label">Plot Depth</span>
            <span className="slider-value">
              {site.dimensions.depth}<span className="unit"> ft</span>
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={400}
            step={2}
            value={site.dimensions.depth}
            onChange={(e) => setDimensions(site.dimensions.width, Number(e.target.value))}
            id="slider-plot-depth"
          />
          <div className="slider-ticks">
            <span>20 ft</span>
            <span>400 ft</span>
          </div>
        </div>

        {/* Quick Lot Size Presets */}
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <label className="input-label" style={{ marginBottom: 4, display: 'block' }}>
            Quick Parcel Presets
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {PRESET_SIZES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="btn btn-sm"
                style={{
                  fontSize: 10,
                  padding: '3px 7px',
                  background:
                    site.dimensions.width === preset.width && site.dimensions.depth === preset.depth
                      ? 'var(--accent-blue)'
                      : 'var(--surface-primary)',
                  borderColor:
                    site.dimensions.width === preset.width && site.dimensions.depth === preset.depth
                      ? 'var(--accent-blue)'
                      : 'var(--surface-border)',
                }}
                onClick={() => setDimensions(preset.width, preset.depth)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Metrics Card */}
        <div className="metric-row" style={{ marginTop: 'var(--space-md)' }}>
          <div className="metric metric-small">
            <span className="metric-label">Calculated Area</span>
            <span className="metric-value">
              {formatNumber(site.areaSqft)}
              <span className="unit">sq.ft</span>
            </span>
          </div>
          <div className="metric metric-small">
            <span className="metric-label">Perimeter</span>
            <span className="metric-value">
              {formatNumber(site.perimeter)}
              <span className="unit">ft</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Road & Access Width ─── */}
      <div className="panel-section">
        <div className="panel-section-title">ROAD & ACCESS CORRIDOR</div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">Road Width</span>
            <span className="slider-value">
              {site.roadWidth}<span className="unit"> ft</span>
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={120}
            step={1}
            value={site.roadWidth}
            onChange={(e) => setRoadWidth(Number(e.target.value))}
            id="slider-road-width"
          />
          <div className="slider-ticks">
            <span>15 ft</span>
            <span>120 ft</span>
          </div>
        </div>

        {/* Standard Road Buttons */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {STANDARD_ROADS.map((rw) => (
            <button
              key={rw}
              type="button"
              className="btn btn-sm"
              style={{
                fontSize: 10,
                padding: '2px 6px',
                flex: 1,
                background: site.roadWidth === rw ? 'var(--accent-blue)' : 'var(--surface-primary)',
              }}
              onClick={() => setRoadWidth(rw)}
            >
              {rw}'
            </button>
          ))}
        </div>
      </div>

      {/* ─── Land Acquisition Price ─── */}
      <div className="panel-section">
        <div className="panel-section-title">LAND ACQUISITION COST</div>
        <div className="input-group">
          <label className="input-label">
            Total Land Cost
            <span className="tooltip-icon" data-tooltip="Total acquisition cost of the parcel">?</span>
          </label>
          <div className="input-unit">
            <input
              className="input-field"
              type="number"
              value={site.landPriceTotal}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSite({ landPriceTotal: val });
                setFinance({ landCost: val });
              }}
              id="input-land-price"
            />
            <span className="input-unit-label">₹</span>
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <strong>Tip:</strong> In the central map or split view, click <strong>"⬚ Drag-to-Select Area"</strong> to marquee-drag any plot directly on OpenStreetMap, or drag the <strong>green corner handles</strong> to stretch the plot boundary!
      </div>
    </div>
  );
}
