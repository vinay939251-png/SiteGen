import { useSiteStore } from '../../../store/siteStore';
import type { BuildingTypology } from '../../../types';

const TYPOLOGIES: BuildingTypology[] = [
  'Residential',
  'Apartment',
  'Villa',
  'Commercial',
  'Mixed Use',
  'Office',
];

export function BuildingTab() {
  const building = useSiteStore((s) => s.building);
  const setBuilding = useSiteStore((s) => s.setBuilding);
  const zoning = useSiteStore((s) => s.zoning);

  return (
    <div>
      <div className="panel-section">
        <div className="panel-section-title">TYPOLOGY</div>
        <div className="input-group">
          <label className="input-label">Building Type</label>
          <select
            className="select-field"
            value={building.typology}
            onChange={(e) => setBuilding({ typology: e.target.value as BuildingTypology })}
            id="select-typology"
          >
            {TYPOLOGIES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">BUILDING PARAMETERS</div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">Floors</span>
            <span className="slider-value">
              {building.floors}<span className="unit"> floors</span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={building.floors}
            onChange={(e) => setBuilding({ floors: Number(e.target.value) })}
            id="slider-floors"
          />
          <div className="slider-ticks">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">Floor Height</span>
            <span className="slider-value">
              {building.floorHeight.toFixed(1)}<span className="unit"> m</span>
            </span>
          </div>
          <input
            type="range"
            min={2.8}
            max={5.0}
            step={0.1}
            value={building.floorHeight}
            onChange={(e) => setBuilding({ floorHeight: Number(e.target.value) })}
            id="slider-floor-height"
          />
          <div className="slider-ticks">
            <span>2.8m</span>
            <span>5.0m</span>
          </div>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">
              Target FAR
              <span className="tooltip-icon" data-tooltip="Floor Area Ratio — ratio of total floor area to plot area" style={{ marginLeft: 4 }}>?</span>
            </span>
            <span className="slider-value">{building.targetFAR.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={5.0}
            step={0.1}
            value={building.targetFAR}
            onChange={(e) => setBuilding({ targetFAR: Number(e.target.value) })}
            id="slider-far"
          />
          <div className="slider-ticks">
            <span>0.5</span>
            <span>Max: {zoning.maxFAR}</span>
            <span>5.0</span>
          </div>
          {building.targetFAR > zoning.maxFAR && (
            <div style={{
              fontSize: 10,
              color: 'var(--warning)',
              marginTop: 4,
              fontWeight: 500,
            }}>
              ⚠ Exceeds preliminary maximum FAR ({zoning.maxFAR})
            </div>
          )}
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">
              Building Efficiency
              <span className="tooltip-icon" data-tooltip="Ratio of saleable area to gross floor area" style={{ marginLeft: 4 }}>?</span>
            </span>
            <span className="slider-value">
              {(building.efficiency * 100).toFixed(0)}<span className="unit">%</span>
            </span>
          </div>
          <input
            type="range"
            min={0.6}
            max={0.9}
            step={0.01}
            value={building.efficiency}
            onChange={(e) => setBuilding({ efficiency: Number(e.target.value) })}
            id="slider-efficiency"
          />
          <div className="slider-ticks">
            <span>60%</span>
            <span>90%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
