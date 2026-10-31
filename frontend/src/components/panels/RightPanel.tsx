import { useSiteStore } from '../../store/siteStore';
import { SunTab } from './tabs/SunTab';
import { CapacityTab } from './tabs/CapacityTab';
import { SiteInfoTab } from './tabs/SiteInfoTab';
import type { RightPanelTab } from '../../types';

const TABS: RightPanelTab[] = ['CAPACITY', 'SUN', 'SITE'];

export function RightPanel() {
  const rightTab = useSiteStore((s) => s.rightTab);
  const setRightTab = useSiteStore((s) => s.setRightTab);

  return (
    <aside className="panel-right" id="panel-right">
      <div className="panel-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`panel-tab ${rightTab === tab ? 'active' : ''}`}
            onClick={() => setRightTab(tab)}
            id={`tab-right-${tab.toLowerCase()}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="panel-content">
        {rightTab === 'CAPACITY' && <CapacityTab />}
        {rightTab === 'SUN' && <SunTab />}
        {rightTab === 'SITE' && <SiteInfoTab />}
      </div>
    </aside>
  );
}
