import { useSiteStore } from '../../../store/siteStore';
import { formatNumber } from '../../../engine/finance';

export function SiteInfoTab() {
  const site = useSiteStore((s) => s.site);
  const feasibility = useSiteStore((s) => s.feasibility);

  return (
    <div>
      <div className="panel-section">
        <div className="panel-section-title">SITE INFORMATION</div>
        <div className="rule-row">
          <span className="rule-label">Name</span>
          <span className="rule-value">{site.name}</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Address</span>
          <span className="rule-value" style={{ fontSize: 11 }}>{site.address}</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Latitude</span>
          <span className="rule-value">{site.coordinates.lat.toFixed(4)}</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Longitude</span>
          <span className="rule-value">{site.coordinates.lng.toFixed(4)}</span>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">GEOMETRY</div>
        <div className="rule-row">
          <span className="rule-label">Plot Area</span>
          <span className="rule-value">{formatNumber(site.areaSqft)} sq.ft</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Perimeter</span>
          <span className="rule-value">{formatNumber(site.perimeter)} ft</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Width</span>
          <span className="rule-value">{site.dimensions.width} ft</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Depth</span>
          <span className="rule-value">{site.dimensions.depth} ft</span>
        </div>
      </div>

      {feasibility && (
        <div className="panel-section">
          <div className="panel-section-title">BUILDABLE AREA</div>
          <div className="metric">
            <span className="metric-label">Buildable Footprint</span>
            <span className="metric-value">
              {formatNumber(feasibility.buildableAreaSqft)}
              <span className="unit">sq.ft</span>
            </span>
          </div>
          <div className="metric metric-small">
            <span className="metric-label">Utilization</span>
            <span className="metric-value">
              {((feasibility.buildableAreaSqft / feasibility.plotAreaSqft) * 100).toFixed(1)}
              <span className="unit">%</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
