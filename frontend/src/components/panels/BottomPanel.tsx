import { useSiteStore } from '../../store/siteStore';
import { formatNumber, formatIndianCurrency } from '../../engine/finance';

export function BottomPanel() {
  const feasibility = useSiteStore((s) => s.feasibility);
  const bottomExpanded = useSiteStore((s) => s.bottomExpanded);
  const toggleBottom = useSiteStore((s) => s.toggleBottom);

  if (!feasibility) return null;

  const marginClass =
    feasibility.marginPercent >= 25 ? 'positive' :
    feasibility.marginPercent >= 10 ? 'warning' : 'critical';

  return (
    <div
      className={`bottom-panel ${bottomExpanded ? 'bottom-expanded' : 'bottom-collapsed'}`}
      id="bottom-panel"
    >
      <div className="bottom-summary" onClick={toggleBottom}>
        <div className="bottom-metrics">
          <div className="bottom-metric">
            <span className="bottom-metric-label">Estimated Revenue</span>
            <span className="bottom-metric-value">
              {formatIndianCurrency(feasibility.estimatedRevenue)}
            </span>
          </div>
          <div className="bottom-metric">
            <span className="bottom-metric-label">Development Cost</span>
            <span className="bottom-metric-value">
              {formatIndianCurrency(feasibility.totalDevelopmentCost)}
            </span>
          </div>
          <div className="bottom-metric">
            <span className="bottom-metric-label">Estimated Profit</span>
            <span className={`bottom-metric-value ${feasibility.estimatedProfit >= 0 ? 'positive' : 'critical'}`}>
              {formatIndianCurrency(feasibility.estimatedProfit)}
            </span>
          </div>
          <div className="bottom-metric">
            <span className="bottom-metric-label">Margin</span>
            <span className={`bottom-metric-value ${marginClass}`}>
              {feasibility.marginPercent.toFixed(1)}%
            </span>
          </div>
          <div className="bottom-metric">
            <span className="bottom-metric-label">Saleable Area</span>
            <span className="bottom-metric-value">
              {formatNumber(feasibility.saleableArea)} sq.ft
            </span>
          </div>
        </div>

        <button
          type="button"
          className="bottom-expand-btn"
          id="btn-expand-bottom"
          onClick={(e) => {
            e.stopPropagation();
            toggleBottom();
          }}
        >
          {bottomExpanded ? 'Collapse' : 'Expand Acquisition Analysis'}
          <span className="bottom-expand-icon">▼</span>
        </button>
      </div>

      {bottomExpanded && (
        <div className="bottom-detail">
          <div className="detail-grid">
            <div>
              <div className="detail-section-title">SITE & GEOMETRY</div>
              <div className="detail-row">
                <span className="detail-label">Plot Area</span>
                <span className="detail-value">{formatNumber(feasibility.plotAreaSqft)} sq.ft</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Buildable Area</span>
                <span className="detail-value">{formatNumber(feasibility.buildableAreaSqft)} sq.ft</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gross Floor Area</span>
                <span className="detail-value">{formatNumber(feasibility.grossFloorArea)} sq.ft</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Saleable Area</span>
                <span className="detail-value">{formatNumber(feasibility.saleableArea)} sq.ft</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Floors</span>
                <span className="detail-value">{feasibility.floors}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Building Height</span>
                <span className="detail-value">{feasibility.buildingHeightM.toFixed(1)} m</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Parking Spaces</span>
                <span className="detail-value">{feasibility.parkingSpaces}</span>
              </div>
            </div>

            <div>
              <div className="detail-section-title">FINANCIAL FEASIBILITY</div>
              <div className="detail-row">
                <span className="detail-label">Land Cost</span>
                <span className="detail-value">{formatIndianCurrency(feasibility.landCost)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Construction Cost</span>
                <span className="detail-value">{formatIndianCurrency(feasibility.constructionCost)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Additional Costs</span>
                <span className="detail-value">{formatIndianCurrency(feasibility.additionalCost)}</span>
              </div>
              <div className="detail-row" style={{ borderTop: '1px solid var(--surface-border)', paddingTop: 8, marginTop: 4 }}>
                <span className="detail-label" style={{ fontWeight: 600 }}>Total Development Cost</span>
                <span className="detail-value">{formatIndianCurrency(feasibility.totalDevelopmentCost)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estimated Revenue</span>
                <span className="detail-value" style={{ color: 'var(--positive)' }}>{formatIndianCurrency(feasibility.estimatedRevenue)}</span>
              </div>
              <div className="detail-row" style={{ borderTop: '1px solid var(--surface-border)', paddingTop: 8, marginTop: 4 }}>
                <span className="detail-label" style={{ fontWeight: 600 }}>Estimated Profit</span>
                <span className="detail-value" style={{ color: feasibility.estimatedProfit >= 0 ? 'var(--positive)' : 'var(--critical)' }}>
                  {formatIndianCurrency(feasibility.estimatedProfit)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label" style={{ fontWeight: 600 }}>Development Margin</span>
                <span className="detail-value" style={{ color: feasibility.marginPercent >= 25 ? 'var(--positive)' : feasibility.marginPercent >= 10 ? 'var(--warning)' : 'var(--critical)' }}>
                  {feasibility.marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <div className="detail-section-title">DISCLAIMER</div>
              <div className="disclaimer" style={{ marginTop: 0 }}>
                <strong>Preliminary feasibility estimate — not a statutory approval.</strong>
                <br /><br />
                Regulatory assumptions used in this analysis are preliminary and must be independently 
                verified with the applicable authorities (GHMC/HMDA) and project professionals before 
                any acquisition or development decisions. Financial projections are indicative only and 
                do not constitute investment advice.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
