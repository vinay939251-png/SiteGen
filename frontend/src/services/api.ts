/**
 * SiteGen API Client — Connects React UI to the FastAPI/PostgreSQL backend
 */
import type { Site, FeasibilityResult, SavedScenario } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface BackendHealth {
  status: string;
  service: string;
  version: string;
  jurisdiction: string;
}

export const api = {
  /** Check if the backend is reachable */
  async checkHealth(): Promise<BackendHealth | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Save a site plot to the backend database */
  async saveSite(site: Site): Promise<any | null> {
    try {
      const payload = {
        name: site.name,
        address: site.address,
        latitude: site.coordinates.lat,
        longitude: site.coordinates.lng,
        boundary: site.boundary,
        area_sqft: site.areaSqft,
        area_sqm: site.areaSqm,
        perimeter: site.perimeter,
        width: site.dimensions.width,
        depth: site.dimensions.depth,
        road_width: site.roadWidth,
        land_price_total: site.landPriceTotal,
      };
      const res = await fetch(`${API_BASE_URL}/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Fetch saved sites from the backend database */
  async getSites(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/sites`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /** Request server-side zoning rules for Hyderabad */
  async getZoningRules(roadWidth: number, jurisdiction: string = 'Hyderabad'): Promise<any | null> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/zoning/rules?jurisdiction=${encodeURIComponent(jurisdiction)}&road_width=${roadWidth}`
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Calculate feasibility on the backend */
  async calculateFeasibility(params: {
    plot_width: number;
    plot_depth: number;
    plot_area_sqft: number;
    road_width: number;
    floors: number;
    floor_height: number;
    target_far: number;
    efficiency: number;
    land_cost: number;
    construction_cost_per_sqft: number;
    selling_price_per_sqft: number;
    additional_cost_percent: number;
    parking_cost_per_space?: number;
  }): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/feasibility/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Save scenario to backend database */
  async saveScenario(scenario: SavedScenario): Promise<any | null> {
    try {
      const payload = {
        id: scenario.id,
        name: scenario.name,
        typology: scenario.building.typology,
        floors: scenario.building.floors,
        floor_height: scenario.building.floorHeight,
        target_far: scenario.building.targetFAR,
        efficiency: scenario.building.efficiency,
        land_cost: scenario.finance.landCost,
        construction_cost_per_sqft: scenario.finance.constructionCostPerSqft,
        selling_price_per_sqft: scenario.finance.sellingPricePerSqft,
        additional_cost_percent: scenario.finance.additionalCostPercent,
        site_snapshot: scenario.site,
        feasibility_result: scenario.feasibility,
      };
      const res = await fetch(`${API_BASE_URL}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Fetch scenarios from backend database */
  async getScenarios(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/scenarios`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /** Delete scenario from backend database */
  async deleteScenario(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/scenarios/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

