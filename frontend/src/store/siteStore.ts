/* ─── SiteGen Central State Store (Zustand) ─── */
import { create } from 'zustand';
import type {
  Site,
  ZoningRules,
  BuildingParameters,
  FinancialInputs,
  FeasibilityResult,
  SunData,
  LeftPanelTab,
  RightPanelTab,
  ViewMode,
  BuildingTypology,
  SavedScenario,
  BuildingRenderStyle,
  UrbanArchetype,
} from '../types';
import { getZoningRules } from '../engine/zoning';
import { calculateFeasibility, generateIndicators } from '../engine/feasibility';
import type { FeasibilityIndicator } from '../types';
import { api } from '../services/api';

/** Load saved scenarios from localStorage */
const loadStoredScenarios = (): SavedScenario[] => {
  try {
    const raw = localStorage.getItem('sitegen_scenarios');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/** Demo Hyderabad plot */
const DEMO_SITE: Site = {
  name: 'Sample Hyderabad Plot',
  address: 'Gachibowli, Hyderabad, Telangana',
  coordinates: { lat: 17.4401, lng: 78.3489 },
  boundary: [
    { x: -40, y: -50 },
    { x: 40, y: -50 },
    { x: 40, y: 50 },
    { x: -40, y: 50 },
  ],
  areaSqft: 8000,
  areaSqm: 743,
  perimeter: 360,
  dimensions: { width: 80, depth: 100 },
  roadWidth: 30,
  landPriceTotal: 20000000,
};

const DEMO_BUILDING: BuildingParameters = {
  typology: 'Apartment',
  floors: 8,
  floorHeight: 3.2,
  targetFAR: 2.5,
  efficiency: 0.80,
};

const DEMO_FINANCE: FinancialInputs = {
  landCost: 20000000,
  constructionCostPerSqft: 2200,
  sellingPricePerSqft: 6500,
  additionalCostPercent: 8,
  parkingCostPerSpace: 200000,
};

interface SiteStore {
  // Data
  site: Site;
  zoning: ZoningRules;
  building: BuildingParameters;
  finance: FinancialInputs;
  feasibility: FeasibilityResult | null;
  indicators: FeasibilityIndicator[];
  sunData: SunData;
  scenarios: SavedScenario[];

  // 3D Scene View Controls
  showSurroundings: boolean;
  showSetbacks: boolean;
  showFloorPlates: boolean;
  buildingRenderStyle: BuildingRenderStyle;
  surroundingArchetype: UrbanArchetype;

  // UI State
  leftTab: LeftPanelTab;
  rightTab: RightPanelTab;
  viewMode: ViewMode;
  bottomExpanded: boolean;
  isDemoMode: boolean;
  isScenarioModalOpen: boolean;
  backendOnline: boolean;

  // Actions
  setSite: (site: Partial<Site>) => void;
  setDimensions: (width: number, depth: number) => void;
  setLocation: (address: string, lat: number, lng: number) => void;
  setRoadWidth: (width: number) => void;
  setBuilding: (params: Partial<BuildingParameters>) => void;
  setFinance: (inputs: Partial<FinancialInputs>) => void;
  setSunData: (data: Partial<SunData>) => void;
  setLeftTab: (tab: LeftPanelTab) => void;
  setRightTab: (tab: RightPanelTab) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleBottom: () => void;
  setScenarioModalOpen: (open: boolean) => void;

  // 3D Controls
  setShowSurroundings: (show: boolean) => void;
  setShowSetbacks: (show: boolean) => void;
  setShowFloorPlates: (show: boolean) => void;
  setBuildingRenderStyle: (style: BuildingRenderStyle) => void;
  setSurroundingArchetype: (archetype: UrbanArchetype) => void;

  // Scenarios
  saveScenario: (name: string) => void;
  loadScenario: (id: string) => void;
  deleteScenario: (id: string) => void;

  recalculate: () => void;
}

export const useSiteStore = create<SiteStore>((set, get) => ({
  // Initial data
  site: DEMO_SITE,
  zoning: getZoningRules('Hyderabad', DEMO_SITE.roadWidth),
  building: DEMO_BUILDING,
  finance: DEMO_FINANCE,
  feasibility: null,
  indicators: [],
  sunData: {
    azimuth: 180,
    altitude: 45,
    date: new Date(),
    sunEnabled: false,
  },
  scenarios: loadStoredScenarios(),

  // 3D Scene View Controls
  showSurroundings: true,
  showSetbacks: true,
  showFloorPlates: true,
  buildingRenderStyle: 'GLASS',
  surroundingArchetype: 'AUTO',

  // UI state
  leftTab: 'SITE',
  rightTab: 'CAPACITY',
  viewMode: '3D',
  bottomExpanded: false,
  isDemoMode: true,
  isScenarioModalOpen: false,
  backendOnline: false,

  // Actions
  setSite: (partial) => {
    set((state) => {
      const newSite = { ...state.site, ...partial };
      return { site: newSite };
    });
    get().recalculate();
  },

  setDimensions: (width, depth) => {
    const w = Math.max(10, Math.round(width));
    const d = Math.max(10, Math.round(depth));
    const areaSqft = w * d;
    const areaSqm = Math.round(areaSqft * 0.092903);
    const perimeter = 2 * (w + d);
    const boundary = [
      { x: -w / 2, y: -d / 2 },
      { x: w / 2, y: -d / 2 },
      { x: w / 2, y: d / 2 },
      { x: -w / 2, y: d / 2 },
    ];
    set((state) => ({
      site: {
        ...state.site,
        dimensions: { width: w, depth: d },
        areaSqft,
        areaSqm,
        perimeter,
        boundary,
      },
    }));
    get().recalculate();
  },

  setLocation: (address, lat, lng) => {
    set((state) => ({
      site: {
        ...state.site,
        address,
        coordinates: { lat, lng },
      },
    }));
    get().recalculate();
  },

  setRoadWidth: (width) => {
    set((state) => {
      const newSite = { ...state.site, roadWidth: width };
      const newZoning = getZoningRules('Hyderabad', width);
      return { site: newSite, zoning: newZoning };
    });
    get().recalculate();
  },

  setBuilding: (partial) => {
    set((state) => ({
      building: { ...state.building, ...partial },
    }));
    get().recalculate();
  },

  setFinance: (partial) => {
    set((state) => ({
      finance: { ...state.finance, ...partial },
    }));
    get().recalculate();
  },

  setSunData: (partial) => {
    set((state) => ({
      sunData: { ...state.sunData, ...partial },
    }));
  },

  setLeftTab: (tab) => set({ leftTab: tab }),
  setRightTab: (tab) => set({ rightTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleBottom: () => set((s) => ({ bottomExpanded: !s.bottomExpanded })),
  setScenarioModalOpen: (open) => set({ isScenarioModalOpen: open }),

  setShowSurroundings: (show) => set({ showSurroundings: show }),
  setShowSetbacks: (show) => set({ showSetbacks: show }),
  setShowFloorPlates: (show) => set({ showFloorPlates: show }),
  setBuildingRenderStyle: (style) => set({ buildingRenderStyle: style }),
  setSurroundingArchetype: (archetype) => set({ surroundingArchetype: archetype }),

  saveScenario: (name) => {
    const { site, building, finance, feasibility, scenarios } = get();
    if (!feasibility) return;

    const newScenario: SavedScenario = {
      id: `scen-${Date.now()}`,
      name: name.trim() || `Scenario ${scenarios.length + 1}`,
      timestamp: Date.now(),
      site: { ...site },
      building: { ...building },
      finance: { ...finance },
      feasibility: { ...feasibility },
    };

    const updated = [newScenario, ...scenarios];
    set({ scenarios: updated });
    try {
      localStorage.setItem('sitegen_scenarios', JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
    // Async sync to backend
    api.saveScenario(newScenario).catch(() => {});
  },

  loadScenario: (id) => {
    const { scenarios } = get();
    const target = scenarios.find((s) => s.id === id);
    if (!target) return;

    set({
      site: { ...target.site },
      building: { ...target.building },
      finance: { ...target.finance },
      zoning: getZoningRules('Hyderabad', target.site.roadWidth),
    });
    get().recalculate();
  },

  deleteScenario: (id) => {
    const { scenarios } = get();
    const updated = scenarios.filter((s) => s.id !== id);
    set({ scenarios: updated });
    try {
      localStorage.setItem('sitegen_scenarios', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    // Async delete from backend
    api.deleteScenario(id).catch(() => {});
  },

  recalculate: () => {
    const { site, zoning, building, finance } = get();
    const result = calculateFeasibility(site, zoning, building, finance);
    const indicators = generateIndicators(result);
    set({ feasibility: result, indicators });
  },
}));

// Initial calculation and backend sync
setTimeout(async () => {
  useSiteStore.getState().recalculate();
  
  // Probe backend
  const health = await api.checkHealth();
  if (health) {
    useSiteStore.setState({ backendOnline: true });
    // Pull any backend scenarios and merge
    try {
      const backendScens = await api.getScenarios();
      if (backendScens && backendScens.length > 0) {
        const local = useSiteStore.getState().scenarios;
        const mergedMap = new Map();
        local.forEach((s) => mergedMap.set(s.id, s));
        backendScens.forEach((bs: any) => {
          if (!mergedMap.has(bs.id)) {
            mergedMap.set(bs.id, {
              id: bs.id,
              name: bs.name,
              timestamp: new Date(bs.created_at).getTime(),
              site: bs.site_snapshot || useSiteStore.getState().site,
              building: {
                typology: bs.typology,
                floors: bs.floors,
                floorHeight: bs.floor_height,
                targetFAR: bs.target_far,
                efficiency: bs.efficiency,
              },
              finance: {
                landCost: bs.land_cost,
                constructionCostPerSqft: bs.construction_cost_per_sqft,
                sellingPricePerSqft: bs.selling_price_per_sqft,
                additionalCostPercent: bs.additional_cost_percent,
                parkingCostPerSpace: 200000,
              },
              feasibility: bs.feasibility_result,
            });
          }
        });
        useSiteStore.setState({ scenarios: Array.from(mergedMap.values()) });
      }
    } catch {
      // Ignore background sync errors
    }
  }
}, 0);
