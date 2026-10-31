import { useSiteStore } from '../../store/siteStore';
import { SiteTab } from './tabs/SiteTab';
import { RulesTab } from './tabs/RulesTab';
import { BuildingTab } from './tabs/BuildingTab';
import { FinanceTab } from './tabs/FinanceTab';
import type { LeftPanelTab } from '../../types';

const TABS: LeftPanelTab[] = ['SITE', 'RULES', 'BUILDING', 'FINANCE'];

export function LeftPanel() {
  const leftTab = useSiteStore((s) => s.leftTab);
  const setLeftTab = useSiteStore((s) => s.setLeftTab);

  return (
    <aside className="panel-left" id="panel-left">
      <div className="panel-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`panel-tab ${leftTab === tab ? 'active' : ''}`}
            onClick={() => setLeftTab(tab)}
            id={`tab-left-${tab.toLowerCase()}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="panel-content">
        {leftTab === 'SITE' && <SiteTab />}
        {leftTab === 'RULES' && <RulesTab />}
        {leftTab === 'BUILDING' && <BuildingTab />}
        {leftTab === 'FINANCE' && <FinanceTab />}
      </div>
    </aside>
  );
}
