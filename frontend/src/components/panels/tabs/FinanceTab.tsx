import { useMemo } from 'react';
import { useSiteStore } from '../../../store/siteStore';
import { formatIndianCurrency } from '../../../engine/finance';

export function FinanceTab() {
  const finance = useSiteStore((s) => s.finance);
  const setFinance = useSiteStore((s) => s.setFinance);
  const feasibility = useSiteStore((s) => s.feasibility);

  const handleChange = (field: string, value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setFinance({ [field]: num });
    }
  };

  // ─── Financial Sensitivity Stress Test ───
  // Variations in Selling Price (-10%, Base, +10%) vs Construction Cost (-10%, Base, +10%)
  const sensitivityMatrix = useMemo(() => {
    if (!feasibility) return [];

    const priceMultipliers = [
      { label: '-10%', mult: 0.9 },
      { label: 'Base', mult: 1.0 },
      { label: '+10%', mult: 1.1 },
    ];

    const costMultipliers = [
      { label: '-10%', mult: 0.9 },
      { label: 'Base', mult: 1.0 },
      { label: '+10%', mult: 1.1 },
    ];

    return costMultipliers.map((cm) => {
      const row = priceMultipliers.map((pm) => {
        const testCostPerSqft = finance.constructionCostPerSqft * cm.mult;
        const testPricePerSqft = finance.sellingPricePerSqft * pm.mult;

        const constrCost = feasibility.grossFloorArea * testCostPerSqft;
        const addCost = constrCost * (finance.additionalCostPercent / 100);
        const parkingCost = feasibility.parkingSpaces * finance.parkingCostPerSpace;
        const totalDevCost = finance.landCost + constrCost + addCost + parkingCost;

        const rev = feasibility.saleableArea * testPricePerSqft;
        const profit = rev - totalDevCost;
        const margin = rev > 0 ? (profit / rev) * 100 : 0;

        return {
          costLabel: cm.label,
          priceLabel: pm.label,
          pricePerSqft: testPricePerSqft,
          costPerSqft: testCostPerSqft,
          profit,
          margin,
        };
      });
      return { costLabel: cm.label, row };
    });
  }, [finance, feasibility]);

  return (
    <div>
      {/* ─── Land Acquisition Cost ─── */}
      <div className="panel-section">
        <div className="panel-section-title">LAND ACQUISITION</div>
        <div className="input-group">
          <label className="input-label">
            Total Land Cost
            <span className="tooltip-icon" data-tooltip="Total purchase cost of the parcel">?</span>
          </label>
          <div className="input-unit">
            <input
              className="input-field"
              type="number"
              value={finance.landCost}
              onChange={(e) => handleChange('landCost', e.target.value)}
              id="input-land-cost"
            />
            <span className="input-unit-label">₹</span>
          </div>
        </div>
      </div>

      {/* ─── Construction Cost ─── */}
      <div className="panel-section">
        <div className="panel-section-title">CONSTRUCTION EXPENDITURE</div>
        <div className="input-group">
          <label className="input-label">
            Construction Cost per sq.ft
            <span className="tooltip-icon" data-tooltip="Direct construction cost including civil, MEP and finishes">?</span>
          </label>
          <div className="input-unit">
            <input
              className="input-field"
              type="number"
              value={finance.constructionCostPerSqft}
              onChange={(e) => handleChange('constructionCostPerSqft', e.target.value)}
              id="input-construction-cost"
            />
            <span className="input-unit-label">₹/sq.ft</span>
          </div>
        </div>

        {/* Quick Hyderabad Construction Cost Presets */}
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {[
            { label: 'Economy (₹1.8k)', val: 1800 },
            { label: 'Standard (₹2.2k)', val: 2200 },
            { label: 'Premium (₹3.0k)', val: 3000 },
          ].map((cp) => (
            <button
              key={cp.label}
              type="button"
              className="btn btn-sm"
              style={{
                fontSize: 10,
                padding: '2px 6px',
                flex: 1,
                background: finance.constructionCostPerSqft === cp.val ? 'var(--accent-blue)' : 'var(--surface-primary)',
              }}
              onClick={() => setFinance({ constructionCostPerSqft: cp.val })}
            >
              {cp.label}
            </button>
          ))}
        </div>

        <div className="input-group" style={{ marginTop: 'var(--space-sm)' }}>
          <label className="input-label">Parking Cost per Space</label>
          <div className="input-unit">
            <input
              className="input-field"
              type="number"
              value={finance.parkingCostPerSpace}
              onChange={(e) => handleChange('parkingCostPerSpace', e.target.value)}
              id="input-parking-cost"
            />
            <span className="input-unit-label">₹</span>
          </div>
        </div>
      </div>

      {/* ─── Expected Revenue & Realization ─── */}
      <div className="panel-section">
        <div className="panel-section-title">REVENUE REALIZATION</div>
        <div className="input-group">
          <label className="input-label">
            Expected Selling Price per sq.ft
            <span className="tooltip-icon" data-tooltip="Projected market sales realization per sq.ft of saleable area">?</span>
          </label>
          <div className="input-unit">
            <input
              className="input-field"
              type="number"
              value={finance.sellingPricePerSqft}
              onChange={(e) => handleChange('sellingPricePerSqft', e.target.value)}
              id="input-selling-price"
            />
            <span className="input-unit-label">₹/sq.ft</span>
          </div>
        </div>

        {/* Quick Hyderabad Micro-Market Selling Prices */}
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {[
            { label: 'Tellapur (₹5.5k)', val: 5500 },
            { label: 'Gachibowli (₹7.5k)', val: 7500 },
            { label: 'HITEC (₹9.5k)', val: 9500 },
            { label: 'Kokapet (₹12k)', val: 12000 },
          ].map((sp) => (
            <button
              key={sp.label}
              type="button"
              className="btn btn-sm"
              style={{
                fontSize: 10,
                padding: '2px 4px',
                flex: 1,
                background: finance.sellingPricePerSqft === sp.val ? 'var(--accent-blue)' : 'var(--surface-primary)',
              }}
              onClick={() => setFinance({ sellingPricePerSqft: sp.val })}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Overhead & Contingency ─── */}
      <div className="panel-section">
        <div className="panel-section-title">CONTINGENCY & APPROVALS</div>
        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">Approvals, Consultants & Misc</span>
            <span className="slider-value">
              {finance.additionalCostPercent}<span className="unit">%</span>
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={finance.additionalCostPercent}
            onChange={(e) => handleChange('additionalCostPercent', e.target.value)}
            id="slider-additional-cost"
          />
          <div className="slider-ticks">
            <span>2%</span>
            <span>20%</span>
          </div>
        </div>
      </div>

      {/* ─── Financial Sensitivity Matrix ─── */}
      <div className="panel-section" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: 8 }}>
        <div className="panel-section-title" style={{ color: '#4C9EEB', marginBottom: 6 }}>
          ⚡ SENSITIVITY STRESS TEST (MARGIN %)
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-tertiary)', margin: '0 0 8px 0' }}>
          Simulates ROI margin variance across market price swings vs construction cost inflation.
        </p>

        <table style={{ width: '100%', fontSize: 10, textAlign: 'center', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ color: 'var(--text-tertiary)', fontSize: 9, padding: '4px' }}>Cost \ Price</th>
              <th style={{ color: '#93c5fd', padding: '4px' }}>-10% Price</th>
              <th style={{ color: '#fff', padding: '4px' }}>Base Price</th>
              <th style={{ color: '#86efac', padding: '4px' }}>+10% Price</th>
            </tr>
          </thead>
          <tbody>
            {sensitivityMatrix.map((item, idx) => (
              <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ color: 'var(--text-secondary)', fontWeight: 600, padding: '6px 2px' }}>
                  {item.costLabel} Cost
                </td>
                {item.row.map((cell, cIdx) => {
                  const isPositive = cell.margin >= 25;
                  const isWarning = cell.margin >= 15 && cell.margin < 25;
                  const bg = isPositive
                    ? 'rgba(61, 214, 140, 0.15)'
                    : isWarning
                    ? 'rgba(232, 168, 56, 0.15)'
                    : 'rgba(232, 84, 84, 0.15)';
                  const fg = isPositive
                    ? '#3DD68C'
                    : isWarning
                    ? '#E8A838'
                    : '#E85454';

                  return (
                    <td key={cIdx} style={{ padding: '4px' }}>
                      <div
                        style={{
                          background: bg,
                          color: fg,
                          padding: '4px 6px',
                          borderRadius: 4,
                          fontWeight: 700,
                          fontSize: 10,
                        }}
                        title={`Profit: ${formatIndianCurrency(cell.profit)}`}
                      >
                        {cell.margin.toFixed(1)}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="disclaimer" style={{ marginTop: 'var(--space-md)' }}>
        <strong>Note:</strong> Financial calculations model pre-tax EBITDA margins. Values do not incorporate land transfer taxes, stamp duties, or debt financing interest expense.
      </div>
    </div>
  );
}
