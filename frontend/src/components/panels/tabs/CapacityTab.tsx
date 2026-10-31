import { useMemo } from 'react';
import { useSiteStore } from '../../../store/siteStore';
import { formatNumber, formatIndianCurrency } from '../../../engine/finance';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

const CHART_COLORS = {
  plot: '#3DD68C',
  buildable: '#4C9EEB',
  gfa: '#7C6BEF',
  saleable: '#E8A838',
  land: '#E85454',
  construction: '#4C9EEB',
  other: '#8B929A',
  revenue: '#3DD68C',
  profit: '#E8A838',
};

export function CapacityTab() {
  const feasibility = useSiteStore((s) => s.feasibility);
  const indicators = useSiteStore((s) => s.indicators);

  const areaData = useMemo(() => {
    if (!feasibility) return [];
    return [
      { name: 'Plot', value: feasibility.plotAreaSqft, color: CHART_COLORS.plot },
      { name: 'Buildable', value: feasibility.buildableAreaSqft, color: CHART_COLORS.buildable },
      { name: 'GFA', value: feasibility.grossFloorArea, color: CHART_COLORS.gfa },
      { name: 'Saleable', value: feasibility.saleableArea, color: CHART_COLORS.saleable },
    ];
  }, [feasibility]);

  const financeData = useMemo(() => {
    if (!feasibility) return [];
    return [
      { name: 'Land', value: feasibility.landCost, color: CHART_COLORS.land },
      { name: 'Construction', value: feasibility.constructionCost, color: CHART_COLORS.construction },
      { name: 'Other', value: feasibility.additionalCost, color: CHART_COLORS.other },
      { name: 'Revenue', value: feasibility.estimatedRevenue, color: CHART_COLORS.revenue },
    ];
  }, [feasibility]);

  if (!feasibility) return <div style={{ padding: 16, color: 'var(--text-tertiary)', fontSize: 12 }}>Calculating...</div>;

  return (
    <div>
      <div className="panel-section">
        <div className="panel-section-title">SITE CAPACITY</div>
        <div className="metric">
          <span className="metric-label">Gross Floor Area</span>
          <span className="metric-value">
            {formatNumber(feasibility.grossFloorArea)}
            <span className="unit">sq.ft</span>
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Saleable Area</span>
          <span className="metric-value">
            {formatNumber(feasibility.saleableArea)}
            <span className="unit">sq.ft</span>
          </span>
        </div>
        <div className="metric-row">
          <div className="metric metric-small">
            <span className="metric-label">Parking</span>
            <span className="metric-value">
              {feasibility.parkingSpaces}
              <span className="unit"> spaces</span>
            </span>
          </div>
          <div className="metric metric-small">
            <span className="metric-label">Height</span>
            <span className="metric-value">
              {feasibility.buildingHeightM.toFixed(1)}
              <span className="unit"> m</span>
            </span>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="chart-container">
          <div className="chart-title">AREA BREAKDOWN</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={areaData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10, fill: '#8B929A' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1C2026',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                  color: '#F0F2F5',
                }}
                formatter={(value: number) => [formatNumber(value) + ' sq.ft', '']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                {areaData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-title">FINANCIAL BREAKDOWN</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={financeData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: '#8B929A' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1C2026',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                  color: '#F0F2F5',
                }}
                formatter={(value: number) => [formatIndianCurrency(value), '']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                {financeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">FEASIBILITY INDICATORS</div>
        {indicators.map((ind, i) => (
          <div key={i} className={`indicator ${ind.status}`}>
            <div className="indicator-dot" />
            <div className="indicator-text">
              <span className="indicator-label">{ind.label}</span>
              <span className="indicator-desc">{ind.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
