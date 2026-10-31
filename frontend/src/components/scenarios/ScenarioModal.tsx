import { useState } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { formatNumber, formatIndianCurrency } from '../../engine/finance';

export function ScenarioModal() {
  const isOpen = useSiteStore((s) => s.isScenarioModalOpen);
  const setOpen = useSiteStore((s) => s.setScenarioModalOpen);
  const scenarios = useSiteStore((s) => s.scenarios);
  const saveScenario = useSiteStore((s) => s.saveScenario);
  const loadScenario = useSiteStore((s) => s.loadScenario);
  const deleteScenario = useSiteStore((s) => s.deleteScenario);

  const site = useSiteStore((s) => s.site);
  const building = useSiteStore((s) => s.building);
  const finance = useSiteStore((s) => s.finance);
  const feasibility = useSiteStore((s) => s.feasibility);

  const [scenarioName, setScenarioName] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim()) {
      saveScenario(`${building.typology} (${building.floors} Floors)`);
    } else {
      saveScenario(scenarioName.trim());
    }
    setScenarioName('');
  };

  const handleLoad = (id: string) => {
    loadScenario(id);
    setOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '88vh',
          background: '#0D1117',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0f2f5', margin: 0 }}>
              Scenario Comparison & Portfolio Underwriting
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Save multiple building scenarios for {site.name || 'this parcel'} and compare feasibility side-by-side.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            style={{ borderRadius: 20, width: 30, height: 30, padding: 0 }}
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Save Current Scenario Banner */}
        <div
          style={{
            padding: '12px 24px',
            background: 'rgba(59, 130, 246, 0.08)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600 }}>Save Current Design:</span>
          <form onSubmit={handleSave} style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input
              type="text"
              placeholder={`E.g. ${building.typology} (${building.floors} Floors, FAR ${building.targetFAR})`}
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="input-field"
              style={{ flex: 1, height: 30, fontSize: 12 }}
            />
            <button type="submit" className="btn btn-sm btn-primary" style={{ whiteSpace: 'nowrap', height: 30 }}>
              + Save Scenario
            </button>
          </form>
        </div>

        {/* Content Table */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', padding: '16px 24px' }}>
          {feasibility && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600 }}>METRIC</th>
                  <th style={{ padding: '8px 12px', color: '#4C9EEB', fontWeight: 700, background: 'rgba(76, 158, 235, 0.08)' }}>
                    CURRENT ACTIVE DESIGN
                  </th>
                  {scenarios.map((scen) => (
                    <th key={scen.id} style={{ padding: '8px 12px', color: '#f0f2f5', fontWeight: 700, minWidth: 160 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{scen.name}</span>
                        <button
                          type="button"
                          onClick={() => deleteScenario(scen.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, padding: '0 4px' }}
                          title="Delete scenario"
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 400 }}>
                        {new Date(scen.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Typology */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Typology</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f0f2f5', background: 'rgba(76, 158, 235, 0.05)' }}>
                    {building.typology}
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{s.building.typology}</td>
                  ))}
                </tr>

                {/* Floors & Height */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Floors & Height</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f0f2f5', background: 'rgba(76, 158, 235, 0.05)' }}>
                    {building.floors} floors ({feasibility.buildingHeightM.toFixed(1)} m)
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                      {s.building.floors} floors ({s.feasibility.buildingHeightM.toFixed(1)} m)
                    </td>
                  ))}
                </tr>

                {/* Target FAR */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Target FAR</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f0f2f5', background: 'rgba(76, 158, 235, 0.05)' }}>
                    {building.targetFAR.toFixed(2)}
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                      {s.building.targetFAR.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Gross Floor Area */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Gross Floor Area</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f0f2f5', background: 'rgba(76, 158, 235, 0.05)' }}>
                    {formatNumber(feasibility.grossFloorArea)} sq.ft
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                      {formatNumber(s.feasibility.grossFloorArea)} sq.ft
                    </td>
                  ))}
                </tr>

                {/* Saleable Area */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Saleable Area</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f0f2f5', background: 'rgba(76, 158, 235, 0.05)' }}>
                    {formatNumber(feasibility.saleableArea)} sq.ft
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                      {formatNumber(s.feasibility.saleableArea)} sq.ft
                    </td>
                  ))}
                </tr>

                {/* Construction Cost */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Construction Cost</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f0f2f5', background: 'rgba(76, 158, 235, 0.05)' }}>
                    {formatIndianCurrency(feasibility.constructionCost)}
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                      {formatIndianCurrency(s.feasibility.constructionCost)}
                    </td>
                  ))}
                </tr>

                {/* Total Development Cost */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Total Dev. Cost</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f0f2f5', background: 'rgba(76, 158, 235, 0.05)' }}>
                    {formatIndianCurrency(feasibility.totalDevelopmentCost)}
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                      {formatIndianCurrency(s.feasibility.totalDevelopmentCost)}
                    </td>
                  ))}
                </tr>

                {/* Estimated Revenue */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Estimated Revenue</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--accent-positive)', background: 'rgba(76, 158, 235, 0.05)' }}>
                    {formatIndianCurrency(feasibility.estimatedRevenue)}
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--accent-positive)' }}>
                      {formatIndianCurrency(s.feasibility.estimatedRevenue)}
                    </td>
                  ))}
                </tr>

                {/* Estimated Profit */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Estimated Net Profit</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: feasibility.estimatedProfit >= 0 ? 'var(--accent-positive)' : 'var(--critical)', background: 'rgba(76, 158, 235, 0.05)' }}>
                    {formatIndianCurrency(feasibility.estimatedProfit)}
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', fontWeight: 700, color: s.feasibility.estimatedProfit >= 0 ? 'var(--accent-positive)' : 'var(--critical)' }}>
                      {formatIndianCurrency(s.feasibility.estimatedProfit)}
                    </td>
                  ))}
                </tr>

                {/* Profit Margin % */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Profit Margin %</td>
                  <td style={{ padding: '8px 12px', fontWeight: 800, fontSize: 13, color: feasibility.marginPercent >= 25 ? 'var(--accent-positive)' : 'var(--warning)', background: 'rgba(76, 158, 235, 0.08)' }}>
                    {feasibility.marginPercent.toFixed(1)}%
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '8px 12px', fontWeight: 800, fontSize: 13, color: s.feasibility.marginPercent >= 25 ? 'var(--accent-positive)' : 'var(--warning)' }}>
                      {s.feasibility.marginPercent.toFixed(1)}%
                    </td>
                  ))}
                </tr>

                {/* Actions row */}
                <tr>
                  <td style={{ padding: '12px' }}></td>
                  <td style={{ padding: '12px', background: 'rgba(76, 158, 235, 0.05)' }}>
                    <span style={{ fontSize: 11, color: '#4C9EEB', fontWeight: 700 }}>● CURRENT ACTIVE</span>
                  </td>
                  {scenarios.map((s) => (
                    <td key={s.id} style={{ padding: '12px' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: 11, width: '100%', padding: '4px 8px' }}
                        onClick={() => handleLoad(s.id)}
                      >
                        ⚡ Apply in 3D
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
