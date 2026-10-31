import { useSiteStore } from '../../store/siteStore';
import { generatePDFReport } from '../../services/pdfExport';

export function TopBar() {
  const isDemoMode = useSiteStore((s) => s.isDemoMode);
  const backendOnline = useSiteStore((s) => s.backendOnline);
  const site = useSiteStore((s) => s.site);
  const zoning = useSiteStore((s) => s.zoning);
  const building = useSiteStore((s) => s.building);
  const feasibility = useSiteStore((s) => s.feasibility);

  const handleExportPDF = async () => {
    if (!feasibility) return;
    await generatePDFReport(site, zoning, building, feasibility);
  };

  const handleReset = () => {
    // Reload the page to reset all state to demo defaults
    window.location.reload();
  };

  const scenarios = useSiteStore((s) => s.scenarios);
  const setScenarioModalOpen = useSiteStore((s) => s.setScenarioModalOpen);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">SITEGEN</span>
        <span className="topbar-subtitle">Land Feasibility Intelligence</span>
      </div>

      <div className="topbar-center">
        <span className="topbar-jurisdiction">Hyderabad, Telangana</span>
        <span className="topbar-badge">PRELIMINARY ANALYSIS</span>
        {backendOnline ? (
          <span
            style={{
              fontSize: 10,
              color: '#3DD68C',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'rgba(61, 214, 140, 0.1)',
              border: '1px solid rgba(61, 214, 140, 0.25)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3DD68C', display: 'inline-block' }}></span>
            API ONLINE
          </span>
        ) : (
          isDemoMode && <span className="topbar-demo">LOCAL MODE</span>
        )}
      </div>

      <div className="topbar-actions">
        <button
          className="btn btn-sm"
          id="btn-scenarios"
          title="Compare and manage saved development scenarios"
          onClick={() => setScenarioModalOpen(true)}
          style={{ position: 'relative' }}
        >
          📋 Scenarios
          {scenarios.length > 0 && (
            <span
              style={{
                marginLeft: 5,
                background: 'var(--accent-blue)',
                color: '#fff',
                fontSize: 9,
                padding: '1px 5px',
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              {scenarios.length}
            </span>
          )}
        </button>
        <button className="btn btn-sm" id="btn-reset" title="Reset all parameters" onClick={handleReset}>
          ↻ Reset
        </button>
        <button className="btn btn-sm btn-primary" id="btn-export" title="Export PDF report" onClick={handleExportPDF}>
          ⬇ Export PDF
        </button>
      </div>
    </header>
  );
}
