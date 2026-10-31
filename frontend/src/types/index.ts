/* ─── SiteGen Type System ─── */

/** 2D point coordinate */
export interface Point2D {
  x: number;
  y: number;
}

/** Geographic coordinate */
export interface GeoCoord {
  lat: number;
  lng: number;
}

/** Plot boundary as array of 2D points (local coordinates in feet) */
export type Polygon = Point2D[];

/** Site information */
export interface Site {
  name: string;
  address: string;
  coordinates: GeoCoord;
  boundary: Polygon;
  areaSqft: number;
  areaSqm: number;
  perimeter: number;
  dimensions: { width: number; depth: number };
  roadWidth: number;
  landPriceTotal: number;
}

/** Hyderabad zoning rules — configurable, not hardcoded */
export interface ZoningRules {
  jurisdiction: string;
  authority: string;
  regulationProfile: string;
  frontSetback: number;
  rearSetback: number;
  sideSetbackLeft: number;
  sideSetbackRight: number;
  maxHeight: number;
  maxFAR: number;
  parkingRatio: number; // sqft per parking space
  isVerified: false; // always false for MVP — preliminary assumptions
}

/** Building typology */
export type BuildingTypology =
  | 'Residential'
  | 'Apartment'
  | 'Villa'
  | 'Commercial'
  | 'Mixed Use'
  | 'Office';

/** Building parameters controlled by user */
export interface BuildingParameters {
  typology: BuildingTypology;
  floors: number;
  floorHeight: number; // meters
  targetFAR: number;
  efficiency: number; // 0-1
}

/** Financial inputs */
export interface FinancialInputs {
  landCost: number;
  constructionCostPerSqft: number;
  sellingPricePerSqft: number;
  additionalCostPercent: number;
  parkingCostPerSpace: number;
}

/** Computed feasibility result */
export interface FeasibilityResult {
  plotAreaSqft: number;
  buildableAreaSqft: number;
  buildablePolygon: Polygon;
  grossFloorArea: number;
  saleableArea: number;
  floors: number;
  buildingHeightM: number;
  parkingSpaces: number;
  landCost: number;
  constructionCost: number;
  additionalCost: number;
  totalDevelopmentCost: number;
  estimatedRevenue: number;
  estimatedProfit: number;
  marginPercent: number;
}

/** Sun/shadow analysis data */
export interface SunData {
  azimuth: number;
  altitude: number;
  date: Date;
  sunEnabled: boolean;
}

/** Feasibility indicator */
export interface FeasibilityIndicator {
  label: string;
  status: 'positive' | 'warning' | 'critical' | 'neutral';
  description: string;
}

/** View mode for 3D camera */
export type ViewMode = '3D' | 'TOP' | 'RESET';

/** Active tab in left panel */
export type LeftPanelTab = 'SITE' | 'RULES' | 'BUILDING' | 'FINANCE';

/** Active tab in right panel */
export type RightPanelTab = 'SUN' | 'CAPACITY' | 'SITE';

/** Building render style */
export type BuildingRenderStyle = 'GLASS' | 'SOLID' | 'WIREFRAME';

/** Urban context archetype for surrounding buildings */
export type UrbanArchetype =
  | 'AUTO'
  | 'SKYSCRAPERS'
  | 'TECH_CAMPUS'
  | 'LOW_RISE_VILLAS'
  | 'TOWNSHIP_CLUSTERS'
  | 'COMMERCIAL';

/** Hyderabad micro-market information */
export interface MicroMarketInfo {
  id: string;
  name: string;
  archetype: UrbanArchetype;
  typicalFloorsMin: number;
  typicalFloorsMax: number;
  typicalFAR: string;
  description: string;
  landmarkNames: string[];
}

/** Saved development scenario */
export interface SavedScenario {
  id: string;
  name: string;
  timestamp: number;
  site: Site;
  building: BuildingParameters;
  finance: FinancialInputs;
  feasibility: FeasibilityResult;
}

