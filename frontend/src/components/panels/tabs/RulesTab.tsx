import { useSiteStore } from '../../../store/siteStore';

export function RulesTab() {
  const zoning = useSiteStore((s) => s.zoning);
  const site = useSiteStore((s) => s.site);

  return (
    <div>
      <div className="panel-section">
        <div className="panel-section-title">JURISDICTION</div>
        <div className="metric metric-small">
          <span className="metric-label">Regulation Profile</span>
          <span className="metric-value" style={{ fontSize: 14 }}>
            {zoning.regulationProfile}
          </span>
        </div>
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <span className="rule-badge">Preliminary Assumption</span>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">SETBACKS</div>

        <div className="rule-row">
          <span className="rule-label">Front Setback</span>
          <span className="rule-value">{zoning.frontSetback} ft</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Rear Setback</span>
          <span className="rule-value">{zoning.rearSetback} ft</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Side Setback (Left)</span>
          <span className="rule-value">{zoning.sideSetbackLeft} ft</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Side Setback (Right)</span>
          <span className="rule-value">{zoning.sideSetbackRight} ft</span>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">DEVELOPMENT CONTROLS</div>

        <div className="rule-row">
          <span className="rule-label">Road Width</span>
          <span className="rule-value">{site.roadWidth} ft</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Maximum FAR</span>
          <span className="rule-value">{zoning.maxFAR}</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Maximum Height</span>
          <span className="rule-value">{zoning.maxHeight} m</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Parking Ratio</span>
          <span className="rule-value">1 / {zoning.parkingRatio} sq.ft</span>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">AUTHORITY</div>
        <div className="rule-row">
          <span className="rule-label">Authority</span>
          <span className="rule-value">{zoning.authority}</span>
        </div>
        <div className="rule-row">
          <span className="rule-label">Jurisdiction</span>
          <span className="rule-value">{zoning.jurisdiction}</span>
        </div>
      </div>

      <div className="disclaimer">
        <strong>Disclaimer:</strong> Regulatory values shown are preliminary assumptions 
        for demonstration purposes only. They do not represent verified statutory entitlements 
        or approved development rights. Actual rules must be independently verified with 
        GHMC/HMDA and relevant authorities before any acquisition or development decisions.
      </div>
    </div>
  );
}
