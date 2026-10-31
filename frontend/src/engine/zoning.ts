/* ─── Zoning Rules Engine ─── */
import type { ZoningRules } from '../types';

/**
 * Hyderabad preliminary zoning assumptions.
 * IMPORTANT: These are demonstration/preliminary values only.
 * They are NOT verified statutory entitlements.
 * Actual development rights must be independently verified
 * with GHMC/HMDA and project professionals.
 */
const HYDERABAD_DEFAULT_RULES: ZoningRules = {
  jurisdiction: 'Hyderabad',
  authority: 'GHMC / HMDA',
  regulationProfile: 'GHMC / HMDA Preliminary',
  frontSetback: 10, // feet
  rearSetback: 5,   // feet
  sideSetbackLeft: 5,  // feet
  sideSetbackRight: 5, // feet
  maxHeight: 60,  // meters
  maxFAR: 2.5,
  parkingRatio: 500, // 1 space per 500 sqft saleable area
  isVerified: false,
};

/** Road-width-based setback adjustments (preliminary assumptions) */
interface RoadWidthRule {
  minRoadWidth: number; // feet
  maxRoadWidth: number;
  frontSetback: number;
  sideSetback: number;
  rearSetback: number;
  maxFAR: number;
}

const HYDERABAD_ROAD_RULES: RoadWidthRule[] = [
  { minRoadWidth: 0,  maxRoadWidth: 20,  frontSetback: 6,  sideSetback: 3,  rearSetback: 3,  maxFAR: 1.75 },
  { minRoadWidth: 20, maxRoadWidth: 30,  frontSetback: 8,  sideSetback: 4,  rearSetback: 4,  maxFAR: 2.0 },
  { minRoadWidth: 30, maxRoadWidth: 40,  frontSetback: 10, sideSetback: 5,  rearSetback: 5,  maxFAR: 2.5 },
  { minRoadWidth: 40, maxRoadWidth: 60,  frontSetback: 12, sideSetback: 6,  rearSetback: 6,  maxFAR: 3.0 },
  { minRoadWidth: 60, maxRoadWidth: 80,  frontSetback: 15, sideSetback: 8,  rearSetback: 8,  maxFAR: 3.5 },
  { minRoadWidth: 80, maxRoadWidth: 1000, frontSetback: 18, sideSetback: 10, rearSetback: 10, maxFAR: 4.0 },
];

/**
 * Get zoning rules for a jurisdiction and road width.
 * Currently only supports Hyderabad. Designed to be extensible.
 */
export function getZoningRules(jurisdiction: string, roadWidth: number): ZoningRules {
  if (jurisdiction.toUpperCase() !== 'HYDERABAD') {
    // Return Hyderabad defaults as fallback for MVP
    return { ...HYDERABAD_DEFAULT_RULES };
  }

  const rule = HYDERABAD_ROAD_RULES.find(
    r => roadWidth >= r.minRoadWidth && roadWidth < r.maxRoadWidth
  ) || HYDERABAD_ROAD_RULES[2]; // default to 30-40ft rule

  return {
    ...HYDERABAD_DEFAULT_RULES,
    frontSetback: rule.frontSetback,
    rearSetback: rule.rearSetback,
    sideSetbackLeft: rule.sideSetback,
    sideSetbackRight: rule.sideSetback,
    maxFAR: rule.maxFAR,
  };
}

/** Get all available jurisdictions */
export function getJurisdictions(): string[] {
  return ['Hyderabad'];
}

export { HYDERABAD_DEFAULT_RULES };
